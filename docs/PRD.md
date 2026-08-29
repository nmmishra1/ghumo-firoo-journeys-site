# Product Requirements Document — Ghumo Firoo Journeys

**Version:** 3.0 (rewritten from direct codebase inspection, not the prior PRD)
**Status:** Reflects the application as it actually exists today
**Author's note:** This PRD was written by reading the real code — routes, database schema references, and CRM screens — rather than restating the existing `docs/PRD.md`, which describes an aspirational target state (e.g. "all contracting tables link via `city_id`") that doesn't match what's actually implemented in several places. Where this document says something is "not yet true," that's been verified against the code, not assumed.

---

## 1. What This Product Actually Is

Ghumo Firoo Journeys is two products sharing one codebase and one database:

1. **A public B2C travel marketing/booking site** — travelers browse tour packages (Char Dham, Rann Utsav, Kashmir, Singapore, Europe, and others), read blog/guide content, submit enquiries, and pay online via Razorpay.
2. **An internal B2B CRM / travel operations system** (`/crm/*`) — travel agents manage leads, contract hotel and cab rates with suppliers, build day-by-day customer itineraries, and generate quotes/invoices/vouchers as PDFs.

There is no functioning multi-tenant SaaS layer today (branded sub-domains per agency, isolated tenant data) — the previous PRD describes this as a near-term goal, but nothing in the codebase implements tenant isolation. It should be scoped as future work, not current state.

---

## 2. Users

- **Traveler (public site visitor):** browses packages, submits an enquiry or books directly, pays online, leaves a review post-trip.
- **Travel Agent:** works leads in the CRM, builds itineraries, sends quotes, tracks follow-ups.
- **Contracting/Ops staff:** maintains hotel and cab supplier contracts and rate cards, maintains the destination/activity master data.
- **Admin/Manager:** approves new agent accounts, manages users, views reports and audit logs, has elevated access across all CRM modules.

Role enforcement exists (`admin` / `manager` / `agent`) and is checked server-side on every PHP endpoint via `auth_middleware.php`, not just in the UI.

---

## 3. Public Site — Functional Requirements (as built)

- **Package browsing:** `/packages`, `/destinations`, and ~50 individual package detail routes. Most of these are hand-built, near-duplicate React pages per destination/variant (e.g. six separate Singapore package pages, seven Europe variants) rather than one template driven by data. A newer `DynamicPackageDetail.tsx` component exists and is intended to replace this pattern, but the older hardcoded pages are still live and still routed.
- **Rann Utsav mockup page** (`/packages/rann-utsav-mockup`): the one package flow built to be genuinely backend-driven — pricing and itinerary come from `calculate_fare.php` rather than being hand-typed per page (see Architecture doc for how this actually calculates pricing today vs. how it should).
- **Content:** blog (`/blog/:slug`), destination guides (`/guides/:slug`), FAQ, about/contact/career/terms/privacy.
- **Booking & payment:** `/booking`, `/pay/:leadId`, `/payment/:leadId`, Razorpay checkout integration, quote-acceptance via a tokenized link (`/quote/:token`).
- **Reviews:** post-booking review submission (`/review/:bookingReference`).
- **Auth for travelers:** none required for browsing; account creation exists (`/signup`) but is separate from the CRM agent login (`/auth`).

## 4. CRM — Functional Requirements (as built)

Confirmed modules, by route:

