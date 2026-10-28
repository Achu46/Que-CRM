# OVE Solutions — Intelligent CRM Platform
> **Tagline:** People • Process • Progress  
> Built for QUE Solutions | Modern, secure, AI-assisted Customer Relationship Management

[![Vitest](https://img.shields.io/badge/Vitest-29%20Passing-brightgreen.svg)](file:///c:/Users/ADMIN/Desktop/Que-CRM/server)
[![React](https://img.shields.io/badge/React-18-blue.svg)](file:///c:/Users/ADMIN/Desktop/Que-CRM/client)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-OVE%20Theme-olive.svg)](file:///c:/Users/ADMIN/Desktop/Que-CRM/client/tailwind.config.js)

---

## 1. Overview & Architecture

OVE Solutions CRM is an enterprise-minded CRM platform designed around **Option B: Backend-as-Single-Source-of-Truth**. All client requests travel through the Express API server with Zod schema validation, Firebase ID token authentication, RBAC authorization, and centralized error handling.

### Key Pillars
1. **Activity-Driven Sales Acceleration**: Every contact and deal maintains a unified chronological timeline (calls, meetings, notes, emails).
2. **Atomic Lead Qualification**: Inbound inquiries convert into a Company, Contact, and a Deal in the `2_qualified` pipeline stage in a single transaction.
3. **7-Stage Kanban Deals Pipeline**: Drag/move opportunities with stage totals, velocity tracking, and mandatory reason capture on Closed Lost.
4. **Resend Email Integration**: Send customer emails directly from the contact profile with full delivery tracking and timeline logging.
5. **Gemini AI Intelligence**: Contextual interaction summarization, personalized follow-up email drafts, and unstructured lead entity extraction with human-in-the-loop approval.
6. **n8n Automation Engine**: Outbound event webhook dispatching (`lead.created`, `deal.stage_changed`) and authenticated inbound lead ingestion.

---

## 2. Brand Identity & Design System

The platform strictly implements the minimal olive and forest green aesthetic:
* **Deep Forest Green**: `#30452B` (Primary action buttons, brand logo emblem)
* **Primary Olive Green**: `#777B45` (Selected navigation, highlights, metrics)
* **Secondary Olive**: `#929568` (Borders, subtle tags)
* **Soft Background**: `#F7F8F3` (Off-white canvas)
* **Primary Text**: `#273126` (WCAG AA accessible contrast)
* **Borders**: `#E4E7DC` (Subtle card and divider borders)
* **Status Palette**: Success (`#477A52`), Warning (`#B88736`), Error (`#B94A48`)

---

## 3. Tech Stack

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
* **Backend**: Node.js, Express.js (ES Modules), Zod Schema Validation, Helmet, CORS, Morgan
* **Database**: Firebase Admin SDK & Cloud Firestore (with automated local mock fallback for zero-setup development)
* **AI Engine**: Google Gemini API (`@google/generative-ai`)
* **Email Engine**: Resend API (`resend`)
* **Automations**: n8n Webhook Service
* **Testing**: Vitest, Supertest

---

## 4. API Endpoints Reference

All endpoints return a standardized envelope: `{ success: true, data: ..., message: ..., meta: ... }`.

### Authentication
* `GET /api/auth/me` — Current user profile and resolved RBAC role.
* `POST /api/auth/sync` — Ensures user profile in Firestore after Firebase Auth login.

### Leads
* `GET /api/leads` — Query leads with status, source, and search filters.
* `POST /api/leads` — Create lead with duplicate warning detection.
* `GET /api/leads/:id` — Lead details with associated timeline.
* `PUT /api/leads/:id` — Update lead fields.
* `DELETE /api/leads/:id` — Archive lead (admin role required).
* `POST /api/leads/:id/convert` — Atomic conversion into Company, Contact, and Deal.

### Deals & Pipeline
* `GET /api/deals` — List deals with total pipeline values and won totals.
* `POST /api/deals` — Create deal opportunity.
* `GET /api/deals/:id` — Deal details with timeline and tasks.
* `PATCH /api/deals/:id/stage` — Advance stage. Requires `lostReason` if stage is `7_lost`.
* `PUT /api/deals/:id` — Update deal amount, title, or close date.

### Contacts & Companies
* `GET /api/contacts` — Search and list contacts.
* `POST /api/contacts` — Create individual contact.
* `GET /api/contacts/:id` — Full unified customer hub (profile, company, deals, tasks, timeline).
* `GET /api/companies` — Search and list client organizations.
* `POST /api/companies` — Create company account.

### Tasks & Activities
* `GET /api/tasks` — Filter tasks by `status` (pending/completed) and priority.
* `POST /api/tasks` — Schedule follow-up task attached to deal, contact, or lead.
* `PATCH /api/tasks/:id/complete` — Mark task completed.
* `GET /api/activities` — Chronological interaction stream for an entity.
* `POST /api/activities` — Log a call, meeting, or note.

### Analytics & Integrations
* `GET /api/dashboard/metrics` — Live aggregates (pipeline value, win rate %, stage totals, lead source distribution).
* `POST /api/emails/send` — Send email via Resend API and log to timeline.
* `POST /api/ai/summarize` — Generate 3-bullet interaction summary with Gemini.
* `POST /api/ai/draft-email` — Generate personalized follow-up email draft with Gemini.
* `POST /api/ai/extract-lead` — Parse unstructured message into structured lead fields.
* `POST /api/webhooks/n8n/lead` — Inbound webhook for landing page forms (authenticated via `x-crm-secret`).

---

## 5. Getting Started

### 1. Installation
```bash
# Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Variables
Copy `.env.example` templates to `.env`:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Run Development Servers
```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:server   # Runs on http://localhost:5000
npm run dev:client   # Runs on http://localhost:5173
```

### 4. Run Automated Test Suite
```bash
# Run backend Vitest suite (29 tests)
npm run test --workspace=server
```

---

## 6. Project Directory Layout

```
Que-CRM/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/                # API clients (leads, deals, contacts, tasks, integrations)
│   │   ├── components/
│   │   │   ├── ai/             # AISummaryCard, AIDraftEmailModal
│   │   │   ├── common/         # BrandLogo, Button, Card, Badge, Modal, Input, Spinner
│   │   │   ├── layout/         # AppShell, Sidebar, TopNavbar
│   │   │   └── timeline/       # ActivityStream, LogActivityModal
│   │   ├── pages/              # LeadsPage, DealsKanbanPage, ContactsPage, ContactDetailPage, CompaniesPage, TasksPage
│   │   ├── App.jsx             # Shell & Executive Dashboard
│   │   ├── index.css           # OVE brand variables & scrollbars
│   │   └── main.jsx
│   ├── tailwind.config.js       # OVE Solutions color tokens
│   └── vite.config.js
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/             # Environment validation & Firebase Admin initialization
│   │   ├── controllers/        # Leads, Deals, Contacts, Companies, Tasks, Activities, Dashboard, Email, AI, Webhook
│   │   ├── middleware/         # Auth (Bearer JWT), RBAC roles, Zod validate, Centralized Error
│   │   ├── routes/             # Express API route modules
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Firestore/Memory store, Resend email, Gemini AI, n8n dispatch
│   │   ├── utils/              # Standard JSON response helpers
│   │   ├── app.js              # Express app wiring
│   │   └── server.js           # Server entry point
│   ├── test/                   # Vitest suite (Auth, Health, Validate, CRM, Dashboard, Integrations)
│   └── package.json
│
├── README.md
└── package.json
```

---

## 7. Security Architecture

1. **No Client Secrets**: Gemini and Resend API keys remain strictly on the backend.
2. **Bearer Token Authentication**: Firebase Admin token verification on all protected `/api/*` routes.
3. **Least Privilege RBAC**: Endpoint authorization guarded by roles (`admin` vs `sales_rep`).
4. **Zod Schema Sanitization**: Strict input validation prevents malformed requests and injection.
5. **Zero-Leak Error Handler**: Production responses mask internal stack traces and server internals.
