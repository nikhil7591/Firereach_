<div align="center">

# 🔥 FireReach

### Autonomous AI-Powered B2B Outreach Engine

**"Define your ICP. Deploy the agent. Personalized outreach in under 3 minutes — zero manual effort."**

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Groq](https://img.shields.io/badge/LLM-Groq%2FLlama3-F55036?style=for-the-badge)](https://groq.com)
[![Serper](https://img.shields.io/badge/Signals-Serper.dev-4285F4?style=for-the-badge)](https://serper.dev)
[![Hunter](https://img.shields.io/badge/Contacts-Hunter.io-E8453C?style=for-the-badge)](https://hunter.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)


🌐 **[Live Demo](https://fire-reach-pi.vercel.app)** &nbsp;·&nbsp; 🎥 **[Watch Demo](https://youtu.be/DrJ7FbbdRR0)** &nbsp;·&nbsp; 💼 **[LinkedIn](https://www.linkedin.com/in/nikhil-kumar-2974292a9/)**

</div>

---

## 🚀 What is FireReach?

FireReach is a **7-step autonomous AI agent** that takes your Ideal Customer Profile (ICP) as input and handles the entire B2B outreach pipeline — from company discovery to personalized email delivery with PDF attachment — **without any human intervention.**

```
You type your ICP  →  Agent finds 5 companies
                   →  Harvests 6 signal types per company (parallel)
                   →  Verifies and filters signals
                   →  Generates research briefs (parallel)
                   →  Scores and selects best company
                   →  Finds verified contacts via Hunter.io
                   →  Generates personalized email + attaches PDF
                   →  Sends via SMTP
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🏢 **Company Finder** | Groq LLM finds 5 real companies matching your ICP |
| 📊 **Signal Harvesting** | Serper.dev fetches 6 buying signal types (S1–S6) per company |
| 🎯 **Intelligent Scoring** | `Score = (Signal × 0.4) + (ICP Match × 0.6)` — best company auto-selected |
| 📧 **Verified Contacts** | Hunter.io finds real professional emails — personal emails always first |
| 📎 **PDF Intelligence** | Agent auto-selects 1 of 6 role-specific pitch PDFs |
| 📡 **Live Streaming UX** | NDJSON streaming — companies, rankings, contacts, email preview stream live |
| 🥇 **Gold Highlight System** | Rank 1 company and best contact highlighted with gold border + badge |
| ⚡ **Token Optimized** | Hunter.io + email gen runs for 1 selected company only — ~65% token saving |
| 🔀 **Auto + Manual Modes** | Full auto-send or review-at-3-checkpoints manual mode |
| 🔐 **Auth System** | JWT-based signup/login with user profiles and plan management |
| 💳 **Credits & Subscriptions** | Free tier + paid plans with credit-based usage tracking |
| 📜 **Run History** | All pipeline runs saved and accessible per user |
| 🌐 **Landing Page** | Full marketing landing page with Three.js 3D background |

---

## 🏗️ System Architecture

![System Architecture](docs/system_architecture.png)

---

## 🔁 7-Step Agent Pipeline

![Workflow Chart](docs/workflow_chart.png)

```
Step 1  →  Company Finder       Groq LLM → 5 real companies
Step 2  →  Signal Harvest       Serper.dev → S1-S6 per company (parallel)
Step 3  →  Signal Verify        Filter empty / invalid signals
Step 4  →  Research Brief       Groq → account brief per company (parallel)
Step 5  →  Company Selector     Score = (Signal×0.4) + (ICP×0.6) → Rank 1
Step 6  →  Email Finder         Hunter.io → verified contacts (1 company only)
Step 7  →  Outreach Dispatch    Groq email + PDF attach + SMTP send
```

> ⚡ **Token Optimization:** Steps 6–7 run only for the **1 best-scoring company** — saving ~65% in API costs.

---

## 📊 Scoring Model

| Signal | Category | Weight |
|---|---|---|
| S2 | Funding | 20 pts |
| S1 | Hiring | 18 pts |
| S4 | Product Launch | 17 pts |
| S3 | Leadership Changes | 15 pts |
| S5 | Tech Stack | 15 pts |
| S6 | Market Reputation | 15 pts |

```
Final Score = (Signal Strength × 0.4) + (ICP Match × 0.6)
```

---

## 🚦 Send Modes

### 🤖 Auto Mode
Full pipeline runs end-to-end. Agent selects company, contact, and sends email automatically.

### 👤 Manual Mode
Pipeline pauses at **3 checkpoints**:
1. **Company Selection** — Review rankings, choose company
2. **Contact Selection** — Review contacts, pick recipient
3. **Send Confirmation** — Review/edit email template, click Send

---

## 📁 Project Structure

```
FireReach/
├── backend/
│   ├── agent.py                  ← Main orchestrator (7-step pipeline)
│   ├── main.py                   ← FastAPI endpoints
│   ├── database.py               ← SQLAlchemy DB setup
│   ├── requirements.txt
│   ├── pitches/                  ← 6 role-specific PDF pitch decks
│   ├── models/
│   │   ├── user.py               ← User model
│   │   ├── history.py            ← Run history model
│   │   ├── subscription.py       ← Subscription/plan model
│   │   └── payment.py            ← Payment model
│   ├── routes/
│   │   ├── auth.py               ← JWT signup/login/profile
│   │   ├── credits.py            ← Credit management
│   │   ├── history.py            ← Run history endpoints
│   │   └── payments.py           ← Payment/subscription routes
│   ├── tools/
│   │   ├── signal_harvester.py   ← Serper.dev S1-S6 queries
│   │   ├── email_finder.py       ← Hunter.io contact search
│   │   ├── outreach_sender.py    ← Groq email + PDF attach
│   │   └── research_analyst.py  ← Groq account briefs
│   └── services/
│       ├── groq_client.py        ← Groq API wrapper
│       ├── email_service.py      ← SMTP + MIMEMultipart
│       ├── auth_service.py       ← JWT token management
│       └── signal_verifier.py   ← Signal validation
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx           ← Marketing landing page
        │   ├── AppPage.jsx           ← Main pipeline dashboard
        │   ├── AuthPage.jsx          ← Login / Signup
        │   ├── ProfilePage.jsx       ← User profile
        │   ├── SettingsPage.jsx      ← Account settings
        │   └── PaymentDemoPage.jsx   ← Payment/upgrade
        ├── components/
        │   ├── landing/              ← Hero, Pipeline, Pricing, FAQ...
        │   ├── pipeline/             ← AgentStatus, PipelineModal...
        │   └── ui/                   ← InputField, ProgressBar, StatCard...
        └── services/
            └── api.js                ← NDJSON stream reader + API calls
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.11+, Node.js 18+
- API Keys: Groq, Serper.dev, Hunter.io
- Gmail with App Password
- PostgreSQL (for auth + history)

### 1. Clone
```bash
git clone https://github.com/your-username/firereach.git
cd firereach
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn main:app --host 0.0.0.0 --port 10000 --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Environment Variables

```env
# backend/.env
GROQ_API_KEY=your_groq_api_key
SERPER_API_KEY=your_serper_api_key
HUNTER_API_KEY=your_hunter_api_key
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_ADDRESS=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
DATABASE_URL=postgresql://user:pass@localhost/firereach
JWT_SECRET_KEY=your_jwt_secret
```

```env
# frontend/.env
VITE_API_URL=http://localhost:10000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/run-agent` | Run full 7-step pipeline (NDJSON streaming) |
| `POST` | `/select-company` | Manual mode: Steps 6–7 for selected company |
| `POST` | `/send-email` | Manual mode: send pre-generated email |
| `GET` | `/pitches/{filename}` | Serve pitch PDF files |
| `POST` | `/auth/signup` | Create new user account |
| `POST` | `/auth/login` | Login and get JWT token |
| `GET` | `/auth/me` | Get current user profile |
| `GET` | `/auth/plan` | Get user subscription plan |
| `GET` | `/` | Health check |

---

## 🔮 Future Scope

- 📅 **Meeting Link in Email** — Auto-embed Calendly/Google Meet link (3x reply rate)
- 🔄 **Follow-up Sequence** — Day 3 + Day 7 + Day 14 automated follow-ups
- 💼 **LinkedIn Outreach** — Multi-channel: email + LinkedIn DM
- 📈 **CRM Integration** — HubSpot / Salesforce auto-create leads
- 📊 **Analytics Dashboard** — Open rates, reply rates, ICP patterns

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Python, FastAPI, Uvicorn |
| LLM Engine | Groq Cloud, Llama 3.1 8B Instant |
| Signal Data | Serper.dev — 2,500 free searches/month |
| Email Discovery | Hunter.io Domain Search API |
| Email Delivery | Python smtplib, MIMEMultipart |
| Frontend | React 18, Vite, Tailwind CSS |
| 3D Background | Three.js (r128) |
| Streaming | NDJSON (Newline-Delimited JSON) |
| Auth | JWT (PyJWT + bcrypt) |
| Database | PostgreSQL + SQLAlchemy |

---

## 👨‍💻 Author

<div align="center">

**Nikhil Kumar**
CSE-AI Student | Chitkara University

📧 nikhil759100@gmail.com &nbsp;·&nbsp;

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/nikhil-kumar-2974292a9/)

*"Built to explore how autonomous AI agents can handle real-world B2B workflows — from research to inbox, zero manual effort."*

</div>

---

<div align="center">

**FireReach** — Academic Project | Chitkara University | CSE-AI

⭐ Star this repo if you found it useful!

</div>
