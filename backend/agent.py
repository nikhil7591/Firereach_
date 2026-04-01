import asyncio
import json
import os
from urllib.parse import urlparse

import requests

from services.groq_client import generate_completion
from services.signal_verifier import verify_signals
from tools.email_finder import tool_email_finder
from tools.outreach_sender import send_prepared_email
from tools.outreach_sender import tool_outreach_automated_sender
from tools.research_analyst import tool_research_analyst
from tools.signal_harvester import tool_signal_harvester

STEP_DEFINITIONS = [
    ("step1", "Finding companies..."),
    ("step2", "Harvesting signals..."),
    ("step3", "Verifying signals..."),
    ("step4", "Analyzing research..."),
    ("step5", "Selecting best company..."),
    ("step6", "Finding emails..."),
    ("step7", "Sending outreach..."),
]

ANSI_RESET = "\033[0m"
ANSI_BOLD = "\033[1m"
ANSI_DIM = "\033[2m"
ANSI_BLUE = "\033[94m"
ANSI_GREEN = "\033[92m"
ANSI_YELLOW = "\033[93m"
ANSI_RED = "\033[91m"
ANSI_MAGENTA = "\033[95m"

GENERIC_INBOX_PREFIXES = {
    "info",
    "contact",
    "hello",
    "hi",
    "sales",
    "support",
    "team",
    "office",
    "admin",
    "careers",
    "jobs",
    "hr",
    "help",
    "enquiries",
    "inquiries",
    "marketing",
}

SIGNAL_WEIGHTS = {
    "S2": 20,
    "S1": 18,
    "S4": 17,
    "S3": 15,
    "S5": 15,
    "S6": 15,
}


def _extract_json_array(text: str) -> list:
    cleaned = str(text or "").strip()
    start = cleaned.find("[")
    end = cleaned.rfind("]")

    if start == -1 or end == -1 or end <= start:
        raise ValueError("LLM response did not contain a JSON array.")

    payload = cleaned[start:end + 1]
    return json.loads(payload)


def _normalize_website(website: str) -> str:
    value = str(website or "").strip()
    if not value:
        return ""
    if not value.startswith(("http://", "https://")):
        value = f"https://{value}"
    return value


def _domain_from_website(website: str) -> str:
    normalized = _normalize_website(website)
    if not normalized:
        return ""

    parsed = urlparse(normalized)
    domain = parsed.netloc.lower().strip()
    if domain.startswith("www."):
        domain = domain[4:]
    return domain


def _company_logo_from_domain(domain: str) -> str:
    cleaned = str(domain or "").strip().lower()
    if not cleaned:
        return ""
    return f"https://logo.clearbit.com/{cleaned}"


def _company_icon_from_domain(domain: str) -> str:
    cleaned = str(domain or "").strip().lower()
    if not cleaned:
        return ""
    return f"https://www.google.com/s2/favicons?domain={cleaned}&sz=128"


def _is_org_inbox_email(email: str) -> bool:
    value = str(email or "").strip().lower()
    if "@" not in value:
        return True
    local_part = value.split("@", 1)[0]
    return local_part in GENERIC_INBOX_PREFIXES


def _confidence_to_score(confidence) -> int:
    value = str(confidence or "").strip().lower()
    if value.isdigit():
        return max(0, min(100, int(value)))
    if value == "high":
        return 90
    if value == "medium":
        return 70
    if value == "low":
        return 40
    return 0


def _pick_best_contact(contacts: list) -> dict:
    if not isinstance(contacts, list) or not contacts:
        return {}

    valid_contacts = [contact for contact in contacts if isinstance(contact, dict) and contact.get("email")]
    if not valid_contacts:
        return {}

    ranked = sorted(
        valid_contacts,
        key=lambda contact: (
            0 if not _is_org_inbox_email(contact.get("email", "")) else 1,
            -_confidence_to_score(contact.get("confidence")),
            str(contact.get("email", "")).lower(),
        ),
    )
    return ranked[0]


