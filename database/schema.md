# Realtime Database — Schema

The Firebase Realtime Database is a single JSON tree. These are the top-level
nodes the app uses. The TypeScript shapes that mirror them live in
[`../frontend/src/data/types.ts`](../frontend/src/data/types.ts).

```
dfb-smart-shop-rtdb/
├── admins/                     # uid → true (who may write admin data)
│   └── <uid>: true
│
├── products/                   # inventory (Admin A-5/A-6)
│   └── <productId>/
│       ├── name, category, description
│       ├── basePrice           # P_base for the price formula
│       ├── stockQty, lowStockThreshold
│       ├── images[]            # high-res photo URLs
│       ├── keywords[]          # visual-search tags → AI bridge
│       ├── visibleInShop, availableForReservation
│
├── promoList/                  # promo banners (Admin A-7 → Webshop home)
│   └── <bannerId>/ { image, caption, link, status, order }
│
├── recommendations/            # "frequently bought together" (Admin A-8)
│   └── <productId>: [addonId, ...]
│
├── settings/                   # shop profile + pricing constants (Admin A-10)
│   ├── name, address, contact, hours
│   ├── surfaceMultiplier (1.5), perimeterMultiplier (2)
│   └── lowStockThreshold
│
├── orders/                     # orders & reservations (Admin A-3/A-4, Buyer B-4/B-5)
│   └── <orderId>/
│       ├── code (#DFB-XXXX)
│       ├── customerUid         # owner (buyer) — used by security rules
│       ├── customerName, customerMobile, customerEmail
│       ├── type               # "order" | "reservation"
│       ├── fulfilment         # "pickup" | "delivery"
│       ├── address?, notes?, staffNote?
│       ├── items[]            # { productId, name, width, height, qty, unitPrice, lineTotal }
│       ├── estTotal, confirmedAmount?
│       ├── status            # new|pending|confirmed|ready|completed|cancelled
│       └── createdAt
│
├── users/                      # buyer profiles (Buyer B-7)
│   └── <uid>/ { fullName, mobile, email, preference, address }
│
└── notifications/              # per-buyer in-app alerts (Buyer B-8)
    └── <uid>/
        └── <notifId>/ { text, type, read, createdAt }
```

## Pricing (denormalized at write time)

Each order item stores the **computed** `unitPrice` and `lineTotal` so historical
orders keep their original pricing even if the multipliers in `settings` change
later. The formula:

```
unitPrice = basePrice + (W × H) × surfaceMultiplier + (2 × (W + H)) × perimeterMultiplier
```
