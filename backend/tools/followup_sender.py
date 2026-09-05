import re

from services.groq_client import generate_completion

def _normalize_sender_profile(profile: dict | None) -> dict:
    payload = profile if isinstance(profile, dict) else {}
    name = str(payload.get("name") or "").strip() or "Nikhil Kumar"
    email = str(payload.get("contactEmail") or payload.get("email") or "").strip() or "nikhil759100@gmail.com"
    phone = str(payload.get("phone") or "").strip() or "+91-7807946374"
    company = str(payload.get("company") or "").strip()
    role = str(payload.get("role") or "").strip()

    if role and company:
        title_line = f"{role}, {company}"
    elif company:
        title_line = company
    elif role:
        title_line = role
    else:
        title_line = "Founder, FireReach"

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "title_line": title_line,
    }


def _build_signature_block(profile: dict | None) -> str:
    sender = _normalize_sender_profile(profile)
    return f"""Best regards,
{sender['name']}
{sender['title_line']}
Phone: {sender['phone']}
Email: {sender['email']}"""


def _extract_subject_and_body(raw_text: str, fallback_subject: str) -> dict:
    text = str(raw_text or "").strip()
    if not text:
        return {"subject": fallback_subject, "body": ""}

    lines = text.splitlines()
    subject = fallback_subject
    body = text

    for index, line in enumerate(lines):
        trimmed = line.strip()
        if trimmed.lower().startswith("subject:"):
            subject = trimmed[len("subject:"):].strip() or fallback_subject
            body = "\n".join(lines[index + 1:]).strip()
            break

    if not body:
        body = text

    return {
        "subject": subject,
        "body": body,
    }


def _meeting_line(meeting_link: str) -> str:
    link = str(meeting_link or "").strip()
    if not link:
        return ""
    return f"If you'd like, we can also connect here: {link}"


def _day_prompt(day: int) -> dict:
    if day == 3:
        return {
            "subject_hint": "Re: ",
            "length_hint": "60-80 words",
            "style": "Short, friendly reminder. Reference the original email naturally. Tone warm and brief.",
            "fallback_subject": "Re: Quick follow-up from FireReach",
        }
    if day == 7:
        return {
            "subject_hint": "Following up — ",
            "length_hint": "80-100 words",
            "style": "Use a different angle. Mention a relevant signal or industry trend and add fresh value.",
            "fallback_subject": "Following up — a relevant signal for your team",
        }
    return {
        "subject_hint": "Last note — FireReach",
        "length_hint": "50-60 words",
        "style": "Final follow-up with low-pressure close. Respectful and concise.",
        "fallback_subject": "Last note — FireReach",
    }


def generate_followup_email(
    original_email: str,
    company_name: str,
    recipient_name: str,
    recipient_email: str,
    followup_day: int,
    signal_line: str,
    icp: str,
    meeting_link: str = "",
    sender_profile: dict | None = None,
) -> dict:
    day = int(followup_day)
    if day not in (3, 7, 14):
        raise ValueError("followup_day must be one of 3, 7, or 14")

    prompt_meta = _day_prompt(day)
    meeting_line = _meeting_line(meeting_link)
    signature_block = _build_signature_block(sender_profile)

    prompt = f"""
You are writing a B2B follow-up email for FireReach.

Recipient:
- Name: {recipient_name}
- Email: {recipient_email}
- Company: {company_name}

Original Email:
{original_email}

Signal / Trend to reference (if useful):
{signal_line}

ICP context:
{icp}

Follow-up timing:
- Day: {day}
- Style goal: {prompt_meta['style']}
- Subject requirement: {prompt_meta['subject_hint']}
- Length target: {prompt_meta['length_hint']}

Meeting link (optional):
{meeting_link}

Rules:
1. Output plain text only.
2. Start with: Subject: <subject>
3. Then one blank line, then email body.
4. Keep language natural and non-pushy.
5. If meeting link is provided, include this one-liner naturally before signature:
   {meeting_line if meeting_line else 'Skip meeting line if no link is provided.'}
6. Use this signature block exactly:
{signature_block}
"""

    generated = generate_completion(
        prompt=prompt,
        system_prompt="You are a precise B2B follow-up email writer. Output plain text only.",
        temperature=0.6,
        max_tokens=500,
    )

    parsed = _extract_subject_and_body(generated, prompt_meta["fallback_subject"])
    body = str(parsed.get("body", "")).strip()

    if meeting_line and meeting_line not in body:
        parts = re.split(r"\n\s*Best regards,", body, maxsplit=1, flags=re.IGNORECASE)
        if len(parts) == 2:
            body = f"{parts[0].rstrip()}\n\n{meeting_line}\n\nBest regards,{parts[1]}".strip()
        else:
            body = f"{body.rstrip()}\n\n{meeting_line}".strip()

    if "Best regards," not in body:
        body = f"{body.rstrip()}\n\n{signature_block}".strip()

    return {
        "subject": str(parsed.get("subject") or prompt_meta["fallback_subject"]).strip(),
        "body": body,
        "day": day,
    }
