# Joseph's Retreat — Vacation Rental Booking Platform

Direct booking website for curated stays in Delhi, built in phases.

**Phase 1 (current):** Project architecture, React frontend skeleton, Express + MongoDB backend skeleton.

## Project structure

```
testweb/
├── frontend/          # React (Vite) — UI
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── data/      # Dummy properties (until API is wired)
│       └── styles/
└── backend/           # Express + Mongoose — API
    └── src/
        ├── config/    # DB connection
        ├── models/    # Property, Booking schemas
        ├── controllers/
        ├── routes/
        └── middleware/
```

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI (MongoDB must be running locally or use Atlas)
npm install
npm run dev
```

API health check: http://localhost:5000/api/health

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Site: http://localhost:5173

## Deploy to Vercel (multi-service)

This repo uses Vercel **Services** — one project, two services in [`vercel.json`](vercel.json):

| Service | Folder | URL prefix |
|---------|--------|------------|
| `frontend` | `frontend/` (Vite + React) | `/` |
| `backend` | `backend/` (Express API) | `/api` |

1. Import the GitHub repo at [vercel.com/new](https://vercel.com/new).
2. Set **Root Directory** to `.` (repository root).
3. Set **Framework Preset** to **Other** or **Services** (must not be only “Vite” — `vercel.json` defines both services).
4. Add **Environment Variables** (Project → Settings → Environment Variables):

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | `Joseph's Retreat <onboarding@resend.dev>` (or your verified domain) |
| `HOST_EMAIL` | `joeljoseph2003871@gmail.com` |
| `SITE_NAME` | `Joseph's Retreat` |
| `CLIENT_URL` | `https://your-project.vercel.app` |

5. Deploy. Contact form calls `/api/contact` on the same domain (no separate backend URL needed).

## Development phases

| Phase | Focus |
|-------|--------|
| 1 | Architecture + UI/API skeleton ✅ |
| 2 | Property CRUD API + seed data |
| 3 | Booking validation, availability, double-booking prevention |
| 4 | Razorpay payments + confirmation |

## Tech stack

- **Frontend:** React, Vite, React Router, react-day-picker, CSS modules per component
- **Backend:** Node.js, Express, Mongoose, MongoDB
- **Payments (later):** Razorpay

## Repository

https://github.com/asitgiri1234/testweb
