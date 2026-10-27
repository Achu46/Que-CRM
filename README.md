# Que-CRM

Que-CRM is an AI-augmented, event-driven Customer Relationship Management (CRM) platform built with React, Node.js/Express, Firebase Firestore, Google Gemini AI, Resend, and n8n automations.

## Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS, TanStack Query, Lucide Icons
- **Backend**: Node.js, Express.js (ES Modules), Zod validation, Helmet, CORS
- **Database**: Firebase Firestore
- **AI Intelligence**: Google Gemini API
- **Email Outreach**: Resend API
- **Automations**: n8n Webhook Engine

## Project Structure
```
Que-CRM/
├── client/              # React frontend (Vite + Tailwind CSS)
│   ├── src/
│   │   ├── api/         # Axios API client with interceptors
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React Query hooks
│   │   └── App.jsx
│   └── .env.example
├── server/              # Express API backend
│   ├── src/
│   │   ├── config/      # Env, Firebase, Gemini, Resend configurations
│   │   ├── middleware/  # Auth, validation, and error handlers
│   │   ├── modules/     # Feature modules (leads, deals, activities, ai, email)
│   │   ├── app.js       # Express application
│   │   └── server.js    # HTTP listener
│   └── .env.example
└── package.json         # Workspace root scripts
```

## Getting Started

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Configure Environment Variables
Copy the `.env.example` templates to `.env`:
```bash
# Backend configuration
cp server/.env.example server/.env

# Frontend configuration
cp client/.env.example client/.env
```

Fill in your respective API keys:
- `GEMINI_API_KEY`: Obtain from [Google AI Studio](https://aistudio.google.com/)
- `RESEND_API_KEY`: Obtain from [Resend](https://resend.com/)
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Service account credentials from Firebase Console

### 3. Run Development Servers
```bash
# Run backend only (runs on http://localhost:5000)
npm run dev:server

# Run frontend only (runs on http://localhost:5173)
npm run dev:client

# Run both concurrently
npm run dev
```

## Security Best Practices
- **No secrets in frontend code**: Private keys (Gemini, Resend, Firebase Service Account) remain strictly on the backend.
- All `.env` files and credentials are ignored by git in `.gitignore`.