def _find_target_companies(icp: str) -> list:
    prompt = f"""
You are FireReach's company discovery agent.
Analyze the Ideal Customer Profile below and return exactly 5 real companies that best match it.

Ideal Customer Profile:
{icp}

Requirements:
- Output exactly 5 companies.
- Use real, valid company names and official websites.
- Keep reasons professional, specific, and original.
- Return only a JSON array.
- Every object must include: company_name, industry, reason, website.
- Do not include markdown or commentary.
"""

    companies = _extract_json_array(
        generate_completion(
            prompt=prompt,
            system_prompt="You are a precise B2B market research analyst.",
            temperature=0.2,
            max_tokens=900,
        )
    )

    normalized_companies = []
    seen_names = set()

    for company in companies:
        company_name = str(company.get("company_name", "")).strip()
        if not company_name:
            continue

        dedupe_key = company_name.lower()
        if dedupe_key in seen_names:
            continue
        seen_names.add(dedupe_key)

        website = _normalize_website(company.get("website", ""))
        normalized_companies.append(
            {
                "company_name": company_name,
                "industry": str(company.get("industry", "")).strip(),
                "reason": str(company.get("reason", "")).strip(),
                "website": website,
                "domain": _domain_from_website(website),
                "company_logo": _company_logo_from_domain(_domain_from_website(website)),
                "company_icon": _company_icon_from_domain(_domain_from_website(website)),
            }
        )

    if len(normalized_companies) != 5:
        raise ValueError("Company finder must return exactly 5 valid companies.")

    return normalized_companies


def _discover_company_website(company_name: str) -> str:
    serper_api_key = os.getenv("SERPER_API_KEY")
    if not serper_api_key or serper_api_key == "your_serper_api_key_here":
        return ""

    try:
        response = requests.post(
            "https://google.serper.dev/search",
            json={
                "q": f"{company_name} official website",
                "num": 5,
            },
            headers={
                "X-API-KEY": serper_api_key,
                "Content-Type": "application/json",
            },
            timeout=20,
        )
        response.raise_for_status()
        data = response.json()

        for result in data.get("organic", []):
            link = str(result.get("link", "")).strip()
            if link and "wikipedia.org" not in link.lower():
                return _normalize_website(link)
    except requests.RequestException:
        return ""

    return ""


def _signal_strength_score(verified_signals: dict) -> float:
    total = float(sum(SIGNAL_WEIGHTS.values()))
    if total <= 0:
        return 0.0

    gained = 0.0
    for signal_code, weight in SIGNAL_WEIGHTS.items():
        value = verified_signals.get(signal_code) if isinstance(verified_signals, dict) else None
        if isinstance(value, dict):
            content = str(value.get("content", "")).strip()
            if content:
                gained += weight
        elif isinstance(value, list):
            if any(str(item or "").strip() for item in value):
                gained += weight
        elif isinstance(value, str) and value.strip():
            gained += weight

    return round((gained / total) * 100, 2)


def _compact_signals_for_prompt(verified_signals: dict) -> dict:
    compact = {}
    if not isinstance(verified_signals, dict):
        return compact

    for code in SIGNAL_WEIGHTS.keys():
        signal = verified_signals.get(code)
        if isinstance(signal, dict):
            content = str(signal.get("content", "")).strip()
            if content:
                compact[code] = content
        elif isinstance(signal, str) and signal.strip():
            compact[code] = signal.strip()
        elif isinstance(signal, list):
            merged = "; ".join(str(item).strip() for item in signal if str(item or "").strip())
            if merged:
                compact[code] = merged

    return compact


def _score_icp_matches_single_call(companies: list, icp: str) -> dict:
    payload = []
    for company in companies:
        payload.append(
            {
                "company_name": company.get("company_name", ""),
                "industry": company.get("industry", ""),
                "reason": company.get("reason", ""),
                "verified_signals": _compact_signals_for_prompt(company.get("verified_signals", {})),
                "account_brief": company.get("account_brief", ""),
            }
        )

    prompt = f"""
You are FireReach's ICP scoring agent.
Score each company against the ICP on a 0-100 scale.

ICP:
{icp}

Companies:
{json.dumps(payload, ensure_ascii=True)}

Return ONLY a JSON array with exactly these fields per object:
- company_name
- icp_score (number 0-100)
- reason (short, specific)

Rules:
- Keep one object for each company.
- Base score on ICP fit using verified signals + research brief.
- No markdown.
"""

    raw = generate_completion(
        prompt=prompt,
        system_prompt="You are a strict B2B ICP evaluator that returns only valid JSON.",
        temperature=0.1,
        max_tokens=1200,
    )
    scored = _extract_json_array(raw)

    score_map = {}
    for item in scored:
        name = str(item.get("company_name", "")).strip()
        if not name:
            continue
        try:
            icp_score = float(item.get("icp_score", 0))
        except (TypeError, ValueError):
            icp_score = 0.0
        icp_score = max(0.0, min(100.0, icp_score))
        score_map[name.lower()] = {
            "icp_score": round(icp_score, 2),
            "reason": str(item.get("reason", "")).strip(),
        }

    return score_map


