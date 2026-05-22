# Vercel setup — Razorpay, MongoDB, and booking emails

Use this checklist so **Pay & reserve** and **confirmation emails** work on your live site.

## 1. Open Vercel project settings

1. Go to [vercel.com](https://vercel.com) → your **testweb** project.
2. **Settings** → **Environment Variables**.

This repo uses **two services** ([`vercel.json`](vercel.json)):

| Service | Folder | Routes |
|---------|--------|--------|
| `frontend` | `frontend/` | `/` |
| `backend` | `backend/` | `/api` |

When adding a variable, pick the correct **service** (or “All” only if you intend both).

---

## 2. Backend service variables

Add these to the **backend** service (Production + Preview):

| Variable | Example / notes |
|----------|-----------------|
| `MONGODB_URI` | Atlas **Standard** URI (`mongodb://...shard-00-00.../vacation_rentals?ssl=true...`) — **not** `mongodb+srv` and **not** `<db_password>` placeholder. Must be on **backend** service. |
| `RAZORPAY_KEY_ID` | `rzp_test_...` (test) or `rzp_live_...` (production) |
| `RAZORPAY_KEY_SECRET` | Secret from Razorpay Dashboard → API Keys |
| `RESEND_API_KEY` | `re_...` from [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | `Joseph's Retreat <onboarding@resend.dev>` until domain verified |
| `HOST_EMAIL` | Host inbox (e.g. `joeljoseph2003871@gmail.com`) |
| `SITE_NAME` | `Joseph's Retreat` |
| `CLIENT_URL` | `https://YOUR-SITE.vercel.app` |
| `SITE_URL` | Same as `CLIENT_URL` |
| `CALENDAR_TIMEZONE` | `Asia/Kolkata` |

Optional (Airbnb calendar sync):

- `AIRBNB_ICAL_AMBER_HOUSE`
- `AIRBNB_ICAL_ROOFTOP_SERENITY`

### MongoDB Atlas

- **Network Access** → allow `0.0.0.0/0` (or Vercel IPs) so the serverless backend can connect.

### Razorpay

- Use **Test mode** keys until KYC is complete.
- Dashboard: [dashboard.razorpay.com](https://dashboard.razorpay.com) → **API Keys**.

---

## 3. Frontend service variables

Add to the **frontend** service:

| Variable | Value |
|----------|--------|
| `VITE_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (publishable only — never the secret) |

`VITE_API_URL` is optional; default `/api` works when frontend and backend share the same Vercel domain.

---

## 4. Redeploy

After saving env vars:

1. **Deployments** → latest deployment → **⋯** → **Redeploy**.
2. Or push a commit to `main` (auto-deploy).

---

## 5. Verify live site

Replace `YOUR-SITE` with your Vercel URL:

```text
GET https://YOUR-SITE.vercel.app/api/health
```

Expect:

```json
{
  "razorpayConfigured": true,
  "emailConfigured": true
}
```

Then complete a **test booking** (test card or `success@razorpay`).

---

## 6. Confirmation emails

After successful payment, the backend sends:

1. **Guest** — confirmation to the email entered on the booking form.
2. **Host** — notification to `HOST_EMAIL`.

Requires `RESEND_API_KEY`. On Resend’s free tier with `onboarding@resend.dev`, mail may only reach the email you used to sign up for Resend until you verify a domain.

---

## 7. Switching to live payments

1. Complete Razorpay KYC → **Live mode** keys.
2. Replace test keys in Vercel **backend** and `VITE_RAZORPAY_KEY_ID` on **frontend**.
3. Redeploy.
