# DFB Smart Shop

A smart e-commerce + inventory system for **DFB Smart Shop** (glass, aluminum
profiles, hardware, and screens) in Cainta, Rizal. The shop owner manages stock,
orders, reservations, and promos; customers browse, get AI-assisted visual
search, and place orders/reservations (payment is arranged offline).

## Architecture

The stack is **Firebase (Backend-as-a-Service) + a React frontend + client-side
AI**. There is no custom backend server and no separate database engine — those
tiers are Firebase's cloud, configured from this repo.

```
dfb-smart-shop/
├── frontend/     # React + Vite + MUI app — the three interfaces:
│   └── src/
│       ├── admin/   …  (sections/admin, pages/admin)  owner back-office  (A-*)
│       ├── buyer/   …  (sections/buyer, pages/buyer)  client mobile app  (B-*)
│       ├── store/   …  (to add)                       public webshop     (W-*)
│       ├── services/firebase/   Firebase init + data access
│       ├── services/ai/         MobileNet visual-search bridge
│       ├── data/                shared models + mock data (Firebase stand-in)
│       └── components, theme, layouts, utils …  (shared UI base)
│
├── backend/      # Firebase config & deployment (firebase.json, .firebaserc)
├── database/     # Realtime DB rules, schema, seed data
├── ai/           # Visual-search (TensorFlow.js + MobileNet) design + reference
└── docs/         # Manuscript, diagrams, screenshots
```

Why so much lives in `frontend/`: with Firebase, the "backend" and "database"
are cloud services you *configure* (see `backend/` and `database/`), and the AI
model runs *in the browser* (see `ai/`). So most source code is legitimately
frontend.

## Run the frontend

```bash
cd frontend
yarn install
yarn dev        # http://localhost:3039
yarn build      # type-check + production build
```

The app currently runs on mock data (`frontend/src/data/`), so no Firebase setup
is needed to explore it.

**Demo sign-in (Admin):** `owner@dfbsmartshop.com` / `admin1234` at `/sign-in`
**Demo sign-in (Buyer):** `marites.santos@gmail.com` / `buyer1234` at `/account/sign-in`

## Status

| Area                     | State                                  |
| ------------------------ | -------------------------------------- |
| Admin UI (A-1 … A-11)    | ✅ Built                                |
| Buyer UI (B-1 … B-9)     | ✅ Built                                |
| Webshop UI (W-*)         | ⬜ Next                                 |
| Firebase backend/DB      | ⬜ Config scaffolded; wiring pending    |
| AI visual search         | ⬜ Bridge logic scaffolded; model pending |

See [`frontend/README.md`](frontend/README.md) for the full page/route map.