| Module | Route | What it does |
|---|---|---|
| Leads / Opportunities | `/crm/leads`, `/crm/opportunities` | Lead pipeline, lead detail, follow-ups, edit |
| Itinerary Builder | `/crm/leads/:leadId/itinerary` | Day-by-day builder: hotels, transport, activities/excursions per day, live cost calculation, save/load draft |
| Quotes / Proposals | `/crm/quotes`, `/crm/leads/:leadId/proposals` | Branded PDF quote generation from a saved itinerary |
| Invoices / Vouchers | `/crm/leads/:leadId/invoice`, `/crm/leads/:leadId/voucher` | GST invoice and hotel/cab service voucher generation |
| Hotel Contracting | `/crm/hotels` | Supplier → contract → seasonal/room/meal-plan rate entry (the real rate source of truth — see Architecture doc) |
| Cab Contracting | `/crm/cabs` | Supplier → contract → vehicle/route/season rate entry, including toll/parking/permit/state-tax as real fields |
| Destinations Master | `/crm/settings/destinations` | Country → State → City hierarchy, plus a Places & Activities panel per city |
| Activity / Sightseeing Master | `/crm/activities`, `/crm/sightseeings` | Master catalog of bookable activities and sightseeing spots, linked to a city |
| Packages (CRM side) | `/crm/packages` | Internal package/catalog management |
| Suppliers, Visas, Reviews, Blogs | `/crm/suppliers`, `/crm/visas`, `/crm/reviews`, `/crm/blogs` | Supporting master data and content management |
| Reports, Audit Log | `/crm/reports`, `/crm/audit-log` | Operational reporting and change history |
| Bulk Upload | `/crm/bulk-upload` | Spreadsheet-based data import |
| Payments | `/crm/payments` | Payment tracking |
| User management | via Settings | Agent account approval/deactivation, role assignment |

### 4.1 Itinerary Builder — current behavior (important, since it doesn't fully do what it should)
- Agents add hotels, cabs, and activities per day. Hotel/cab options are correctly pulled from the real contracted-rate tables as of this review cycle.
- **Activities/sightseeing options in the picker are not yet pulled from the city-scoped master catalog** — the picker only shows items already saved on that itinerary or manually re-entered mid-session. This is a known, unresolved gap: content added via Destinations Master or the Activity/Sightseeing Master pages does not yet appear as a selectable option in the builder. This should be treated as an open requirement, not assumed-working.
- Final pricing is computed client-side and saved; a server-side second-opinion check now flags (does not yet block) itineraries where the saved total doesn't match the real contracted rate.

### 4.2 Contracting — current behavior
- Hotel Contracting and Cab Contracting both produce genuinely rich, season/occupancy-aware rate data (`hotel_contract_rates`, `cab_contract_rates`).
- As of this review cycle, the Itinerary Builder's inventory endpoint reads from these tables directly (with fallback to older, simpler legacy tables only when no contract rate exists) — this connection did not exist prior to this review and had to be built.

---

## 5. Non-Functional Requirements / Constraints (as observed)

- **Authentication:** Supabase Auth issues the session; every PHP endpoint independently re-verifies the user's approval/active/lockout status against MySQL on each request via `auth_middleware.php` — this is the actual authorization boundary, not just having a valid session token.
- **Data residency:** primary business data (leads, itineraries, contracts, rates) lives in MySQL, reached through a flat, framework-less PHP 8.2 API layer. Supabase (Postgres) is used in parallel for auth identity and for some content/marketing data — these are two separate databases, not one system with two access paths.
- **No automated test suite or CI type-checking gate observed** — TypeScript compiles with pre-existing errors across multiple CRM files that nothing currently blocks on.
- **Deployment:** shared PHP hosting, SPA served as a static build. No staging/production environment separation was verified from the code alone beyond a `staging_deploy_pkg` folder.

---

## 6. Known Gaps to Scope as Real Work (not aspirational — confirmed present)

1. Itinerary Builder's activity/sightseeing picker isn't wired to the master catalog (§4.1).
2. Package/itinerary data is modeled in multiple, overlapping ways across the codebase (see Architecture doc §5) rather than one schema — new package types currently get built as one-off code rather than data.
3. Pricing validation is flag-only, not enforced — a submitted itinerary total can still diverge from the real contracted rate without being blocked.
4. Cab availability-by-city relies on free-text route matching (`cab_routes.source`/`destination`), not a real foreign key — there is no `city_id` anywhere in the cab contract chain.
5. Public package pages are largely hand-built per destination rather than data-driven, making every new package a code change instead of a content entry.

## 7. Out of Scope (for this document)

- Multi-tenant SaaS / branded sub-domains — no implementation exists; would need real design work before being called a requirement.
- AI-assisted itinerary generation — not present in the reviewed codebase.
- Mobile app — the product is a responsive web app only.