def _select_best_company(companies: list, icp: str) -> tuple[list, dict]:
    if not companies:
        return [], {}

    try:
        icp_score_map = _score_icp_matches_single_call(companies, icp)
    except Exception:
        icp_score_map = {}

    ranked_rows = []
    for company in companies:
        signal_score = _signal_strength_score(company.get("verified_signals", {}))
        mapped = icp_score_map.get(str(company.get("company_name", "")).strip().lower(), {})
        icp_score = float(mapped.get("icp_score", 50.0))
        final_score = round((signal_score * 0.4) + (icp_score * 0.6), 2)

        ranked_rows.append(
            {
                "company_name": company.get("company_name", ""),
                "company_logo": company.get("company_logo", ""),
                "company_icon": company.get("company_icon", ""),
                "signal_score": round(signal_score, 2),
                "icp_score": round(icp_score, 2),
                "final_score": final_score,
                "score_reason": mapped.get("reason", ""),
            }
        )

    ranked_rows.sort(key=lambda row: (-row["final_score"], -row["icp_score"], row["company_name"].lower()))

    for index, row in enumerate(ranked_rows, start=1):
        row["rank"] = index
        row["selected"] = index == 1

    selected_name = ranked_rows[0]["company_name"] if ranked_rows else ""
    selected_company = next((company for company in companies if company.get("company_name") == selected_name), {})

    return ranked_rows, selected_company


async def _notify(progress_callback, step: str, status: str, message: str, data=None):
    color = ANSI_BLUE
    if status == "completed":
        color = ANSI_GREEN
    elif status == "failed":
        color = ANSI_RED
    elif status == "in-progress":
        color = ANSI_YELLOW

    step_label = step.upper() if step else "WORKFLOW"
    print(f"{ANSI_DIM}[pipeline]{ANSI_RESET} {color}{ANSI_BOLD}{step_label:<7}{ANSI_RESET} {ANSI_MAGENTA}{status:<11}{ANSI_RESET} {message}")

    if not progress_callback:
        return

    payload = {
        "step": step,
        "status": status,
        "message": message,
    }
    if data is not None:
        payload["data"] = data

    await progress_callback(payload)


async def _run_email_and_outreach_for_company(
    icp: str,
    company: dict,
    send_now: bool,
    forced_recipient_email: str = "",
    sender_profile: dict | None = None,
) -> dict:
    working = dict(company)

    contacts = await asyncio.to_thread(
        tool_email_finder,
        working.get("company_name", ""),
        working.get("website", ""),
        icp,
    )
    working["contacts"] = contacts
    suggested_contact = _pick_best_contact(contacts)
    override_email = str(forced_recipient_email or "").strip()
    if send_now and override_email:
        suggested_contact = {
            **(suggested_contact or {}),
            "email": override_email,
        }
    working["suggested_contact"] = suggested_contact
    working["selected_contact"] = suggested_contact if send_now else {}

    outreach = await asyncio.to_thread(
        tool_outreach_automated_sender,
        suggested_contact,
        working.get("company_name", ""),
        working.get("account_brief", ""),
        working.get("verified_signals", {}),
        icp,
        send_now,
        sender_profile or {},
    )
    working["outreach"] = outreach
    return working


