# Ghumofiroo Travel CRM Premium Email Notification System Setup Guide

This document outlines the database schema, edge function setup, Resend integration, and deployment instructions for the Premium Email Notification System.

---

## 🔑 Environment Variables Required

### 1. Supabase Edge Functions Secrets
You must configure the following environment secrets in your Supabase project:

*   **`RESEND_API_KEY`**: Your API key from [Resend](https://resend.com) used to authenticate email dispatches.
*   **`SUPABASE_URL`**: Automatically provided by Supabase in production, but needed locally if testing.
*   **`SUPABASE_SERVICE_ROLE_KEY`**: Automatically provided by Supabase in production, but needed locally. Used to bypass Row-Level Security (RLS) to read/write log records and join related data tables.

To set the secrets in production, run:
```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

### 2. Frontend React Environment Variables
If not already configured, ensure the following are present in your `.env` or `.env.local` files:

```env
VITE_SUPABASE_URL=https://rfdumlnkmfuacsznogzz.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

---

## 🛠️ Components of the Notification System

### 1. Database Schema (`supabase/migrations`)
The migration file [20260625232100-crm-email-notifications.sql](file:///c:/Users/admin/Downloads/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/supabase/migrations/20260625232100-crm-email-notifications.sql) creates:
*   `public.email_logs`: Transmission audit log with automatic retries counter.
*   `public.payments`: Payment transaction table.
*   `public.documents`: Document metadata table (vouchers/tickets/itinerary PDFs).
*   RLS Policies to allow secure, authenticated access.
*   Triggers and PL/pgSQL function (`public.trigger_crm_notification()`) to call the Edge Function on:
    *   Leads creation (`INSERT`).
    *   Leads status changes to `Quote Sent` or `Converted`/`Confirmed` (`UPDATE`).
    *   Payments received (`INSERT`).
    *   Vouchers uploaded (`INSERT`).

### 2. Supabase Edge Functions
*   **`travel-crm-notifications`**: Processes incoming database triggers, queries detail tables, renders premium responsive React templates, and handles email dispatch via Resend with a 3-attempt retry loop.
    *   Located at: [travel-crm-notifications/index.ts](file:///c:/Users/admin/Downloads/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/supabase/functions/travel-crm-notifications/index.ts)
*   **`resend-webhook`**: Processes real-time delivery webhooks sent from Resend (e.g. `delivered`, `opened`, `bounced`) and updates the state of rows in the `email_logs` table.
    *   Located at: [resend-webhook/index.ts](file:///c:/Users/admin/Downloads/ghumo-firoo-journeys-site/ghumo-firoo-journeys-site/supabase/functions/resend-webhook/index.ts)

---

## 🚀 Deployment Instructions

### Step 1: Run Database Migrations
Deploy the database changes using Supabase CLI or by running the SQL inside the Supabase SQL Editor:
```bash
supabase db push
```

### Step 2: Set Deno Secrets
Set your Resend API Key in Supabase:
```bash
supabase secrets set RESEND_API_KEY=re_abc123...
```

### Step 3: Deploy the Edge Functions
Deploy both functions to your live project:
```bash
supabase functions deploy travel-crm-notifications
supabase functions deploy resend-webhook
```

### Step 4: Register Webhook in Resend Dashboard
As shown in your Resend Dashboard (`resend.com/webhooks`):
1.  Click **Add webhook**.
2.  Set the **Endpoint URL** to:
    ```
    https://rfdumlnkmfuacsznogzz.supabase.co/functions/v1/resend-webhook
    ```
3.  Select the **Events** you want to track:
    *   `email.delivered` (Updates status to `delivered`)
    *   `email.bounced` (Updates status to `failed`)
    *   `email.opened` (Updates status to `opened`)
    *   `email.clicked` (Updates status to `clicked`)
4.  Click **Add webhook** to save. Now, status changes will sync instantly to your Supabase `email_logs` table.

---

## 🧪 Testing and Verification

### 1. Lead Acknowledgement
Submit a lead through the frontend form, or insert a row manually in the `leads` table. This fires the `lead_created` trigger and sends the acknowledgement email.

### 2. Quotation Email
In the CRM, select a Lead and click **Send Proposal** or edit their itinerary and save it. Once status updates to `Quote Sent`, the `quote_created` event renders and sends the custom quote template.

### 3. Booking Confirmation
Change a Lead's status to `Converted` (Won Booking) or `Confirmed`. The `booking_confirmed` event dispatches the voucher download and emergency support contact details.

### 4. Payment Receipt
Under a Lead's profile, click **Record Payment** and submit the amount. This inserts a row in the `payments` table and triggers the payment receipt email showing the remaining balance.

### 5. Travel Documents
Upload a file (e.g., "Flight Voucher.pdf") in the Lead profile documents pane. A trigger checks if the file name contains "voucher", "ticket", or "itinerary" and emails the documents bundle to the customer.
