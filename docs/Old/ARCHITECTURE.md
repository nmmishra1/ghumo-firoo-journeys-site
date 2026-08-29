# System Architecture — Ghumo Firoo Journeys & Travel SaaS

**Document Version:** 2.0  
**Updated:** August 2026  
**Target Platform:** Dual-Mode B2C Booking Engine + B2B Travel Operating System & SaaS

---

## 1. Runtime Shape & Infrastructure

```
                                  ┌─────────────────────────────────────────┐
                                  │      Cloud AI Microservice (Render)     │
                                  │  gemini-web2api Docker Container        │
                                  │  https://gemini-web2api-sxti.onrender.com
                                  └────────────────────▲────────────────────┘
                                                       │ HTTPS OpenAI API
┌──────────────────────────────────────────────────────┴──────────────────────────────────────────────────────┐
│ PRODUCTION HOSTING: cPanel Shared Hosting (ghumofiroo.com)                                                   │
│                                                                                                             │
│  ┌──────────────────────────────────────────────┐        ┌───────────────────────────────────────────────┐  │
│  │ Frontend SPA                             │        │ PHP 8.2 Backend REST API (`/php-backend`)     │  │
│  │ React 18 + Vite + TypeScript + Tailwind      │ ─────> │ JWT Verification (`auth_middleware.php`)      │  │
│  │ Served from root `ghumofiroo.com/`           │        │ PDO MySQL Connection Pool (`db.php`)          │  │
│  └──────────────────────────────────────────────┘        └──────────────────────┬────────────────────────┘  │
│                                                                                 │                           │
└─────────────────────────────────────────────────────────────────────────────────┼───────────────────────────┘
                                                                                  │ MySQL Protocol
                                                                 ┌────────────────▼────────────────┐
                                                                 │ Production Database (MySQL)     │
                                                                 │ a17511nd_GFPackage / GFStaging  │
                                                                 └─────────────────────────────────┘
```

- **Frontend:** Single Page Application (SPA) built with React 18, Vite, TypeScript, and Tailwind CSS. The `dist/` production bundle is deployed to the root domain (`ghumofiroo.com/`).
- **Backend API:** Lightweight, high-performance PHP 8.2 endpoint suite (`php-backend/`). Authentication is handled via Supabase-issued ES256 JWT tokens verified by `auth_middleware.php`.
- **AI Microservice:** External Docker container hosted on Render (`https://gemini-web2api-sxti.onrender.com/v1`). Provides OpenAI-compatible `/v1/chat/completions` API powered by Google Gemini (3.6 Flash / 3.5 Flash Thinking).
- **Database:** MySQL relational database holding business data, CRM leads, contracted rates, and packages.

---

## 2. Identity, Data & Scoping Architecture

| Concern | System of Record | Mechanism |
| :--- | :--- | :--- |
| **Business Data** | MySQL (`a17511nd_GFPackage`) | Relational PDO Queries (`db.php`) |
| **User Authentication** | Supabase Auth | Issued ES256 JWT Tokens |
| **API Authorization** | PHP Backend Middleware | Role Checks (`admin`, `manager`, `agent`) |
| **AI Intelligence** | Render Cloud (`gemini-web2api`) | OpenAI-Compatible SSE API (`sk-gemini`) |
| **Multi-Tenancy** | MySQL (`tenant_id` column) | Query Scoping & Subdomain Routing |

---

## 3. Data Model Architecture: Linked Inventory Engine

To prevent empty search results in the Itinerary Builder, all contracting tables link to a central `cities` master via integer `city_id` Foreign Keys:

```
                              ┌──────────────────┐
                              │   cities (id PK) │
                              └────────┬─────────┘
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │ city_id FK                  │ city_id FK                  │ city_id FK
┌────────▼────────┐           ┌────────▼────────┐           ┌────────▼────────┐
│     hotels      │           │   cab_vendors   │           │   sightseeings  │
└────────┬────────┘           └────────┬────────┘           └────────┬────────┘
         │ hotel_id FK                 │ cab_vendor_id FK            │ sightseeing_id FK & city_id FK
┌────────▼────────┐           ┌────────▼────────┐           ┌────────▼────────┐
│   hotel_rates   │           │    cab_rates    │           │    activities   │
└─────────────────┘           └─────────────────┘           └────────┬────────┘
                                                                     │ activity_id FK
                                                            ┌────────▼────────┐
                                                            │  activity_rates │
                                                            └─────────────────┘
```

- **City Master (`cities`):** Central destination entity filtering all downstream inventory.
- **Hotels & Rates:** Filtered by `city_id`, star category, and meal plan (`EP`, `CP`, `MAP`, `AP`).
- **Cabs & Rates:** Filtered by `city_id` (local 8hr/80km, outstation per km, airport transfer).
- **Sightseeing & Activities:** Sightseeing spots belong to a city; activities are explicitly mapped to their parent `sightseeing_id` (e.g., Shikara Ride linked to Dal Lake).

---

## 4. Multi-Tenant SaaS Subdomain Architecture

```
[Agency 1] hoshiarpur.ghumofiroo.com ──┐
[Agency 2] himalaya.ghumofiroo.com   ──┼──> [Apache Wildcard .htaccess] ──> [PHP Resolves tenant_id] ──> WHERE tenant_id = ?
[Agency 3] royal.ghumofiroo.com      ──┘
```

- **Tenant Scoping:** Every database table contains a `tenant_id INT NOT NULL` column.
- **Subdomain Resolution:** Apache `.htaccess` rewrites wildcard subdomains (`*.ghumofiroo.com`) to the main application entry point. PHP extracts the tenant slug from the `Host` header and injects `tenant_id` into all database queries.

---

## 5. Deployment Constraints & Hosting Rules

- **Hosting Environment:** cPanel Shared Hosting.
- **Document Root:** Must strictly be **`ghumofiroo.com/`** (NOT `public_html`).
- **Deployment Process:** Build locally (`npm run build:dev` or `npm run build`), then upload `dist/` and `php-backend/` via cPanel File Manager / Terminal.
- **No Node Server in Production:** The production website runs on static React assets + PHP 8.2. Node/Express services are for local development / migration history only.
- **External AI Server:** The AI layer runs independently on Render (`https://gemini-web2api-sxti.onrender.com`), decoupled from cPanel hosting limits.
