# 🌍 Ghumo Firoo Journeys — Luxury Travel Platform & Enterprise CRM

<div align="center">

![Ghumo Firoo Travels Logo](public/ghumo-firoo-logo.png)

### **Next-Generation Travel Commerce, Static SEO Engine & Enterprise Travel CRM**

[![React 18](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PHP Backend](https://img.shields.io/badge/PHP-8.2_PDO-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Baileys WhatsApp](https://img.shields.io/badge/WhatsApp-Baileys_Automation-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://github.com/WhiskeySockets/Baileys)

**Live Website**: [https://ghumofiroo.com](https://ghumofiroo.com) &nbsp;|&nbsp; **CRM Portal**: [https://ghumofiroo.com/auth](https://ghumofiroo.com/auth) &nbsp;|&nbsp; **WhatsApp Automation**: [https://ghumofiroo-whatsapp-service.onrender.com/pair](https://ghumofiroo-whatsapp-service.onrender.com/pair)

</div>

---

## 📖 Executive Summary

**Ghumo Firoo Journeys** is a full-stack, enterprise-grade travel commerce platform and customer relationship management (CRM) suite designed for high-touch luxury bespoke travel, group tours, and pilgrimage expeditions across India, Europe, Southeast Asia, and the Middle East.

The platform combines a **high-speed pre-rendered static storefront** optimized for Google SEO Core Web Vitals with a **robust B2B/B2C CRM ecosystem** featuring automated itinerary generation, real-time hotel contracting, cab pricing engines, multi-channel lead tracking, and Baileys-driven WhatsApp proposal dispatch.

---

## 🌟 Visual Showcase & Key Destinations

<div align="center">

| 🎪 Rann Utsav White Desert | 🚩 Char Dham Helicopter & Road | 🏔️ Kashmir & European Circuits |
| :---: | :---: | :---: |
| <img src="public/Rann-Utsav-Gujarat.png" width="300" alt="Rann Utsav Gujarat" /> | <img src="public/Kedarnath.png" width="300" alt="Char Dham Pilgrimage" /> | <img src="public/Europe Image New.png" width="300" alt="Europe Collection" /> |
| **Official Evoke Tent City Partner** (1N, 2N, 3N, 4N Packages) | **VIP Dehradun Heli Charters** & Luxury SUV Road Safaris | **Swiss Alps, Paris, Italy** & Kashmir Gondola Experiences |

</div>

---

## 🚀 Core Features & Architecture Breakdown

### 1. 🛍️ Customer-Facing Travel Portal
- **Dynamic Tour Catalog**: Curated circuits for **Char Dham Yatra**, **Rann Utsav Kutch**, **Kashmir Paradise**, **Grand Europe**, **Singapore & Sentosa**, **Bali**, **Dubai**, **Thailand**, and **Vietnam**.
- **Interactive Tour Customizer**: Real-time pricing calculator allowing guests to select travel dates, group size (adults, children, infants), transport preferences, and meal plans with instant cost breakdown.
- **Smart Route Prefetching**: Background chunk and route prefetching on link hover for instantaneous page transitions.
- **Core Web Vitals Optimized**:
  - **CLS (Cumulative Layout Shift)**: `0.00`
  - **INP (Interaction to Next Paint)**: `< 35 ms`
  - In-place lossless image compression saving over **100+ MB** of network payload.
- **Direct Enquiries & Instant Quotations**: Lead forms integrated directly into the CRM database with SMS, email, and WhatsApp notifications.

---

### 2. 🔍 Automated Static SEO Engine (113+ Pre-Rendered Pages)
- **Pre-Render Build Script** (`scripts/generate-static-pages.mts`): Automatically compiles 113+ unique standalone HTML files into `dist/` with customized OpenGraph tags, canonical tags, and structured JSON-LD data.
- **Schema.org Rich Snippets**:
  - `TravelAgency` Schema with official business registration (NIDHI / Ministry of Tourism).
  - `TouristTrip`, `Offer`, and `AggregateRating` schemas for all package routes.
  - `FAQPage` schema for rich Google search result accordions.
  - `BreadcrumbList` navigation schemas.
- **Dynamic `sitemap.xml` Generator**: Auto-updates all published packages, blog articles, and landing pages on every production build.

---

### 3. 💼 Enterprise Travel CRM (`/crm`)

<div align="center">
<img src="public/crm_login_bg.png" width="700" alt="CRM Portal Login" />
</div>

#### **Key CRM Capabilities:**
- **Kanban Lead Pipeline**: Visual drag-and-drop workflow tracking leads from *New Inquiry ➔ Contacted ➔ Proposal Sent ➔ Negotiating ➔ Confirmed / Won ➔ Lost*.
- **Visual Itinerary Workspace**: Drag-and-drop day-by-day itinerary creator with hotel check-ins, sightseeing highlights, cab pickups, and inclusions/exclusions.
- **Hotel Contracting & Rate Master**:
  - Multi-season rate sheets (Peak, Regular, Off-Season).
  - Room categories (Deluxe, Super Deluxe, Premium Tents, Luxury Suites).
  - Meal plan modifiers (EP, CP, MAP, AP) and extra adult/child matrix.
- **Transport & Cab Routing Engine**: Distance and tariff calculation for Sedans, SUVs, Innova Crysta, and Tempo Travellers across North India, Gujarat, and South India.
- **Automated Quotation & Voucher PDF Generator**: One-click generation of branded PDF proposals, booking confirmations, tax invoices, and service vouchers.
- **Role-Based Access Control (RBAC)**: Secure multi-tier permissions for Super Admin, Travel Directors, Operations Managers, and Sales Executives.

---

### 4. 📲 WhatsApp Baileys Automation Microservice
- **Repository**: Hosted microservice running `@whiskeysockets/baileys` inside Docker on Render.
- **8-Digit Phone Pairing Code**: Link official WhatsApp numbers (`+91 99109 87264`) directly via phone code or QR scan without requiring physical phone camera cables.
- **Automated Messages**:
  - Instant lead acknowledgment and brochure dispatch.
  - Payment receipt and booking confirmation PDFs.
  - Driver & cab pickup details sent 24 hours prior to travel.
  - Feedback collection post-trip.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Radix UI Primitives, Shadcn UI |
| **Build & Tooling** | Vite 5, PostCSS, Autoprefixer, TSX, ESBuild |
| **SEO & Prerender** | Custom Node.js Static Generator, React Helmet Async, Sitemap XML Tooling |
| **Backend API** | PHP 8.2 (Modular REST architecture, MySQL PDO with prepared statements) |
| **Database** | MySQL 8.0 with InnoDB relational schema and tenant isolation |
| **Automation** | Node.js 20, `@whiskeysockets/baileys`, Express, QRCode |
| **CI/CD & Hosting** | GitHub Actions Automated FTP Deployment, Apache `.htaccess` routing, Render.com |

---

## 📁 Repository Directory Structure

```text
ghumo-firoo-journeys-site/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Automated GitHub Actions deployment pipeline
├── php-backend/                    # Enterprise PHP REST API
│   ├── api.php                     # Central API gateway & router
│   ├── bootstrap.php               # Database connection & error handling
│   ├── auth_middleware.php         # JWT & Session authentication guards
│   ├── leads_*.php                 # Lead management endpoints
│   ├── hotels*.php                 # Hotel contracting & season rate tables
│   ├── itineraries_*.php           # Itinerary builder backend logic
│   ├── quotes_*.php                # Quote calculation & proposal dispatch
│   └── send_whatsapp.php           # Bridge to Baileys automation service
├── public/                         # Web-optimized assets, logos, and rate cards
│   ├── ghumo-firoo-logo.png        # Official branding
│   ├── Kedarnath.png               # Web-compressed destination visuals
│   ├── Rann-Utsav-Gujarat.png
│   ├── .htaccess                   # Apache URL rewriting & static pre-rendering rules
│   └── sitemap.xml                 # Search engine sitemap
├── scripts/
│   ├── generate-static-pages.mts   # Pre-renders 113+ SEO HTML pages at build time
│   ├── generate-sitemap.mts        # Generates XML sitemaps
│   └── optimize-images.py          # Lossless batch image compression tool
├── src/
│   ├── components/
│   │   ├── common/                 # Navigation, Footer, ThemeToggle, WhatsAppFloat
│   │   ├── crm/                    # Kanban, LeadForm, ItineraryWorkspace, RateMaster
│   │   ├── home/                   # Hero, FeaturedDestinations, Collections, Reviews
│   │   ├── packages/               # ModernPackageHero, DynamicDetails, PricingSidebar
│   │   └── seo/                    # SEO Helmet, Structured JSON-LD Data
│   ├── data/                       # Static fallback package and blog registries
│   ├── pages/                      # Application route views (Index, Packages, CRM, About)
│   ├── utils/                      # Route prefetching and formatting helpers
│   ├── App.tsx                     # Primary client-side router
│   └── main.tsx                    # React DOM entrypoint
├── whatsapp-service/               # Node.js Baileys microservice
│   ├── Dockerfile                  # Container definition
│   ├── server.js                   # Baileys WebSocket socket server & /pair endpoint
│   └── package.json
├── package.json                    # Frontend dependencies & npm scripts
├── vite.config.ts                  # Vite build & chunking configuration
└── README.md                       # Documentation
```

---

## ⚙️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PHP**: 8.1+ with PDO MySQL extension (for local backend testing)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/nmmishra1/ghumo-firoo-journeys-site.git
   cd ghumo-firoo-journeys-site
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start local development server**:
   ```bash
   npm run dev
   ```
   The site will be available at `http://localhost:8080` (or `http://localhost:5173`).

4. **Verify TypeScript type correctness**:
   ```bash
   npx tsc --noEmit
   ```

5. **Build for production with static pre-rendering**:
   ```bash
   npm run build
   ```
   This triggers:
   - Vite production bundle optimization with code splitting.
   - Dynamic `sitemap.xml` creation.
   - Pre-rendering of **113 static SEO routes** into `dist/`.
   - Automatic bundling of `php-backend/` for deployment.

---

## 🚢 Continuous Integration & Deployment (CI/CD)

The project utilizes automated GitHub Actions (`.github/workflows/deploy.yml`):
- Every `git push` to `main` executes validation, builds production assets, pre-renders static HTML routes, and deploys directly to the live cPanel host via encrypted FTP sync.
- The WhatsApp microservice auto-deploys via Render Docker webhooks upon commits to `main`.

---

## 👥 Leadership & Trust Signals

- **Managing Director**: Sangita Kumari (10+ years of travel tech experience across MakeMyTrip, Goibibo, ixigo, and Amadeus).
- **Accreditation**: Ministry of Tourism (MoT) Recognized Partner, NIDHI Registered Entity.
- **Headquarters**: Munirka, South Delhi, India.
- **Official Contact**: [+91 99109 87264](tel:+919910987264) &nbsp;|&nbsp; [info@ghumofiroo.com](mailto:info@ghumofiroo.com)

---

<div align="center">

**© 2026 Ghumo Firoo Journeys. All Rights Reserved.**

*Crafting Bespoke Luxury Memories Across India & Beyond.*

</div>
