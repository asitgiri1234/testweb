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
| `SITE_URL` | `https://your-project.vercel.app` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `RAZORPAY_KEY_ID` | Razorpay test/live key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret (backend only) |
| `VITE_RAZORPAY_KEY_ID` | Same key ID for the frontend service |
| `AIRBNB_ICAL_AMBER_HOUSE` | Amber House Airbnb export `.ics` URL |

5. Deploy. Contact form calls `/api/contact` on the same domain (no separate backend URL needed).

### Airbnb ↔ website calendar sync (Amber House)

| Property | Calendar slug | Airbnb import | Export ICS for Airbnb |
|----------|---------------|---------------|------------------------|
| Amber House | `property-1` | Yes | `https://YOUR-DOMAIN/api/calendar/property-1.ics` |
| Rooftop Serenity | `property-2` | Yes | `https://YOUR-DOMAIN/api/calendar/property-2.ics` |

Seed properties into MongoDB:

```bash
cd backend
npm run seed
```

**Paste into Airbnb (Amber House listing → Availability → Connect calendars → Import calendar):**

`https://YOUR-DOMAIN/api/calendar/property-1.ics`

The website imports Amber House Airbnb blocked dates automatically and blocks them on the booking calendar.

## Development phases

| Phase | Focus |
|-------|--------|
| 1 | Architecture + UI/API skeleton ✅ |
| 2 | Property CRUD API + seed data |
| 3 | Booking validation, availability, double-booking prevention |
| 4 | Razorpay payments + confirmation ✅ |

## Tech stack

- **Frontend:** React, Vite, React Router, react-day-picker, CSS modules per component
- **Backend:** Node.js, Express, Mongoose, MongoDB
- **Payments:** Razorpay Standard Checkout

### Razorpay (local + Vercel)

1. Copy keys into `backend/.env` (from `backend/.env.example`):
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
2. Copy the **key ID only** into `frontend/.env`:
   - `VITE_RAZORPAY_KEY_ID` (same value as `RAZORPAY_KEY_ID`)
3. On Vercel, add all three variables above to **both** frontend and backend services (or project env).
4. Test with Razorpay test mode: open a property → **Book** → select dates → **Pay & reserve**.

API endpoints: `POST /api/create-order`, `POST /api/verify-payment`

## Repository

https://github.com/asitgiri1234/testweb
