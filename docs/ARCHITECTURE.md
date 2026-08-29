# System Architecture — Ghumo Firoo Journeys

**Version:** 3.0 (rewritten from direct codebase inspection)
**Author's note:** The existing `docs/ARCHITECTURE.md` describes a cleaner, more unified system than what's actually in the repository — e.g. it shows `cities → hotels/cab_vendors/sightseeings` as a clean FK hierarchy, which is not how the tables were actually built or connected. This document reflects what the code does, verified by reading it directly, including the parts that are messier than the previous doc suggests.

---

## 1. High-Level Shape

```
┌─────────────────────────────┐
│  React 18 + Vite + TS SPA   │   Single build, two audiences:
│  (src/)                     │   public marketing/booking site + /crm/* internal app
└──────────────┬───────────────┘
               │ fetch() calls, no shared API client layer
               ▼
┌───────────────────────────────────────────────────────────────────┐
│  php-backend/  — ~97 flat PHP files, no framework                 │
│  Mix of: one endpoint per concern (activities.php, hotels.php...) │
│  + a generic DESCRIBE-based CRUD handler (mysql-crud.php) used    │
│  for simpler tables (cities, states, sightseeings, seasons, etc.) │
└──────────────┬────────────────────────────────┬────────────────────┘
               │ PDO/MySQL                       │ verifies JWT, re-checks
               ▼                                 │ approval/active/lockout
┌──────────────────────────────┐                 │ on EVERY request
│  MySQL — primary business DB │◄────────────────┘
│  leads, itineraries, hotel/  │
│  cab contracts & rates,      │      ┌───────────────────────────┐
│  packages, users             │      │ Supabase (Postgres)       │
└──────────────────────────────┘      │ Auth (session issuance)   │
                                       │ + some content/marketing  │
                                       │ data, used in parallel    │
                                       └───────────────────────────┘
```

There is also a minimal Node/Express server (`server/razorpay-server.ts`) alongside the PHP backend — the PHP layer is where the vast majority of business logic actually lives; Node's role is narrow (Razorpay-related).

**The key architectural fact to understand about this system: there are effectively two backends and two databases operating in parallel, not one.** Supabase (Postgres + Auth) and the PHP/MySQL stack both hold real data, and which one is authoritative depends on the feature — this is not a deliberate CQRS-style split, it's the result of the project having been built in two different phases/tools without fully consolidating.

---

## 2. Frontend

- React 18, Vite 5, TypeScript 5, Tailwind CSS, shadcn/ui component library, React Router 6, TanStack Query.
- 172 distinct routes, ~310 `.ts`/`.tsx` files under `src/`.
- Two largely separate zones inside one app: `src/pages/*` (public marketing/booking pages) and `src/pages/crm/*` (internal tool), sharing some UI components (`src/components/ui`) but little business logic.
- **Public package pages are mostly hand-authored, not data-driven.** `src/pages/packages/` has ~59 files; several destinations (Singapore, Europe) have 5–7 near-duplicate page variants. A `DynamicPackageDetail.tsx` component (4,000+ lines) exists as the intended replacement but hasn't fully superseded the older pages — both are live and routed simultaneously.
- **CRM pages are large, monolithic components.** Several exceed 2,000–6,000 lines (`ItineraryBuilder.tsx` ~6,000, `HotelContracting.tsx` ~3,300, `CabContractWizard.tsx` ~1,500), each mixing data-fetching, business/pricing logic, and rendering in one file rather than separated into hooks/services.
- No dedicated API client/service layer for the CRM — most pages call `fetch()` directly against PHP endpoints inline, which is how endpoint inconsistencies (see §5) end up duplicated across many files instead of centralized in one place.

## 3. Backend

