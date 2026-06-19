# DFB Smart Shop — Deployment (Phase 8)

Deploy the Vite SPA **and** its `/api` serverless function to **Vercel**, point
the **Namecheap** domain at it, and verify the domain in **Resend** so order
emails reach customers.

Repo: `github.com/2236914/dfb-smart-shop` · App lives in `frontend/`.

---

## 0. Prerequisite — push the code

Vercel's Git integration builds what's on GitHub, so the latest work must be
committed and pushed to `main` first. (Secrets are safe: `.env`, `.env.local`,
`.vercel`, and `dist` are gitignored.)

---

## 1. Import the project in Vercel

1. [vercel.com](https://vercel.com) → **Add New… → Project** → import
   `2236914/dfb-smart-shop`.
2. **Root Directory:** click **Edit** → select **`frontend`**. _(Critical — the
   app and the `api/` function live there, not at the repo root.)_
3. Framework Preset: **Vite** (auto-detected). Build command `yarn build`,
   Output `dist`, Install `yarn` — all auto.
4. Add the environment variables below **before** the first deploy.
5. **Deploy.**

## 2. Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Value | Exposed to browser? |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://oldsxsjkjkxgjskgfjol.supabase.co` | Yes (public-safe) |
| `VITE_SUPABASE_ANON_KEY` | your **publishable** key (`sb_publishable_…`) | Yes (public-safe) |
| `RESEND_API_KEY` | your **new** Resend key (`re_…`) | **No — server only** |
| `ORDER_NOTIFICATION_TO` | `dfbglassandaluminumsupply@proton.me` | No |
| `ORDER_EMAIL_FROM` | `DFB Smart Shop <onboarding@resend.dev>` (until domain verified) | No |

Set each for **Production** (and Preview if you want). Only the two `VITE_`
vars reach the browser; the rest stay server-side for the email function.

## 3. Smoke test the deployment

On the deployed URL:
- `/` catalogue loads (live products), `/login/admin` + `/login` work.
- Place a test order → confirmation shows a real `#DFB-####` → it appears in
  Admin → Orders. (Then delete that test order from Admin.)
- Order email: see §5 — works fully only after domain verification.

---

## 4. Custom domain (Namecheap)

1. Vercel → Project → **Settings → Domains** → add your domain (e.g.
   `dfbsmartshop.com`). Vercel shows the records to set.
2. Namecheap → **Domain List → Manage → Advanced DNS**:
   - **Apex** (`@`): A record → `76.76.21.21` (Vercel shows the exact value), **or**
   - Use Vercel's nameservers (easiest) if you let Vercel manage DNS.
   - **www**: CNAME → `cname.vercel-dns.com`.
3. Wait for propagation; Vercel auto-issues HTTPS.

## 5. Verify the domain in Resend (so emails reach customers)

On the **free tier without this step, emails only deliver to your Resend signup
address**, from `onboarding@resend.dev`.

1. Resend → **Domains → Add Domain** → enter your domain.
2. Resend shows **DKIM/SPF (TXT)** + a return-path record. Add them in
   **Namecheap → Advanced DNS** exactly as shown.
3. Back in Resend, click **Verify**. Once green:
   - Change `ORDER_EMAIL_FROM` in Vercel to a real address, e.g.
     `DFB Smart Shop <orders@dfbsmartshop.com>`.
   - Redeploy (or it applies on next deploy).

---

## Notes / gotchas

- **`vercel.json`** rewrites everything except `/api/*` to the SPA entry, so
  deep links (e.g. `/catalog`) work and the function still resolves.
- **Local function testing:** `yarn dev` (Vite) does **not** run `/api`. To test
  email locally use `vercel dev` with a local gitignored `.env` holding
  `RESEND_API_KEY`.
- **Rotate any key that was ever pasted into chat** before using it here.
- Auto-deploy: every push to `main` triggers a new Vercel build.
