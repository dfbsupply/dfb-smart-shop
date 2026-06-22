# DFB Smart Shop — Manual Test Script (UAT)

Live site: **https://dfbsupply.store**

Use these steps to demonstrate each of the study's five objectives. Each test
lists what to do and the expected result.

## Test accounts

| Role | URL | Email | Password |
| --- | --- | --- | --- |
| **Admin (owner)** | https://dfbsupply.store/login/admin | `owner@dfbsmartshop.com` | `admin1234` |
| **Buyer (customer)** | https://dfbsupply.store/login | `buyer@test.com` | `buyer1234` |
| **Guest** | https://dfbsupply.store | _(no login — browse & order directly)_ | — |

> Any order you place during testing appears in **Admin → Orders**; delete test
> orders there afterward to keep the data clean.

---

## Objective 1 — Responsive web interface

1. Open **https://dfbsupply.store** on a desktop browser → resize the window
   narrow/wide. The storefront layout should reflow (grid → single column).
2. Open the same URL on a phone (or DevTools device mode). It should be usable
   on mobile.
3. Sign in as **Buyer** → note the **mobile-style app** with a bottom tab bar
   (Home / Orders / Alerts / Profile).
4. Sign in as **Admin** → note the **dashboard** with a collapsible sidebar.
   - **Expected:** all three interfaces (store, buyer app, admin back-office)
     are responsive and usable on phone and desktop.

## Objective 2 — AI-assisted visual search (client-side)

1. Go to **https://dfbsupply.store/visual-search**.
2. Click **Upload Photo** (or **Open Camera** on a phone) and choose a photo of
   a window, glass, screen, door handle, or lock.
3. Wait a few seconds (the AI model runs **in your browser**).
   - **Expected:** a "We think this is related to: …" label appears and the page
     shows **matching items from the shop**. Click **Use This & Size** → it opens
     that product with your photo attached.
   - If the photo is unclear/unrelated, it shows a graceful "couldn't confidently
     match" message with suggestions — this is also correct behavior.

## Objective 3 — Dynamic, size-based pricing

1. From the catalogue open a product, e.g. **Clear Float Glass 5mm** (base
   ₱320).
2. Enter **Width = 36**, **Height = 48**, **Quantity = 1** → click **Calculate
   Price**.
   - **Expected:** Estimated Price = **₱3,248**.
   - Formula: `320 + (36×48×1.5) + (2×(36+48)×2) = 320 + 2592 + 336 = 3248`.
3. Click **"See how this is computed"** → it breaks down base + surface area +
   perimeter. Change the size → the price changes accordingly.

## Objective 4 — Real-time cloud data (Supabase)

**4a. Catalogue is live**
1. Storefront **/catalog** lists products from the cloud database (visible items
   only — out-of-stock still shows, hidden items do not).

**4b. Place an order (guest)**
1. On a product, calculate a price → **Add to Cart** → open **Cart** → **Proceed
   to Order** → fill name + mobile → **Submit Order**.
   - **Expected:** confirmation page with a real order number **#DFB-####**.

**4c. Admin retrieves & updates it**
1. Sign in as **Admin** → **Orders** → find the order you just placed.
2. Open it → change **Status** (e.g., to *Confirmed*) → **Update Status**.
   - **Expected:** the change saves and persists after refresh.

**4d. Inventory writes reflect on the shop**
1. Admin → **Inventory** → **Add Product** (or edit one) → save.
2. Open the storefront **/catalog** → the new/edited product appears.
   - **Expected:** admin changes are immediately reflected for customers.

**4e. Buyer sees their own data only**
1. Sign in as **Buyer** → **Orders**: shows only this customer's orders (4 demo
   orders). **Notifications** and **Profile** are personal too (RLS-enforced).

## Objective 5 — Smart recommendations

1. Open a product such as **Clear Float Glass 5mm** → scroll down to
   **"Frequently Bought Together"**.
   - **Expected:** complementary items are suggested (e.g., a window lock).
2. Add an item to the cart → on the **Cart** page see **"You might also need:"**
   suggestions.
   - These pairings are curated by the owner in **Admin → Recommendations**.

---

## Quick regression checklist

- [ ] Storefront loads on phone + desktop (Obj 1)
- [ ] Visual search returns matches from a photo (Obj 2)
- [ ] Price recalculates with size + shows breakdown (Obj 3)
- [ ] Guest order → appears in Admin → status update persists (Obj 4)
- [ ] Admin inventory change shows on the shop (Obj 4)
- [ ] Buyer sees only their own orders (Obj 4 / security)
- [ ] Recommendations show on product + cart (Obj 5)
- [ ] Admin login works; non-admin is rejected on /login/admin
