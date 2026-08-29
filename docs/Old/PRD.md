# Product Requirements Document (PRD) — Ghumo Firoo Journeys CRM & Travel Operating System

**Document Version:** 2.0  
**Status:** Active Draft  
**Target Platform:** B2C Booking Engine & B2B Travel Agency SaaS / Operating System

---

## 1. Product Vision & Overview

Ghumo Firoo Journeys is a dual-mode travel agency platform engineered to serve both B2C travelers and B2B travel agents:

1. **B2C Public Travel Portal:** A high-converting public booking site where travelers browse, filter, and purchase curated tour packages with transparent pricing, online checkout (Razorpay), and automated email notifications.
2. **B2B Travel Agency CRM & Itinerary Builder:** A private internal operating system where travel agents manage leads, configure contracted rates, and generate custom day-by-day itineraries linking hotels, cabs, sightseeing, and activities.
3. **Multi-Tenant Travel SaaS (Next Horizon):** A multi-tenant platform empowering independent travel agencies to host their branded booking portal and CRM under subdomains (`<agency>.ghumofiroo.com`) with isolated data scoping.

---

## 2. Core Architecture & Strict Separation Rules

- **Catalog vs. Custom Itineraries:** Public tour packages (`packages`, `package_template_items`) and private lead-specific itineraries (`itineraries`, `itinerary_days`, `itinerary_line_items`) are strictly separated. Private quotes are never exposed to public crawlers or package listing pages.
- **Identity & Data Bridge:** Business data resides in MySQL (`ghumofiroo` database). Authentication is handled via Supabase Auth with JWT verification, mapped to local role-based permissions (`admin`, `manager`, `agent`).
- **Shared Hosting Deployment:** Deployed via cPanel shared hosting (`ghumofiroo.com` document root) with a lightweight PHP 8.2 backend and React/Vite TypeScript frontend.

---

## 3. Dynamic Linked Inventory & Itinerary Builder Requirements

### 3.1 Foreign Key & City Linkage Schema (`city_id`)
To eliminate empty search results in the itinerary builder, all contracting tables must link to the master `cities` table via integer `city_id` Foreign Keys rather than loose `VARCHAR` string names:

```
[cities (id PK)] 
    │
    ├──> [hotels (city_id FK)] ────────> [hotel_rates (hotel_id FK)]
    │
    ├──> [cab_vendors (city_id FK)] ────> [cab_rates (cab_vendor_id FK)]
    │
    └──> [sightseeings (city_id FK)] ───> [activities (sightseeing_id FK, city_id FK)] ──> [activity_rates]
```

### 3.2 Linked Item Hierarchy
- **City / Destination Master:** Central anchor (`cities` table). Selecting a city filters available inventory across all tabs.
- **Hotels:** Filtered by `city_id`, star category, and meal plan (`EP`, `CP`, `MAP`, `AP`).
- **Cabs & Transport:** Filtered by `city_id` (pick-up / drop / local sightseeing / outstation per km).
- **Sightseeing Spots:** Linked to `city_id`. Each sightseeing spot contains descriptions, images, entry fees, and operating hours.
- **Activities (Sightseeing-Linked):** Activities (e.g., Shikara ride in Dal Lake, Ropeway in Gulmarg, Helicopter ticket in Kedarnath) are explicitly linked to their parent `sightseeing_id` and `city_id`.

### 3.3 Itinerary Builder 4-Tab User Workflow
1. **Tab 1: Days & Route Planning:** Set trip duration, select cities/destinations per day, assign daily descriptions.
2. **Tab 2: Hotels & Stay:** Pick contracted hotels per city based on star rating, room type, and meal plan with live cost calculation.
3. **Tab 3: Transport & Cabs:** Select vehicle type (Sedan, SUV, Tempo Traveller) and route pricing (Local 8hr/80km, Airport Transfer, Outstation).
4. **Tab 4: Sightseeing & Activities:** Select sightseeing spots per day; automatically load and attach associated activities/experiences with per-person or group rates.

---

## 4. Contracted Data Seeding Requirements

### 4.1 Initial High-Priority Destinations
The itinerary builder requires seeded contracted vendor rates to produce instant, accurate calculations without manual rate typing. Contracting data entry will focus on:

1. **Char Dham Yatra Circuit:** Haridwar, Rishikesh, Barkot, Yamunotri, Uttarkashi, Gangotri, Guptkashi, Kedarnath, Badrinath, Pipalkoti, Dehradun.
2. **Kashmir Circuit:** Srinagar, Gulmarg, Pahalgam, Sonamarg, Doodhpathri.

### 4.2 Secondary Destinations
- Himachal Pradesh (Manali, Shimla, Dharamshala, Spiti)
- Rajasthan (Jaipur, Udaipur, Jaisalmer, Jodhpur)
- Goa, Kerala, and Golden Triangle

---

## 5. Travel Document Engine (Quotes, Invoices & Vouchers)

Agents require one-click PDF document generation directly from the CRM:

1. **Custom Itinerary Quotes:** Branded PDF proposals sent to leads via WhatsApp/Email featuring day-wise breakdown, inclusion/exclusion list, total cost, and booking payment links.
2. **Tax Invoices:** GST-compliant payment invoices issued upon payment receipt (calculating CGST/SGST/IGST or SAC 9985).
3. **Service Vouchers:**
   - **Hotel Voucher:** Sent to hotel partners with confirmation numbers, guest names, meal plans, and check-in/out dates.
   - **Cab Voucher:** Sent to cab drivers/vendors with guest details, vehicle type, pickup location, and itinerary route.
   - **Activity Voucher:** Entry tickets and activity confirmation vouchers.

---

## 6. Multi-Tenant Travel SaaS Architecture (`tenant_id` Layer)

### 6.1 Multi-Tenancy Design
To commercialize the platform into a white-label Travel Agency SaaS:
- Add a `tenant_id INT NOT NULL` column across all database tables (`leads`, `itineraries`, `hotels`, `cab_vendors`, `activities`, `packages`, `profiles`).
- Every PHP backend query will automatically scope database operations using `WHERE tenant_id = ?`.

### 6.2 Subdomain & White-Label Routing
- **Subdomain Pattern:** `<agency_slug>.ghumofiroo.com` (e.g., `himalaya.ghumofiroo.com`).
- **DNS & Server Setup:** Wildcard DNS record (`*.ghumofiroo.com`) pointing to cPanel server, managed via Apache `.htaccess` rewrite rules resolving tenant context from host header.
- **Branding Isolation:** Custom agency logo, brand colors, contact numbers, and agency address on generated PDFs and customer-facing pages.

### 6.3 SaaS Subscription Pricing Tiers

| Feature | Starter (₹999/mo) | Professional (₹2,499/mo) | Enterprise (₹5,999/mo) |
| :--- | :--- | :--- | :--- |
| **Active Leads** | Up to 100/mo | Up to 1,000/mo | Unlimited |
| **Itinerary Builder** | Standard | Advanced + PDF Export | Custom Templates + Branded Vouchers |
| **Team Accounts** | 2 Staff Accounts | 5 Staff Accounts | 20 Staff Accounts |
| **Contracted Rate CMS** | Pre-loaded master data | Pre-loaded + Custom Rates | Full API & Custom Rates |
| **Domain** | Subdomain | Subdomain | Custom Domain Support |

---

## 7. Immediate Actionable Roadmap (Execution Sequence)

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: city_id Foreign Key Refactoring (1 Day)         │
│ Fix Schema FKs for Cabs, Sightseeing & Activities       │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│ Step 2: Contracting Data Seeding (1 Day)               │
│ Seed Char Dham & Kashmir Hotels, Cabs & Activities      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│ Step 3: Voucher & Invoice PDF Suite (1 Day)             │
│ Implement Hotel/Cab Vouchers & GST Invoices             │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│ Step 4: Staging & Production Deployment (0.5 Day)       │
│ Upload & verify on ghumofiroo.com shared hosting        │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│ Step 5: SaaS Multi-Tenant Layer (1 Week)                │
│ Add tenant_id schema, query scoping & subdomain routing │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Success Criteria & KPIs

1. **Zero Empty Builder Searches:** Selecting any city with seeded contracting data immediately displays available hotels, cabs, and sightseeing spots without empty state errors.
2. **Speed to Quote:** Agents can generate and send a complete branded itinerary quote PDF to a lead in under 2 minutes.
3. **Multi-Tenant Data Isolation:** Zero cross-tenant data leaks when multiple travel agency accounts operate concurrently.
