# DFB Smart Shop — Project Summary

_Last updated: 2026-06-18_

A one-page picture of what we're building, the decisions we've made, where we are
now, and what's next. For the deeper specs see
[`ARCHITECTURE.md`](ARCHITECTURE.md) and [`../supabase/README.md`](../supabase/README.md).

---

## 1. What we're building

**DFB Smart Shop** — an AI-integrated e-commerce + inventory system for **DFB
Glass and Aluminum Supply** (proprietress **Lorie Bandong**; Main branch in
Pasig, branch in Cainta, Rizal). It replaces the shop's manual logbook + phone
ordering with a web platform that has three faces:

- **Admin** (owner): manage stock, orders/reservations, promos, settings.
- **Buyer** (customer account): track orders, reservations, profile, notifications.
- **Webshop** (public storefront): browse, AI visual search, instant size-based
  price quote, place order/reservation (payment is arranged offline).

**Five objectives:** (1) responsive web UI, (2) client-side AI visual search,
(3) dynamic size-based pricing, (4) real-time cloud data, (5) smart
recommendations.

---

## 2. The key decision — we changed the stack

The cloned repo and the manuscript were built around **Firebase**. We finalized a
different, better-fitting stack for the thesis:

| Concern | Was (manuscript) | Now (final) |
| --- | --- | --- |
| Frontend | HTML5 + Tailwind | **React + Vite + MUI + TypeScript** (already in repo) |
| Database / Auth / Storage | Firebase | **Supabase** (PostgreSQL + RLS) |
| Hosting / backend logic | (unspecified) | **Vercel** (static + serverless `/api`) |
| Email / login codes | — | **Resend** |
| Domain | — | **Namecheap** |
| AI | TensorFlow.js + MobileNet | **unchanged** — runs client-side in the browser |

**Why:** a relational schema documents and defends better for a thesis, needs no
credit card for the email path, and the AI is client-side — so there's no real
backend server to host (no Railway, no Firebase functions). One host (Vercel) +
one data tier (Supabase) + one email provider (Resend).

---

## 3. Finalized tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, Vite, MUI, TypeScript |
| Client AI | TensorFlow.js + MobileNet (in-browser) |
| Pricing | Deterministic formula (in-browser) |
| Database / Auth / Storage | Supabase (PostgreSQL, RLS) |
| Serverless logic | Vercel Functions (`/api`) |
| Email | Resend |
| Hosting | Vercel |
| Domain / DNS | Namecheap (DNS at Namecheap or Cloudflare, "DNS-only") |

---

## 4. Where we are right now

| Item | Status |
| --- | --- |
| Repo cloned + running locally | ✅ on mock data for unbuilt areas |
| Architecture finalized | ✅ |
| Architecture brief for documentation | ✅ Word doc + diagrams delivered |
| **Phase 1 — database schema** | ✅ Applied to live Supabase (8 products, 10 orders) |
| **Phase 2 — auth** | ✅ Supabase Auth wired: real admin + buyer sign-in/out, route guards, `is_admin` gate, demo accounts |
| **Phase 3 — data layer + Admin live** | ✅ Admin back-office on live Supabase data (dashboard, inventory CRUD, orders + status, reports, settings/promos/recommendations reads) |
| **Phase 4 — Buyer live** | ✅ Buyer app on live data scoped by RLS (home, orders, order detail, notifications + mark-read, profile + save); buyer order cancel via `cancel_order` RPC |
| **Phase 5 — Webshop live** | ✅ Storefront on live data (home, catalogue, product page, cart, contact, visual-search matching); guest checkout writes a real order via `place_order` RPC |
| **Phase 6 — AI visual search** | ✅ MobileNet (TensorFlow.js) loads + classifies client-side; label→catalogue bridge maps generic labels (window screen, sliding door, mirror, padlock…) to live products and ranks matches |
| **Phase 7 — Email (Resend)** | ✅ Code built: `api/send-order-email.ts` serverless function + checkout wiring (best-effort, server-held key). Live send pending: real `RESEND_API_KEY` in Vercel env + domain verification |
| Phase 8 (deploy) | ⬜ Next |

**The entire app now runs on Supabase — no `mock.ts` imports remain anywhere.**
**All five thesis objectives are functionally complete.**

**Current step:** Phase 8 — deploy to Vercel + point the Namecheap domain;
verify the domain in Resend (DNS) so order emails reach real customers, and set
`RESEND_API_KEY` in the Vercel project env.

**Note:** the data layer lives in `frontend/src/services/db/` (typed
query/mutation functions + DB↔UI mappers) with a small `useAsync` hook in
`frontend/src/hooks/`. Two SQL RPCs back the buyer/guest writes:
`cancel_order` and `place_order` (migrations in `supabase/migrations/`). Still
deferred: promos/recommendations/settings **edits** (reads are live).

---

## 5. Roadmap

1. **Database (Supabase)** — schema + RLS + seed + types ✅
2. **Auth** — admin + buyer sign-in, demo accounts, link buyer orders ✅
3. **Data layer + Admin live** — replace mock data; Admin creates real records ✅
4. **Buyer live** — orders, profile, notifications from Supabase ✅
5. **Webshop (W-\*)** — public storefront on live data + real guest checkout ✅
6. **AI visual search** — load MobileNet, run the 4-step pipeline ✅
7. **Email (Resend)** — order emails + login codes ✅ (code done; live send needs key + domain)
8. **Deploy** — Vercel + Namecheap domain + DNS ← _we are here_
9. **Polish + evaluation** — offline/error states, usability testing, final docs

---

## 6. What's been delivered (where it lives)

- **Architecture spec (Markdown):** `docs/ARCHITECTURE.md`
- **Architecture brief (Word, for the doc team):** `docs/DFB-Smart-Shop-Architecture.docx`
- **Diagrams (images):** `docs/arch_system.png`, `docs/arch_dataflow.png`
- **Database — Phase 1:** `supabase/migrations/*.sql`, `supabase/seed.sql`,
  one-shot `supabase/apply_all.sql`, and `supabase/README.md` (with the **ERD**)
- **This summary:** `docs/PROJECT-SUMMARY.md`

---

## 7. Open items / decisions for the team

- **Manuscript update (documentation person):** Chapter 3 stack + Figure 3.2 need
  the Firebase→Supabase changes — see the change-map in the Word brief.
- **Naming:** letterhead "DFB Glass and Aluminum Supply" vs manuscript "New DFB
  Glass & Aluminum" vs app brand "DFB Smart Shop" — reconcile in the manuscript.
- **Store hours** weren't on the letterhead — confirm with the owner (seed uses a
  placeholder).
- **Pricing formula:** the manuscript's printed form drops the perimeter
  multiplier; the code is authoritative — fix in the manuscript.

---

## 8. Key facts for the defense

- The **AI runs entirely in the browser** (MobileNet via TensorFlow.js); no
  server-side AI, no custom training.
- It does **category-level matching, not exact-SKU** recognition — admin-set
  keywords bridge MobileNet's generic results to the catalogue.
- **Dynamic pricing** is pure math; **smart recommendations** are rule-based,
  admin-curated. Both are honestly *not* machine learning.
