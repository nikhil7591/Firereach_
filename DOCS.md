# FireReach — Autonomous AI-Powered B2B Outreach Engine

> **"Define your ICP. Deploy the agent. Personalized outreach delivered in under 3 minutes — zero manual effort."**

[![Python](https://img.shields.io/badge/Python-3.11+-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![Groq](https://img.shields.io/badge/LLM-Groq%2FLlama3-orange)](https://groq.com)
[![Hunter.io](https://img.shields.io/badge/Email-Hunter.io-red)](https://hunter.io)
[![Serper.dev](https://img.shields.io/badge/Signals-Serper.dev-brightgreen)](https://serper.dev)

🌐 **[Live Demo](https://fire-reach-pi.vercel.app)** &nbsp;·&nbsp; 🎥 **[Demo Video](https://youtu.be/DrJ7FbbdRR0)** &nbsp;·&nbsp; 💼 **[LinkedIn](https://www.linkedin.com/in/nikhil-kumar-2974292a9/)**

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Solution](#2-solution)
3. [System Architecture](#3-system-architecture)
4. [Project Structure](#4-project-structure)
5. [7-Step Agent Pipeline](#5-7-step-agent-pipeline)
6. [Workflow Charts](#6-workflow-charts)
7. [Company Scoring Model](#7-company-scoring-model)
8. [Signal Categories S1–S6](#8-signal-categories-s1s6)
9. [PDF Intelligence System](#9-pdf-intelligence-system)
10. [Live Pipeline UX](#10-live-pipeline-ux)
11. [API Integrations](#11-api-integrations)
12. [Send Modes](#12-send-modes)
13. [Auth & User System](#13-auth--user-system)
14. [Credits & Subscription](#14-credits--subscription)
15. [Setup and Installation](#15-setup-and-installation)
16. [Environment Variables](#16-environment-variables)
17. [Known Limitations](#17-known-limitations)
18. [Future Scope](#18-future-scope)
19. [Author](#19-author)

---

## 1. Problem Statement

### The Manual Outreach Problem

B2B outreach is one of the most time-consuming workflows in any sales team. SDRs and founders spend **30–40% of their working week** on tasks that are highly repetitive:

- **Manual company research** — browsing LinkedIn, Crunchbase, news sites
- **Signal hunting** — checking if a company raised funding, launched a product, or is hiring
- **Contact finding** — searching for the right decision maker and their verified email
- **Email writing** — crafting a personalized cold email for each prospect
- **Attachment selection** — deciding which pitch deck to attach per recipient

| Pain Point | Impact |
|---|---|
| Time wasted on research | 3–4 hours per week per person |
| Generic, non-personalized emails | Low open and reply rates |
| Unverified contact lists | Bounced emails, damaged domain reputation |
| No intelligent targeting | Wrong companies contacted, wasted effort |
| Blank loading screens | Poor user experience in existing tools |

### Why Existing Tools Fall Short

Most outreach automation tools either require manual CSV uploads, use static templates with no signal-based personalization, or show no live progress — users wait blindly for results.

---

## 2. Solution

FireReach is an **autonomous AI agent** that takes a single input — your ICP — and handles the entire outreach pipeline end-to-end.

### Key Innovations

**1. Intelligent Company Scoring**
Scores every candidate on two dimensions — signal strength and ICP alignment — and selects only the best match.

**2. Token Optimization (~65% Saving)**
Hunter.io + email generation run only for the **1 selected company**, not all 5. ~65% fewer API tokens vs naive approach.

**3. Live Streaming UX**
Every agent step streams real data to the frontend as it completes. Users see companies, rankings, contacts, and email appear progressively — never a blank screen.

**4. PDF Intelligence**
Agent automatically selects the most relevant pitch PDF from 6 pre-built documents based on recipient role + ICP keywords.

**5. Verified Contacts Only**
Hunter.io ensures only real, working professional emails. Personal emails always prioritized over generic org inboxes.

**6. Auth + History System**
JWT-based authentication, user profiles, plan management, and full run history tracking per user.

---

## 3. System Architecture

![System Architecture](docs/system_architecture.png)

```
┌──────────────────────────────────────────────────────────┐
│                    FireReach System                      │
├─────────────────────┬────────────────────────────────────┤
│     FRONTEND        │          BACKEND                   │
│  React 18 + Vite    │   FastAPI + Python 3.11+           │
│  Tailwind CSS       │   asyncio + Uvicorn                │
│  Three.js (3D BG)   │   SQLAlchemy + PostgreSQL          │
│  NDJSON Streaming   │   JWT Auth + Credits System        │
│  Live State UI      │   Agent Orchestrator               │
├─────────────────────┴────────────────────────────────────┤
│                  EXTERNAL APIs                           │
│  Groq/Llama3  │  Serper.dev  │  Hunter.io  │  SMTP      │
└──────────────────────────────────────────────────────────┘
```

---

## 4. Project Structure

```
FireReach/
├── backend/
│   ├── agent.py                  ← Main orchestrator (7-step pipeline)
│   ├── main.py                   ← FastAPI app + all endpoints
│   ├── database.py               ← SQLAlchemy DB setup
│   ├── requirements.txt
│   ├── pitches/                  ← 6 role-specific PDF pitch decks
│   ├── models/
│   │   ├── user.py               ← User model
│   │   ├── history.py            ← Run history model
│   │   ├── subscription.py       ← Subscription/plan model
│   │   └── payment.py            ← Payment model
│   ├── routes/
│   │   ├── auth.py               ← JWT signup/login/profile endpoints
│   │   ├── credits.py            ← Credit management
│   │   ├── history.py            ← Run history endpoints
│   │   └── payments.py           ← Payment/subscription routes
│   ├── tools/
│   │   ├── signal_harvester.py   ← Serper.dev S1-S6 signal queries
│   │   ├── email_finder.py       ← Hunter.io contact discovery
│   │   ├── outreach_sender.py    ← Groq email gen + PDF attach
│   │   └── research_analyst.py  ← Groq account brief generation
│   └── services/
│       ├── groq_client.py        ← Groq API wrapper
│       ├── email_service.py      ← SMTP + MIMEMultipart + PDF
│       ├── auth_service.py       ← JWT token management
│       ├── signal_verifier.py   ← Signal validation rules
│       └── signal_classifier.py ← Signal S1-S6 classification
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx           ← Marketing landing page
        │   ├── AppPage.jsx           ← Main pipeline dashboard
        │   ├── AuthPage.jsx          ← Login / Signup
        │   ├── ProfilePage.jsx       ← User profile
        │   ├── SettingsPage.jsx      ← Account settings
        │   └── PaymentDemoPage.jsx   ← Payment/upgrade page
        ├── components/
        │   ├── landing/              ← Hero, Pipeline, Pricing, FAQ, Footer
        │   ├── pipeline/             ← AgentStatusPanel, PipelineModal
        │   ├── ui/                   ← InputField, ProgressBar, StatCard
        │   └── ThreeBackground.jsx  ← Three.js 3D animation
        ├── hooks/
        │   └── usePipelineState.js   ← Pipeline state management hook
        └── services/
            └── api.js                ← NDJSON stream reader + API calls
```

---

## 5. 7-Step Agent Pipeline

```
Step 1  →  Company Finder       Groq LLM → 5 real companies as structured JSON
Step 2  →  Signal Harvest       Serper.dev → S1-S6 signals (parallel for all 5)
Step 3  →  Signal Verify        Rule filter → remove empty / duplicate / invalid
Step 4  →  Research Brief       Groq → 2-para account brief per company (parallel)
Step 5  →  Company Selector     Score = (Signal×0.4) + (ICP×0.6) → Rank 1 selected
Step 6  →  Email Finder         Hunter.io → top 5 verified contacts (1 company only)
Step 7  →  Outreach Dispatch    Groq email + PDF selector + SMTP send
```

> ⚡ **Token Optimization:** Steps 6–7 run only for the **1 best-scoring company**, not all 5 — saving ~65% in API tokens.

### Step Details

| Step | Tool | Input | Output |
|---|---|---|---|
| 1 | Groq / Llama 3 | ICP text | 5 company JSON objects |
| 2 | Serper.dev | Company name | S1–S6 signal objects per company |
| 3 | Local filter | Raw signals | Verified signal dict |
| 4 | Groq / Llama 3 | ICP + signals | 2-para account brief per company |
| 5 | Groq / Scoring | All briefs + signals | Rankings + selected company |
| 6 | Hunter.io | Company domain | Top 5 verified contacts |
| 7 | Groq + SMTP | Contact + brief + signals | Email sent + PDF attached |

---

## 6. Workflow Charts

![Workflow Chart](docs/workflow_chart.png)

---

## 7. Company Scoring Model

FireReach scores every company on two dimensions:

### Signal Strength Score (0–100)

| Signal | Category | Weight | Buying Intent |
|---|---|---|---|
| S2 | Funding | 20 pts | Has fresh capital — ready to invest |
| S1 | Hiring | 18 pts | Company is growing — needs solutions |
| S4 | Product Launch | 17 pts | Expanding product — needs adjacent tools |
| S3 | Leadership Changes | 15 pts | New leader = new priorities |
| S5 | Tech Stack | 15 pts | Shows infrastructure maturity |
| S6 | Market Reputation | 15 pts | Reviews, partnerships, social presence |

### ICP Match Score (0–100)

- Single Groq LLM call scores all 5 companies together (not 5 separate calls)
- Based on company industry, size, signals, and research brief vs ICP
- Returns `{company_name, icp_score, reason}` per company

### Final Score Formula

```
Final Score = (Signal Strength × 0.4) + (ICP Match × 0.6)
```

ICP weight is higher (0.6) because a relevant company is always a better outreach target than a signal-rich but misaligned one.

---

## 8. Signal Categories S1–S6

| Code | Category | Source | What It Means |
|---|---|---|---|
| S1 | Hiring Signals | Serper.dev /search | Active job postings, headcount expansion |
| S2 | Funding Signals | Serper.dev /news | Investment rounds, Series A/B/C |
| S3 | Leadership Changes | Serper.dev /news | New CTO/CEO/CPO/VP appointments |
| S4 | Product Launch | Serper.dev /news | New features, releases, launches |
| S5 | Tech Stack | Serper.dev /search | Infrastructure, tooling, platform changes |
| S6 | Market Reputation | Serper.dev /search | Reviews, partnerships, social mentions |

Each signal contains:
- `content` — extracted title + snippet text
- `source` — URL or domain of the result
- `label` — human-readable signal category name
- `website` — company website for context

---

## 9. PDF Intelligence System

The agent automatically selects the best pitch PDF based on recipient role and ICP keywords.

### Role → PDF Mapping

| Recipient Role | PDF Selected |
|---|---|
| CTO, VP Engineering, Tech Lead | `pitch_cto.pdf` |
| CEO, Founder, MD, Director | `pitch_founder.pdf` |
| HR, Talent, People, Recruiter | `pitch_hr.pdf` |
| Product Manager, CPO, PM | `pitch_product.pdf` |
| CFO, Finance, Investor | `pitch_investor.pdf` |
| Unknown / No match | `pitch_general.pdf` |

### Selection Logic

1. First checks recipient role for direct keyword match
2. If no role match, checks ICP text for bias keywords
3. Falls back to `pitch_general.pdf` if no match found
4. PDF attached via `MIMEMultipart` + `MIMEBase` in SMTP delivery
5. If PDF file missing → email sends without attachment (no crash)

---

## 10. Live Pipeline UX

FireReach streams real data to the UI at every step — user never sees a blank loading screen.

| Step | What Streams Live |
|---|---|
| Step 1 | 5 company cards appear instantly — name + industry |
| Step 5 | Rankings reveal with Signal, ICP, Final scores. Rank 1 gold-highlighted |
| Step 6 | All 5 contacts shown with confidence %. Best contact gold-highlighted |
| Step 7 | Full email preview renders — subject, body, PDF attachment name |

### Gold Highlight System

- **Rank 1 company** — gold border + "Agent Selected" badge on company card
- **Best contact** — gold border + "Agent Selected" badge on contact card
- Instantly clear to user — no manual scanning needed

### Streaming Implementation

- Backend: `StreamingResponse` with `asyncio.Queue` — each step `await queue.put(event)`
- Frontend: `fetch()` with `ReadableStream` + `TextDecoder` — reads NDJSON line by line
- No polling — true server-push streaming

---

## 11. API Integrations

### Groq (LLM Engine)

| | |
|---|---|
| **Model** | `llama-3.1-8b-instant` |
| **Used in** | Steps 1, 4, 5, 7 |
| **Free Tier** | 14,400 requests/day |
| **Token Save** | Single call scores all 5 companies (Step 5) |
| **Retry** | Auto-retry with backoff on rate limit |
| **Fallback** | Deterministic template email if generation fails |

### Serper.dev (Signal Data)

| | |
|---|---|
| **API** | `https://google.serper.dev/search` and `/news` |
| **Auth** | `X-API-KEY` header |
| **Used in** | Signal Harvesting (Step 2) |
| **Queries** | 6 targeted POST requests per company (S1–S6) |
| **Free Tier** | 2,500 searches/month |
| **Fallback** | Empty signal — pipeline continues without crashing |

### Hunter.io (Email Discovery)

| | |
|---|---|
| **API** | `https://api.hunter.io/v2/domain-search` |
| **Used in** | Email Finder (Step 6) |
| **Priority** | Personal emails > org inboxes |
| **Filtering** | Removes invalid, disposable, reject_all statuses |
| **Fallback** | `info@{domain}` if Hunter returns no results |
| **Free Tier** | 25 searches/month |

### SMTP (Email Delivery)

| | |
|---|---|
| **Protocol** | SMTP with STARTTLS (port 587) |
| **Used in** | Outreach Sender (Step 7) + Manual Send |
| **Attachment** | PDF via `MIMEMultipart` + `MIMEBase` |
| **Mock Mode** | If credentials missing → prints to console |

---

## 12. Send Modes

### Auto Mode

```
User provides ICP → clicks Deploy Agent
→ Steps 1–5 run automatically
→ Agent selects best company (rank 1)
→ Step 6: Hunter.io finds contacts
→ Agent selects best contact (highest confidence)
→ Step 7: Email generated and sent immediately
→ User sees live progress throughout
```

**Best for:** High-volume outreach, testing the full pipeline

### Manual Mode

```
Steps 1–4 run automatically (research phase)
    ↓
⏸ PAUSE 1: User reviews company rankings → selects one
    ↓
Step 6: Hunter.io finds contacts for selected company
    ↓
⏸ PAUSE 2: User selects recipient from contact list
    ↓
Step 7: Email generated (not sent yet)
    ↓
⏸ PAUSE 3: User reviews/edits template → clicks Send Email
    ↓
Email + PDF sent via SMTP
```

**Best for:** Reviewing before sending, editing content, selective outreach

---

## 13. Auth & User System

FireReach includes a full JWT-based authentication system.

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Create new user account |
| `POST` | `/auth/login` | Login and receive JWT token |
| `GET` | `/auth/me` | Get current user profile |
| `PATCH` | `/auth/me` | Update user profile |
| `GET` | `/auth/plan` | Get user subscription plan |
| `POST` | `/auth/plan` | Update subscription plan |

### Token Flow

```
User signs up / logs in
→ Server returns JWT token
→ Frontend stores token
→ All subsequent requests include Authorization: Bearer {token}
→ Backend validates token on each protected route
```

### User Model

- `id`, `email`, `name`, `hashed_password`
- `plan` (free / starter / pro)
- `credits_remaining`
- `created_at`, `updated_at`

---

## 14. Credits & Subscription

| Plan | Credits | Price | Features |
|---|---|---|---|
| Free | 1 run/month | $0 | Basic pipeline, manual mode |
| Starter | 10 runs/month | $9/mo | Auto mode, run history |
| Pro | Unlimited | $29/mo | All features, priority support |

Each `/run-agent` call consumes 1 credit. Credits are checked before pipeline starts.

---

## 15. Setup and Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL
- API keys: Groq, Serper.dev, Hunter.io
- Gmail with App Password

### Step 1 — Clone

```bash
git clone https://github.com/your-username/firereach.git
cd firereach
```

### Step 2 — Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Fill in your API keys
uvicorn main:app --host 0.0.0.0 --port 10000 --reload
```

### Step 3 — Frontend

```bash
cd frontend
npm install
# Create frontend/.env with VITE_API_URL=http://localhost:10000
npm run dev
```

### Step 4 — Add PDF Pitches

```
backend/pitches/pitch_cto.pdf
backend/pitches/pitch_founder.pdf
backend/pitches/pitch_hr.pdf
backend/pitches/pitch_product.pdf
backend/pitches/pitch_investor.pdf
backend/pitches/pitch_general.pdf
```

Open `http://localhost:5173` 🎉

---

## 16. Environment Variables

```env
# backend/.env
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key
HUNTER_API_KEY=your_hunter_api_key
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
DATABASE_URL=postgresql://user:password@localhost/firereach
JWT_SECRET_KEY=your_jwt_secret_key
```

```env
# frontend/.env
VITE_API_URL=http://localhost:10000
```

---

## 17. Known Limitations

| Limitation | Details | Workaround |
|---|---|---|
| Hunter.io Free Tier | 25 searches/month | Upgrade to paid plan |
| Groq Rate Limits | Free tier has TPM limits | System auto-retries with backoff |
| Serper.dev Free Tier | 2,500 searches/month (~83 full runs) | Upgrade for higher volume |
| Signal Verifier | Basic length-check only | Future: semantic validation |
| No Email Open Tracking | Cannot detect if email was opened | Future: tracking pixel |
| No Follow-up Sequence | Single email per run | Future: automated Day 3/7/14 |

---

## 18. Future Scope

### Near Term

| Feature | Description | Impact |
|---|---|---|
| **Meeting Link in Email** | Auto-embed Calendly/Google Meet link | 3x reply rate |
| **Email Open Tracking** | Tracking pixel to detect opens | Better follow-up timing |
| **Follow-up Sequence** | Automated Day 3 + Day 7 + Day 14 emails | 80% deals close on follow-up |

### Medium Term

| Feature | Description | Impact |
|---|---|---|
| **LinkedIn Outreach** | Email + LinkedIn DM simultaneously | 2x conversion rate |
| **Better Signal APIs** | Crunchbase API, LinkedIn API | 10x signal accuracy |
| **Analytics Dashboard** | Open rates, reply rates, ICP patterns | Data-driven optimization |

### Long Term

| Feature | Description |
|---|---|
| **CRM Integration** | Auto-create leads in HubSpot / Salesforce |
| **AI Reply Handler** | Agent analyzes replies and suggests responses |
| **ICP Builder Agent** | AI-guided ICP creation via questions |
| **Unlimited Batch** | Async queue for multiple ICPs simultaneously |

---

## 19. Author

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   Nikhil Kumar                                                      │
│   CSE-AI Student  │  Chitkara University  │  Batch: Rabbitt.ai      │
│                                                                     │
│   Project  :  FireReach — Autonomous AI B2B Outreach Engine         │
│   Email    :  nikhil759100@gmail.com                                │
│   LinkedIn :  linkedin.com/in/nikhil-kumar-2974292a9                │
│   Demo     :  firereach-rabbitt.vercel.app                          │
│   Video    :  youtu.be/PiymjG6xOXM                                  │
│                                                                     │
│   "Built to explore how autonomous AI agents can handle             │
│    real-world B2B workflows — from research to inbox,               │
│    zero manual effort."                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

*FireReach — Autonomous AI-Powered B2B Outreach Engine*
*Built with Python, FastAPI, React, Groq, Serper.dev, Hunter.io, PostgreSQL, and JWT Auth*