async def run_agent_workflow(
    icp: str,
    send_mode: str = "auto",
    target_company: str = "",
    test_recipient_email: str = "",
    sender_profile: dict | None = None,
    progress_callback=None,
) -> dict:
    """
    Runs the FireReach workflow with company ranking and one-company outreach execution.
    """
    normalized_send_mode = str(send_mode or "auto").strip().lower()
    if normalized_send_mode not in {"auto", "manual"}:
        raise ValueError("Invalid send_mode. Use 'auto' or 'manual'.")

    print(f"{ANSI_DIM}[pipeline]{ANSI_RESET} {ANSI_BLUE}{ANSI_BOLD}START  {ANSI_RESET} ICP run started | send_mode={normalized_send_mode}")

    normalized_target_company = str(target_company or "").strip()
    if normalized_target_company:
        await _notify(progress_callback, "step1", "in-progress", "Using your selected target company.")
        website = await asyncio.to_thread(_discover_company_website, normalized_target_company)
        companies = [
            {
                "company_name": normalized_target_company,
                "industry": "User selected",
                "reason": "User requested outreach for this specific company.",
                "website": website,
                "domain": _domain_from_website(website),
                "company_logo": _company_logo_from_domain(_domain_from_website(website)),
                "company_icon": _company_icon_from_domain(_domain_from_website(website)),
            }
        ]
        await _notify(progress_callback, "step1", "completed", "Target company locked from user input.", {"companies": companies})
    else:
        await _notify(progress_callback, "step1", "in-progress", "Finding companies that match the ICP.")
        companies = await asyncio.to_thread(_find_target_companies, icp)
        await _notify(progress_callback, "step1", "completed", f"Found {len(companies)} companies.", {"companies": companies})

    await _notify(progress_callback, "step2", "in-progress", "Harvesting live signals for all companies.")
    harvested_signals = await asyncio.gather(
        *(asyncio.to_thread(tool_signal_harvester, company["company_name"], company.get("website", "")) for company in companies)
    )
    for company, signals in zip(companies, harvested_signals):
        company["harvested_signals"] = signals
    await _notify(progress_callback, "step2", "completed", "Signal harvesting completed for all companies.")

    await _notify(progress_callback, "step3", "in-progress", "Verifying harvested signals.")
    verified_sets = await asyncio.gather(
        *(asyncio.to_thread(verify_signals, company.get("harvested_signals", {})) for company in companies)
    )
    for company, verified_signals in zip(companies, verified_sets):
        company["verified_signals"] = verified_signals
        company["signal_categories"] = list(verified_signals.keys())
    await _notify(progress_callback, "step3", "completed", "Signal verification completed.")

    await _notify(progress_callback, "step4", "in-progress", "Generating account briefs from verified signals.")
    briefs = await asyncio.gather(
        *(
            asyncio.to_thread(
                tool_research_analyst,
                icp,
                company.get("verified_signals", {}),
                company_name=company["company_name"],
            )
            for company in companies
        )
    )
    for company, account_brief in zip(companies, briefs):
        company["account_brief"] = account_brief
    await _notify(progress_callback, "step4", "completed", "Research briefs generated.")

    await _notify(progress_callback, "step5", "in-progress", "Scoring and selecting best company.")
    rankings, selected_company = await asyncio.to_thread(_select_best_company, companies, icp)
    selected_company_name = selected_company.get("company_name", "")
    await _notify(
        progress_callback,
        "step5",
        "completed",
        f"Selected {selected_company_name} as rank 1.",
        {"rankings": rankings, "selected_company_name": selected_company_name},
    )

    if normalized_send_mode == "manual":
        return {
            "status": "awaiting_company_selection",
            "send_mode": normalized_send_mode,
            "icp": icp,
            "companies": companies,
            "rankings": rankings,
            "selected_company_name": "",
            "summary": {
                "company_count": len(companies),
                "emails_sent": 0,
                "emails_failed": 0,
                "emails_pending_manual": 0,
                "steps": [{"step": step, "label": label} for step, label in STEP_DEFINITIONS],
            },
        }

    await _notify(progress_callback, "step6", "in-progress", "Finding emails for the selected company.")
    processed_company = await _run_email_and_outreach_for_company(
        icp=icp,
        company=selected_company,
        send_now=True,
        forced_recipient_email=test_recipient_email,
        sender_profile=sender_profile,
    )
    await _notify(
        progress_callback,
        "step6",
        "completed",
        "Contact discovery completed for selected company.",
        {
            "selected_company": {
                "company_name": processed_company.get("company_name", ""),
                "industry": processed_company.get("industry", ""),
                "website": processed_company.get("website", ""),
                "company_logo": processed_company.get("company_logo", ""),
                "company_icon": processed_company.get("company_icon", ""),
            },
            "contacts": processed_company.get("contacts", []),
            "suggested_contact": processed_company.get("suggested_contact", {}),
            "selected_contact": processed_company.get("selected_contact", {}),
            "test_recipient_override": str(test_recipient_email or "").strip(),
        },
    )

    await _notify(progress_callback, "step7", "in-progress", "Sending outreach for selected company.")
    outreach = processed_company.get("outreach", {})
    sent_count = 1 if outreach.get("status") == "sent" else 0
    await _notify(
        progress_callback,
        "step7",
        "completed" if sent_count else "failed",
        "Outreach send completed." if sent_count else "Outreach send failed.",
        {
            "selected_company_name": processed_company.get("company_name", ""),
            "outreach": processed_company.get("outreach", {}),
            "recipient": processed_company.get("outreach", {}).get("recipient", ""),
        },
    )

    merged_companies = []
    for company in companies:
        if company.get("company_name") == processed_company.get("company_name"):
            merged_companies.append(processed_company)
        else:
            merged = dict(company)
            merged["contacts"] = []
            merged["suggested_contact"] = {}
            merged["selected_contact"] = {}
            merged["outreach"] = {
                "status": "not_selected",
                "recipient": "",
                "subject": "",
                "email_content": "",
                "message": "Company not selected for outreach run.",
            }
            merged_companies.append(merged)

    final_status = "completed" if sent_count else "partial"
    done_color = ANSI_GREEN if final_status == "completed" else ANSI_YELLOW
    print(f"{ANSI_DIM}[pipeline]{ANSI_RESET} {done_color}{ANSI_BOLD}DONE   {ANSI_RESET} Workflow finished with status={final_status}")
    return {
        "status": final_status,
        "send_mode": normalized_send_mode,
        "icp": icp,
        "companies": merged_companies,
        "rankings": rankings,
        "selected_company_name": processed_company.get("company_name", ""),
        "summary": {
            "company_count": len(companies),
            "emails_sent": sent_count,
            "emails_failed": 1 - sent_count,
            "emails_pending_manual": 0,
            "steps": [{"step": step, "label": label} for step, label in STEP_DEFINITIONS],
        },
    }


