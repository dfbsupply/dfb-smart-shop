# DFB Smart Shop — Frontend

The React app for **DFB Smart Shop**, containing all three interfaces: the
**Admin** owner back-office, the **Buyer** client mobile app, and (soon) the
public **Webshop**.

Built on the [Minimal Free](https://github.com/minimal-ui-kit/material-kit-react)
UI kit (MIT) — **Vite + React 19 + MUI 7 + TypeScript**.

## Source layout

```
src/
  sections/{auth,admin,buyer,store,error}/   feature UI, grouped by interface
  pages/{auth,admin,buyer,store}/            thin route pages
  routes/sections/{auth,admin,buyer,store}   route groups (+ shared, index)
  layouts/{auth,dashboard,buyer,store}       per-interface shells
  services/{firebase,ai}                     backend + AI integration
  data/                                      shared models + mock data
  components, theme, utils                   shared UI base
```

Auth (sign-in, register, forgot-password) is shared in `sections/auth` +
`pages/auth`, serving both the admin (staff) and buyer (customer) flows.

## Quick start

```bash
yarn install
yarn dev      # http://localhost:3039
yarn build    # type-check + production build
```

**Demo sign-in (Admin):** `owner@dfbsmartshop.com` / `admin1234`
**Demo sign-in (Buyer):** `marites.santos@gmail.com` / `buyer1234` (at `/account/sign-in`)

## Two interfaces

- **Admin** (owner back-office) lives at the root (`/`) with a sidebar layout.
- **Buyer** (client mobile app) lives under `/account` with a phone-style frame
  and bottom navigation.

Both read from the same shared data layer (`src/data/`).

## Admin pages

| Ref  | Page                  | Route                                   |
| ---- | --------------------- | --------------------------------------- |
| A-1  | Admin Sign In         | `/sign-in`                              |
| A-2  | Dashboard (Overview)  | `/`                                     |
| A-3  | Orders Management     | `/orders`                               |
| A-4  | Order Detail          | `/orders/:id`                           |
| A-5  | Inventory             | `/inventory`                            |
| A-6  | Add / Edit Product    | `/inventory/new`, `/inventory/:id/edit` |
| A-7  | Promo Banners         | `/promos`                               |
| A-8  | Recommendations       | `/recommendations`                      |
| A-9  | Reports               | `/reports`                              |
| A-10 | Settings              | `/settings`                             |

## Buyer pages (client mobile app)

| Ref | Page                   | Route                     |
| --- | ---------------------- | ------------------------- |
| B-1 | Sign In                | `/account/sign-in`        |
| B-2 | Create Account         | `/account/register`       |
| B-3 | Home / Dashboard       | `/account`                |
| B-4 | My Orders              | `/account/orders`         |
| B-5 | Order Detail           | `/account/orders/:id`     |
| B-6 | Reservation status     | (within My Orders / detail) |
| B-7 | Profile / Settings     | `/account/profile`        |
| B-8 | Notifications          | `/account/notifications`  |

## Pricing formula (Objective 3)

```
unit = P_base + (W × H) × surfaceMultiplier + (2 × (W + H)) × perimeterMultiplier
```

Defaults: `surfaceMultiplier = 1.5`, `perimeterMultiplier = 2` — both configurable
from **Settings**. See `src/data/pricing.ts`.

## Data layer

All screens currently read from mock data in `src/data/` that mirrors the intended
**Firebase Realtime Database** shape (`products`, `orders`, `promoList`,
`recommendations`, `settings`). To go live, replace the exports in
`src/data/mock.ts` with Firebase `onValue` subscriptions and wire writes in each
view's handlers.

## Scope

- **No payment processing** — the admin records/confirms orders; payment is settled
  offline.
- **No courier/delivery tracking** — order status uses manual, shop-set stages only.
- **Requires internet** to sync with Firebase; an offline notice is shown when the
  browser goes offline.
