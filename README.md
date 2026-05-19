# Joseph's Retreat — Vacation Rental Booking Platform

Direct booking website for two curated stays in Delhi: **Amber House** and **Rooftop Serenity**. Guests can browse residences, check live availability (Airbnb + website sync), book dates, and pay securely with **Razorpay**.

**Live site:** [testweb-beta-rust.vercel.app](https://testweb-beta-rust.vercel.app)  
**Repository:** [github.com/asitgiri1234/testweb](https://github.com/asitgiri1234/testweb)  
**Last updated:** May 2026

---

## Features

| Feature | Status |
|---------|--------|
| Property listings with photo galleries | ✅ |
| Hero slideshow (auto-rotate + mobile swipe) | ✅ |
| 5★ ratings & review counts on cards | ✅ |
| Airbnb calendar import (blocked dates) | ✅ |
| Website → Airbnb ICS export | ✅ |
| Booking with date conflict prevention | ✅ |
| Razorpay Standard Checkout (pay & reserve) | ✅ |
| Contact host form (Resend email) | ✅ |
| Google Maps location on detail pages | ✅ |

---

## Properties

| Residence | Guests | Beds | Price/night | Reviews |
|-----------|--------|------|-------------|---------|
| **Amber House** | 1–5 | 2 | ₹2,299 | 5★ · 137 reviews |
| **Rooftop Serenity** | 1–3 | 1 | ₹1,999 | 5★ · 149 reviews |

**Location:** Rohini Sector 15, New Delhi

---

## Project structure

```
testweb/
├── frontend/                 # React (Vite) — UI
│   ├── src/
│   │   ├── api/              # bookings, calendar, payments, contact
│   │   ├── components/       # Hero, PropertyCard, BookingWidget, …
│   │   ├── data/             # Property listings & images
│   │   └── pages/
│   └── .env.example          # VITE_RAZORPAY_KEY_ID, VITE_API_URL
├── backend/                  # Express + Mongoose API
│   ├── src/
│   │   ├── routes/           # bookings, calendar, contact, payments
│   │   ├── services/         # availability, payments, Airbnb import
│   │   └── models/           # Property, Booking
│   └── .env.example          # MongoDB, Resend, Razorpay, Airbnb iCal
└── vercel.json               # Multi-service deploy (frontend + backend)
```

---

## Quick start (local)

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — MONGODB_URI, Razorpay keys, Resend, Airbnb iCal URLs
npm install
npm run seed    # optional — seed Amber House & Rooftop Serenity into DB
npm run dev
```

**Health check:** http://localhost:5000/api/health

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_RAZORPAY_KEY_ID (same as RAZORPAY_KEY_ID — never put KEY_SECRET here)
npm install
npm run dev
```

**Site:** http://localhost:5173

---

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `RAZORPAY_KEY_ID` | Yes (payments) | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Yes (payments) | Razorpay secret — **backend only** |
| `RESEND_API_KEY` | Yes (contact) | Resend email API key |
| `RESEND_FROM_EMAIL` | Yes | Sender address |
| `HOST_EMAIL` | Yes | Host inbox for inquiries |
| `CLIENT_URL` | Yes | Frontend URL for CORS |
| `SITE_URL` | Yes | Public site URL (ICS links) |
| `AIRBNB_ICAL_AMBER_HOUSE` | Optional | Airbnb export `.ics` URL |
| `AIRBNB_ICAL_ROOFTOP_SERENITY` | Optional | Airbnb export `.ics` URL |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_RAZORPAY_KEY_ID` | Yes (payments) | Razorpay key ID (publishable) |
| `VITE_API_URL` | No | Default `/api` (Vite proxy in dev) |

> **Never commit `.env` files.** They are listed in `.gitignore`.

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | API status + config flags |
| `GET` | `/api/payment-config` | Razorpay key ID (if configured) |
| `POST` | `/api/create-order` | Create Razorpay order |
| `POST` | `/api/verify-payment` | Verify payment signature & confirm booking |
| `POST` | `/api/bookings` | Create pending booking |
| `GET` | `/api/bookings/:id` | Get booking by ID |
| `GET` | `/api/calendar/availability/:slug` | Blocked dates for a property |
| `GET` | `/api/calendar/property-1.ics` | Export Amber House calendar |
| `GET` | `/api/calendar/property-2.ics` | Export Rooftop Serenity calendar |
| `POST` | `/api/contact` | Send contact form email |

---

## Razorpay payment flow

1. Guest selects dates and enters details on the booking page.
2. Clicks **Pay & reserve** → backend creates a booking (pending) and a Razorpay order.
3. Razorpay checkout modal opens.
4. On success → frontend sends `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature` to `/api/verify-payment`.
5. Backend verifies HMAC-SHA256 signature → marks booking **paid** and **confirmed**.

**Test card (Razorpay test mode):** `4111 1111 1111 1111` · any future expiry · any CVV

---

## Deploy to Vercel

This repo uses Vercel **Services** ([`vercel.json`](vercel.json)):

| Service | Folder | Route |
|---------|--------|-------|
| `frontend` | `frontend/` | `/` |
| `backend` | `backend/` | `/api` |

1. Import [github.com/asitgiri1234/testweb](https://github.com/asitgiri1234/testweb) at [vercel.com/new](https://vercel.com/new).
2. Root directory: **`.`** (repository root).
3. Framework: **Other** / **Services** (not Vite-only).
4. Add all environment variables from the tables above in **Project → Settings → Environment Variables**.
5. Redeploy after changing env vars.

**Required for calendar + Pay & reserve on the live site:**

| Variable | Why |
|----------|-----|
| `MONGODB_URI` | Stores bookings and merges website blocked dates into the calendar |
| `RAZORPAY_KEY_ID` | Backend payment orders |
| `RAZORPAY_KEY_SECRET` | Payment signature verification |
| `VITE_RAZORPAY_KEY_ID` | Same key ID for the checkout modal (optional if backend returns `key_id`) |

Check deployment: `GET https://YOUR-DOMAIN/api/health` should show `"razorpayConfigured": true`.

### Airbnb ↔ website calendar sync

| Property | Calendar slug | Import Airbnb `.ics` | Export for Airbnb |
|----------|---------------|----------------------|-------------------|
| Amber House | `property-1` | `AIRBNB_ICAL_AMBER_HOUSE` | `https://YOUR-DOMAIN/api/calendar/property-1.ics` |
| Rooftop Serenity | `property-2` | `AIRBNB_ICAL_ROOFTOP_SERENITY` | `https://YOUR-DOMAIN/api/calendar/property-2.ics` |

Paste the export URL into Airbnb → **Availability** → **Connect calendars** → **Import calendar**.

---

## Tech stack

- **Frontend:** React 19, Vite, React Router, react-day-picker
- **Backend:** Node.js, Express, Mongoose, MongoDB
- **Payments:** Razorpay Standard Checkout
- **Email:** Resend
- **Hosting:** Vercel (multi-service)

---

## Development phases

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Architecture + UI/API skeleton | ✅ |
| 2 | Property data, galleries, host profile | ✅ |
| 3 | Booking validation & calendar sync | ✅ |
| 4 | Razorpay payments + confirmation | ✅ |

---

## Changelog (recent)

- **Razorpay** — Pay & reserve with order creation and signature verification
- **Ratings** — 5★ with per-property review counts (137 / 149)
- **Hero** — 4-slide carousel with mobile-friendly navigation
- **Rooftop Serenity** — 1 bedroom, 1–3 guests
- **Amber House** — ₹2,299/night, 1–5 guests
- **Logo** — Joseph's Retreat branding in navbar

---

## License

Private project — Joseph's Retreat.