async def run_selected_company_workflow(icp: str, selected_company: dict, sender_profile: dict | None = None) -> dict:
    company_name = str((selected_company or {}).get("company_name", "")).strip()
    if not company_name:
        raise ValueError("selected_company.company_name is required.")

    print(f"{ANSI_DIM}[pipeline]{ANSI_RESET} {ANSI_BLUE}{ANSI_BOLD}MANUAL {ANSI_RESET} Running manual company workflow for {company_name}")

    processed_company = await _run_email_and_outreach_for_company(
        icp=icp,
        company=selected_company,
        send_now=False,
        sender_profile=sender_profile,
    )

    outreach = processed_company.get("outreach", {})
    outreach["status"] = "manual_pending"
    outreach["message"] = "Email generated. Review template and click Send Email."
    processed_company["outreach"] = outreach

    return {
        "status": "manual_ready",
        "selected_company": processed_company,
        "contacts": processed_company.get("contacts", []),
        "suggested_contact": processed_company.get("suggested_contact", {}),
        "outreach": processed_company.get("outreach", {}),
    }


async def send_generated_email(recipient: str, subject: str, email_content: str, pdf_filename: str = "") -> dict:
    """
    Sends a generated outreach email on manual user action.
    """
    print(f"{ANSI_DIM}[pipeline]{ANSI_RESET} {ANSI_YELLOW}{ANSI_BOLD}EMAIL  {ANSI_RESET} Sending manual email to {recipient}")
    result = await asyncio.to_thread(send_prepared_email, recipient, subject, email_content, pdf_filename)
    color = ANSI_GREEN if result.get("status") == "sent" else ANSI_RED
    print(f"{ANSI_DIM}[pipeline]{ANSI_RESET} {color}{ANSI_BOLD}EMAIL  {ANSI_RESET} status={result.get('status')} recipient={recipient}")
    return result
