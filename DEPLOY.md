# Production Deployment Guide (cPanel Shared Hosting)

This guide outlines the step-by-step procedure to deploy the React frontend, PHP backend, and database schema updates to the live cPanel account for `https://ghumofiroo.com`.

> [!IMPORTANT]
> **Addon Domain Location:** The document root for this domain is the directory `ghumofiroo.com/` under your cPanel account root directory, **NOT** the standard `public_html/` folder. Ensure all paths below target `ghumofiroo.com/`.

---

## PRE-DEPLOYMENT CHECKS
- [ ] Production build compiled successfully (`npm run build`).
- [ ] `.env.production` in the project root verified (ensure `VITE_PHP_BASE_URL` and `VITE_API_BASE_URL` are both configured as `https://ghumofiroo.com/php-backend`).
- [ ] Executed database migration scripts:
  - `database/migrations/20260803_step1_city_id_fk_refactor.sql`
  - `database/migrations/20260803_step2_seed_chardham_kashmir.sql`
- [ ] Cloud AI Microservice verified active at `https://gemini-web2api-sxti.onrender.com/v1`.

---

## DEPLOYMENT PROCESS

### STEP 1 — Database Import
1. Log into your cPanel account.
2. Navigate to **MySQL Databases** and verify your production database (`a17511nd_Ghumofiroo`).
3. Open **phpMyAdmin** in cPanel.
4. Import `database/migrations/20260803_step1_city_id_fk_refactor.sql` and `database/migrations/20260803_step2_seed_chardham_kashmir.sql`.

### STEP 2 — Frontend Build & Upload
1. Build the production bundle locally:
   ```bash
   npx vite build --mode production
   ```
2. Compress the contents of the generated `dist/` directory into a `.zip` archive (e.g., `dist.zip`).
3. Open cPanel **File Manager** and navigate to the `ghumofiroo.com/` directory.
4. Upload `dist.zip` directly to `ghumofiroo.com/` and extract it.
5. Verify that files (including `.htaccess` and `index.html`) are in `ghumofiroo.com/`.

### STEP 3 — Backend Upload & Configuration
1. Compress `php-backend/` into `php-backend.zip`.
2. Upload and extract to `ghumofiroo.com/php-backend/`.
3. Inside `ghumofiroo.com/php-backend/`, set up `.env` (refer to template below).
4. Verify `/home3/a17511nd/ghumofiroo.com/uploads/` exists with permissions `755`.

---

## ENVIRONMENT TEMPLATE (`ghumofiroo.com/php-backend/.env`)

```env
# MySQL Database Connection details
MYSQL_HOST=localhost
MYSQL_DATABASE=a17511nd_Ghumofiroo
MYSQL_USER=a17511nd_Ghumofiroo_live
MYSQL_PASSWORD=[YOUR_DB_PASSWORD_HERE]

# Supabase Configurations
SUPABASE_PUBLIC_KEY=[YOUR_SUPABASE_PUBLIC_KEY_HERE]
LEAD_WEBHOOK_SECRET=[YOUR_LEAD_WEBHOOK_SECRET_HERE]

# Cloud AI Microservice (Render)
GEMINI_WEB2API_URL=https://gemini-web2api-sxti.onrender.com/v1

# Transactional Email SMTP details
SMTP_HOST=mail.ghumofiroo.com
SMTP_PORT=465
SMTP_USER=noreply@ghumofiroo.com
SMTP_PASS=[YOUR_SMTP_PASSWORD_HERE]

# Payment Gateways (Razorpay / PayU)
RAZORPAY_KEY_ID=rzp_live_SlexboFyFLdaX8
RAZORPAY_KEY_SECRET=uyoKOzxi5rnikfuGAB8RoJ1L
PAYU_KEY=uid921
PAYU_SALT=9yq8nzPvIDgzqQBuuWa6udI4aBIS5c8t

# Application general configurations
SITE_URL=https://ghumofiroo.com
```

---

## POST-DEPLOYMENT VERIFICATION CHECKS
- [ ] Visit `https://ghumofiroo.com` — verify the website loads securely.
- [ ] Visit `https://ghumofiroo.com/crm` — verify CRM and Itinerary Builder load Char Dham & Kashmir inventory.
- [ ] Test the backend routing: Visit `https://ghumofiroo.com/php-backend/inventory_by_city.php?city_name=Haridwar`.
- [ ] Test Document Suite: Generate a test Hotel Voucher and GST Tax Invoice PDF.
- [ ] Test AI Assistant: Open LiveChatWidget and send a travel query.
