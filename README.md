# StayDirect — Vacation Rental Booking Platform

Direct booking website for vacation rentals (Airbnb-style), built in phases.

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
