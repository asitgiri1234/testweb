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
| `RAZORPAY_CHECKOUT_CONFIG_ID` | Optional — e.g. `config_SsT8EBb0IH8s01` from Dashboard → Payment Configuration (hides EMI/Pay Later) |

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

## 7. Remove “Test Mode” and accept real payments

The red **Test Mode** ribbon on the Razorpay checkout appears only when you use **test API keys** (`rzp_test_...`). Real payments need **live keys** (`rzp_live_...`).

### Step 1 — Activate Razorpay Live mode

1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com).
2. Complete **KYC / account activation** (business details, bank account, PAN, etc.).
3. Wait until Razorpay approves your account (often 1–3 business days).
4. Toggle the dashboard from **Test Mode** to **Live Mode** (top of dashboard).
5. Go to **Settings → API Keys → Live Mode** → **Generate Key**.
6. Copy:
   - **Key ID** → starts with `rzp_live_...`
   - **Key Secret** → shown once; save it securely.

### Step 2 — Update Vercel environment variables

On the **backend** service, replace:

| Variable | Old (test) | New (live) |
|----------|------------|------------|
| `RAZORPAY_KEY_ID` | `rzp_test_...` | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | test secret | live secret |

On the **frontend** service, replace:

| Variable | New value |
|----------|-----------|
| `VITE_RAZORPAY_KEY_ID` | same **live** Key ID (`rzp_live_...`) |

**Never** put the Key Secret in the frontend.

### Step 3 — Redeploy

**Deployments** → **Redeploy** (or push to `main`).

### Step 4 — Verify

1. Open your site → **Pay & reserve**.
2. Razorpay modal should **not** show the red “Test Mode” ribbon.
3. A small real charge (e.g. one night) confirms live flow — or use Razorpay’s live dashboard to monitor.

### Step 5 — Production emails (recommended)

1. [Resend](https://resend.com) → verify your domain.
2. Set `RESEND_FROM_EMAIL` to e.g. `Joseph's Retreat <noreply@yourdomain.com>`.
3. Redeploy backend.

### Checklist before going live

- [ ] Razorpay KYC complete, **Live** keys in Vercel
- [ ] `MONGODB_URI` working (`/api/health` → `databaseConnected: true`)
- [ ] `VITE_RAZORPAY_KEY_ID` = live key ID on **frontend** service
- [ ] Refund/cancellation policy on website (Razorpay may require for live)
- [ ] Test one real ₹1–₹10 payment, then refund from Razorpay Dashboard if needed

### Important

- **Test cards and `success@razorpay` do not work in live mode** — only real UPI/cards.
- Keep test keys in a safe place for future development on localhost.
