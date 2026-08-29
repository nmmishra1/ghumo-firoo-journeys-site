# Migration Plan: Express/mysql2 + dual-database → Supabase Auth + PHP + MySQL

Goal: end up with **one** business database (MySQL, on your shared hosting,
already included in the price), **one** auth system (Supabase, free tier),
and **zero** always-on Node processes — since shared hosting can't run
those reliably.

Do this in phases. Each phase leaves you with a working site — nothing
is a big-bang cutover.

---

## Phase 0 — Prep (no user-facing changes)

1. Get your Supabase JWT secret: Dashboard → Project Settings → API →
   "JWT Secret".
2. Create the MySQL database on your shared hosting (cPanel → MySQL
   Databases) and import `schema.sql`.
3. Upload `db.php`, `auth_middleware.php`, and `composer.json` to your
   hosting, run `composer install` (via SSH if available, or upload the
   `vendor/` folder manually if not — most shared hosts support SSH
   composer even on basic plans).
4. Set environment variables on the hosting panel:
   `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `SUPABASE_JWT_SECRET`,
   `LEAD_WEBHOOK_SECRET` (any long random string you generate once).
5. Test `auth_middleware.php` in isolation: log in on the live site,
   copy the Supabase access token from browser dev tools, and call a
   test PHP endpoint with `Authorization: Bearer <token>` to confirm it
   decodes successfully before touching any real feature.

**Nothing goes live yet.** This phase is just plumbing.

---

## Phase 1 — Leads + communications (highest value, lowest risk)

This is the newest, least-entangled part of your app, so it's the
safest place to prove the new pattern works.

1. Deploy `leads_create.php` and a `leads_list.php` (same pattern —
   ask me and I'll write it) to your hosting.
2. Point the CRM's "Add Lead" and lead list screens at these PHP
   endpoints instead of the Supabase `leads` table. Keep the Supabase
   `leads` table around, untouched, as a fallback during testing.
3. Deploy `leads_webhook.php`, wire up the Make.com scenarios for
   Facebook/Instagram, and (separately) the Google Apps Script → PHP
   push for Google Ads lead form exports. Confirm test leads land
   correctly with the right `source` tag.
4. Run this in parallel with the old Supabase-backed lead flow for at
   least a week of real usage before anyone deletes anything.
5. **CORS Security Lock Down**: Before cutting over to production, update `auth_middleware.php` to restrict CORS to only your production domain `https://ghumofiroo.com` and disable wildcard localhost origin matching.
6. Once confident: stop writing new leads to Supabase's `leads` table.
   Keep the old data there, read-only, until Phase 4 cleanup.

---

## Phase 2 — Hotels, cabs, activities, itineraries

1. Write a one-time export script pulling your existing Supabase
   `hotels`, `hotel_rates` (and the cab/activity equivalents from your
   migrations) into CSV, then import into the new MySQL tables. I can
   also write a script to migrate existing Supabase `payments` into the
   MySQL `payments` table. **CRITICAL STEP**: Because leads are changing
   from UUID to INT auto-increment, this migration script must map the
   old Supabase `lead_id` UUID strings to the newly generated MySQL lead
   INT IDs during the import process, ensuring payment history links
   successfully and prevents orphaned transaction records.

   generate this script once I see the exact current Supabase column
   names.
2. Deploy `inventory_by_city.php` and wire the `ItineraryBuilder.tsx`
   dropdowns to it — this is where the "only show inventory for the
   lead's city" behavior actually gets enforced.
3. Rebuild the itinerary save flow to write into `itineraries`,
   `itinerary_days`, and `itinerary_line_items` via new PHP endpoints.
4. Test a full cycle end-to-end: create lead → build itinerary → totals
   calculate correctly → before moving to Phase 3.

---

## Phase 3 — Quotes and payments (COMPLETE - Staging Verified)

1. Move quote generation (PDF) and the email send into a PHP endpoint;
   record it in the `quotes` table with `status = 'sent'`.
2. Replace Razorpay order creation/verification in
   `server/razorpay-server.ts` with PHP. Point `Booking.tsx`'s `VITE_RAZORPAY_API_BASE` at the new PHP
   endpoints.
3. Run both payment paths in parallel in a staging/test mode
   (Razorpay's test keys) until a handful of real test transactions
   succeed through the PHP path.
   *   **Status**: Verified end-to-end locally and on staging with real `rzp_test_` order creations (`order_TB4KDBZWNsWRve`) and SMTP emails successfully delivered.

---

## Phase 4 — Decommission and cleanup (DEFERRED FOR ROLLBACK SAFETY NET)

> [!WARNING]
> Do NOT decommission `server/razorpay-server.ts` or remove Node dependencies yet. These files serve as a fallback rollback path. Only proceed with cleanup after the new PHP endpoints have run stably in live production for at least two weeks.

Only after Phases 1–3 have run clean in production for a couple of
weeks:

1. Delete `server/razorpay-server.ts` and remove `express`, `mysql2`,
   `bcryptjs`, `jsonwebtoken`, and `razorpay` from `package.json`.
2. Drop the now-redundant Supabase tables for leads/hotels/cabs/
   activities/itineraries — but keep a final SQL export/backup first.
3. Remove `database/schema.sql` from the repo root or clearly mark it
   as historical, so nobody edits the wrong schema in six months.
4. Update `.env.example` to drop the MySQL-in-Node variables and add
   the PHP-side ones for documentation purposes (the actual PHP env
   vars live on the hosting panel, not in the Node `.env`).

---

## Rollback safety net

At every phase, the previous system keeps running untouched until the
new one is verified — nothing is deleted until Phase 4. If a PHP
endpoint misbehaves in Phase 1 or 2, you flip the frontend call back to
the old Supabase query with a one-line change, with no data loss,
because both were writing in parallel during the transition window.
