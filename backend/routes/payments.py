import re
from datetime import datetime, timedelta
from datetime import timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models.payment import PaymentSession
from models.user import User
from routes.deps import get_current_user
from services.auth_service import (
    PLAN_RANK,
    ensure_active_subscription,
    get_next_month_start,
    get_plan_config,
    sanitize_user,
)


router = APIRouter(prefix="/payments", tags=["payments"])


def _to_utc_iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    else:
        value = value.astimezone(timezone.utc)
    return value.isoformat().replace("+00:00", "Z")


def normalize_frontend_base_url(value: str) -> str:
    raw = str(value or "").strip().rstrip("/")
    if raw.startswith("http://") or raw.startswith("https://"):
        return raw
    return ""


@router.post("/demo/create")
async def create_demo_payment(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    plan = str(payload.get("plan") or "").strip().upper()
    if plan not in {"PRO", "ENTERPRISE"}:
        raise HTTPException(status_code=400, detail="Demo payment is available for Popular and Custom plans only.")

    subscription = ensure_active_subscription(db, current_user.id)
    current_plan = str(subscription.plan or "FREE").upper()

    if PLAN_RANK[plan] <= PLAN_RANK[current_plan]:
        raise HTTPException(status_code=400, detail="This plan does not need payment for your current account.")

    frontend_base = normalize_frontend_base_url(payload.get("frontendBaseUrl"))
    if not frontend_base:
        frontend_base = normalize_frontend_base_url(payload.get("frontend_base_url"))
    if not frontend_base:
        frontend_base = "http://localhost:5173"

    payment_session_id = str(__import__("uuid").uuid4())
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    amount = int(get_plan_config(plan)["amount"])
    user_name = str(current_user.name or current_user.email or "FireReach User")
    payment_url = f"{frontend_base}/payment-demo/{payment_session_id}?noIntro=1"

    payment = PaymentSession(
        id=payment_session_id,
        userId=current_user.id,
        userName=user_name,
        plan=plan,
        amount=amount,
        status="pending",
        expiresAt=expires_at,
        paymentUrl=payment_url,
    )
    db.add(payment)
    db.commit()

    return {
        "paymentSessionId": payment_session_id,
        "userName": user_name,
        "plan": plan,
        "amount": amount,
        "expiresAt": _to_utc_iso(expires_at),
        "paymentUrl": payment_url,
        "qrValue": payment_url,
    }


@router.get("/demo/{payment_id}")
async def get_demo_payment(payment_id: str, db: Session = Depends(get_db)):
    payment = db.query(PaymentSession).filter(PaymentSession.id == str(payment_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found.")

    expired = datetime.utcnow() > payment.expiresAt
    status = "expired" if expired and payment.status == "pending" else payment.status

    return {
        "id": payment.id,
        "userName": payment.userName,
        "plan": payment.plan,
        "amount": payment.amount,
        "status": status,
        "expiresAt": _to_utc_iso(payment.expiresAt),
        "paymentUrl": payment.paymentUrl,
        "paidAt": _to_utc_iso(payment.paidAt),
    }


@router.post("/demo/{payment_id}/submit")
async def submit_demo_payment(payment_id: str, payload: dict, db: Session = Depends(get_db)):
    payment = db.query(PaymentSession).filter(PaymentSession.id == str(payment_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found.")

    payment_code = str(payload.get("paymentCode") or payload.get("payment_code") or "").strip()
    if not re.match(r"^\d{6}$", payment_code):
        raise HTTPException(status_code=400, detail="Enter any 6 digit demo code.")

    if datetime.utcnow() > payment.expiresAt:
        payment.status = "expired"
        db.commit()
        raise HTTPException(status_code=410, detail="Payment session expired. Please create a new one.")

    if payment.status == "paid":
        return {"status": "paid", "message": "Payment already submitted successfully."}

    next_config = get_plan_config(payment.plan)
    next_reset = get_next_month_start().replace(tzinfo=None)

    subscription = ensure_active_subscription(db, payment.userId)
    subscription.plan = payment.plan
    subscription.monthlyCredits = next_config["monthlyCredits"]
    subscription.creditsRemaining = next_config["monthlyCredits"]
    subscription.periodStart = datetime.utcnow()
    subscription.periodEnd = next_reset
    subscription.nextResetAt = next_reset

    payment.status = "paid"
    payment.paidAt = datetime.utcnow()
    db.commit()

    return {"status": "paid", "message": "Payment successful."}


@router.get("/demo/{payment_id}/status")
async def get_demo_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = db.query(PaymentSession).filter(PaymentSession.id == str(payment_id)).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment session not found.")

    if payment.userId != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden payment status request.")

    expired = datetime.utcnow() > payment.expiresAt
    status = "expired" if expired and payment.status == "pending" else payment.status
    if status != payment.status:
        payment.status = status
        db.commit()

    subscription = ensure_active_subscription(db, current_user.id)
    return {
        "status": status,
        "payment": {
            "id": payment.id,
            "plan": payment.plan,
            "amount": payment.amount,
            "expiresAt": _to_utc_iso(payment.expiresAt),
            "paidAt": _to_utc_iso(payment.paidAt),
        },
        "user": sanitize_user(current_user, subscription),
    }


@router.get("")
async def get_payment_history(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    safe_limit = max(1, min(100, int(limit or 20)))
    rows = (
        db.query(PaymentSession)
        .filter(PaymentSession.userId == current_user.id)
        .order_by(PaymentSession.createdAt.desc())
        .limit(safe_limit)
        .all()
    )

    return {
        "payments": [
            {
                "id": row.id,
                "userName": row.userName,
                "plan": row.plan,
                "amount": row.amount,
                "status": row.status,
                "paymentUrl": row.paymentUrl,
                "createdAt": _to_utc_iso(row.createdAt),
                "expiresAt": _to_utc_iso(row.expiresAt),
                "paidAt": _to_utc_iso(row.paidAt),
            }
            for row in rows
        ]
    }