### 3.1 PHP layer (`php-backend/`) — the primary API surface
- No framework; each file is a standalone script reached as `api.php?table=X` (routed to a generic CRUD handler) or as its own file (`activities.php`, `hotels.php`, `itinerary_save.php`, `inventory_by_city.php`, etc.) for anything with business logic beyond basic CRUD.
- `mysql-crud.php` is a genuinely well-built generic handler: it reads the real table structure via `DESCRIBE` before accepting input, so it can't be tricked into writing to non-existent columns. Used for `cities`, `states`, `countries`, `sightseeings`, `seasons`, `room_categories`, and most contract/rate tables.
- `auth_middleware.php` is the real authorization boundary: it verifies the Supabase-issued JWT, then re-checks the user's approval/active/lockout/agency-suspension status against MySQL **on every single request** — not just at login. This means revoking a user's access takes effect on their very next API call, not just at their next login.
- A `BYPASS_AUTH` environment-variable escape hatch exists in `auth_middleware.php` that, if set, returns a hardcoded admin identity with no token check at all. It was not set in the `.env` reviewed, but its mere presence in production code is worth a deliberate decision (remove it, or gate it behind a build flag that can't reach production) rather than leaving it as a live toggle.

### 3.2 Node/Express (`server/`)
- Present, narrow in scope — primarily Razorpay-related server logic. Not the main application backend.

### 3.3 Supabase
- Auth (session/JWT issuance) is genuinely load-bearing — the whole system depends on it for login.
- Postgres tables under `supabase/migrations/` hold some content and package data in parallel with MySQL's own package-related tables. These are not kept in sync automatically; they were built at different points and serve overlapping purposes without a clear single owner.

---

## 4. Data Layer — What's Actually Connected vs. Not

This is the most important section for anyone extending this system, because the wiring is not what a diagram of table names would suggest.

**Hotels — correctly connected (as of this review cycle):**
```
hotels (has real city_id FK) → hotel_contracts → hotel_contract_rates
                                                    (season × room-category × meal-plan,
                                                     real GST/markup fields)
```
`inventory_by_city.php` (what the Itinerary Builder actually calls) reads this chain, falling back to a separate legacy `hotel_rates` table only for a given hotel if it has no contract rates. This connection did not exist before this review cycle — the contracting UI and the itinerary builder previously read from two disconnected tables.

**Cabs — connected, but with a real schema gap:**
```
cab_suppliers → cab_contracts → cab_contract_rates → cab_vehicles
                                        ↓
                                   cab_routes (source/destination as free TEXT — no city_id)
```
Cab rates are scoped to a *route* (e.g. "Delhi → Haridwar"), not a city, and neither `cab_suppliers` nor `cab_routes` has a `city_id` column anywhere in the real schema. City-based cab lookup therefore matches on `LOWER(source)`/`LOWER(destination)` text against the requested city name — functional, but fragile in the same way as free-text matching elsewhere in this codebase (typos or naming variants silently produce no results, not an error). A real fix would add `city_id` to `cab_routes`.

**Activities & Sightseeing — connected at the data layer, not yet in the builder UI:**
```
cities (id PK) → activities.city_id, sightseeings.city_id  →  inventory_by_city.php
```
This link required a migration — `city_id` did not previously exist on either table; matching was done by comparing free-text `destination` strings against city names. It's fixed now, and `inventory_by_city.php` returns the right data. **However, the Itinerary Builder's activity/sightseeing picker does not currently call this data** — it was never wired to consume it, so this remains a real, open gap (see PRD §4.1 and §6).

**Packages — not consolidated, multiple parallel models exist simultaneously:**
1. A Supabase `packages` table storing each package as one row with JSON/array columns (itinerary, inclusions, highlights) — what most of the hardcoded public package pages read from, when they read from a backend at all rather than having content typed directly into the React component.
2. A simpler MySQL `packages` + `package_hotels` + `package_attractions` schema.
3. A more relational MySQL `package_variants` schema (variant-per-night-count, variant hotels, variant price rows) — structurally the best fit for "different hotel/cab sets per night count," but only lightly used.
4. Hardcoded PHP arrays inside `calculate_fare.php` specifically for the Rann Utsav mockup page's pricing — not backed by any of the above tables at all.

None of these four is "the" source of truth; which one a given package page uses depends on which one it happened to be built against.

**Geography — two parallel models:**
- `cities` / `states` / `countries` (flat tables, real IDs) — what the Destinations Master CRM screen and most contracting tables use.
- A separate unified `destinations` hierarchy table (with `destination_type` and `parent_destination_id` representing country/state/city all in one table) exists in some migrations and is used by a differently-shaped `attractions`/`activities` schema that isn't the one live in production. Worth knowing this exists so it isn't mistaken for the active geography model.

---

## 5. Pricing & Financial Data Flow

```
Agent builds itinerary in browser (ItineraryBuilder.tsx)
        │  computes total_cost client-side per hotel/transport/excursion line
        ▼
itinerary_save.php
        │  as of this review cycle: independently recomputes an expected cost
        │  from hotel_contract_rates / cab_contract_rates / activity_rates
        │  and FLAGS (does not block) any line where the client's number
        │  doesn't match — logged + stored on the itinerary row
        ▼
MySQL `itineraries` (+ pricing_flagged, pricing_variance columns)
```
Before this review cycle, the server stored whatever `total_cost` the browser sent with no independent check at all. The flag-only validation is a deliberate first step, not a finished control — hard-blocking mismatched saves is a reasonable next step once flagged data has been reviewed for false positives.

---

## 6. Security-Relevant Findings (carried forward from this review, for the record)

- A live Razorpay secret key and SMTP password were found sitting in a plaintext `.env` file within an earlier project export. It was not committed to git, but was present in an uploaded archive — rotating any credential that leaves a controlled location is the safe default regardless of git status.
- `auth_middleware.php`'s `BYPASS_AUTH` escape hatch (§3.1) and a Vite `import.meta.env.DEV`-gated mock-admin fallback in `useAuth.tsx` are both high-blast-radius if either is ever true in a production context — neither appeared to be active, but both are worth a deliberate architectural decision rather than remaining ambient possibilities.
- Session revocation is enforced correctly as of this review cycle (§3.1) — this was a real gap (deactivated users could keep working until their token happened to expire) that has been fixed.

---

## 7. Practical Guidance for Anyone Extending This System

1. **For hotel/cab rates:** read from `hotel_contract_rates` / `cab_contract_rates` via `inventory_by_city.php`. Do not read from `hotel_rates` / `cab_rates` directly — those are legacy fallbacks only.
2. **For city/geography:** use the `cities`/`states`/`countries` tables, not the separate `destinations` hierarchy table, unless you're deliberately working in the area of the codebase that already uses the latter.
3. **For new packages:** prefer extending the `package_variants` relational schema over adding another hardcoded page or another parallel table — it's the closest existing model to "one package, multiple night-count/hotel/cab sets."
4. **Before trusting any endpoint's data shape, check `mysql-crud.php`'s `DESCRIBE`-based column list against what you're sending** — several past bugs in this codebase came from a form sending a field name (`city_name` vs `name`, `child_cost` vs `child_rate`) that didn't match what a given table actually called that column.
