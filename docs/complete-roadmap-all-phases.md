# GhumoFiroo — Complete Remaining Roadmap
## Phase 1: Itinerary Builder | Phase 2: Checkout | Phase 3: Quotes | Phase 4: Lead Capture

---

# PHASE 1 — ITINERARY BUILDER ENHANCEMENT
## Run in 2 steps: Audit first, then implement

### PHASE 1 — STEP 1: Audit Prompt

```
TASK — Itinerary Builder: full audit before enhancement

This is a discovery task only. Do not write any code.

CONTEXT
The ItineraryBuilder is used daily by the sales team to build
custom itineraries for leads. It needs to become destination-driven:
when a lead selects Kashmir, the builder should ONLY show Kashmir
hotels, Kashmir cabs, Kashmir sightseeing. No Goa hotel should
ever appear in a Kashmir itinerary.

AUDIT THESE ITEMS AND REPORT:

1. ItineraryBuilder.tsx — current state:
   a. How does it currently open? (route, props passed in)
   b. Does it currently receive a leadId or lead object?
   c. What destination/city data (if any) does it receive?
   d. How does it currently fetch hotels — which endpoint,
      what query params, does it filter by city/destination?
   e. How does it currently fetch cabs/routes?
   f. How does it currently fetch sightseeing/activities?
   g. How does it currently calculate pricing — manual input
      or from contracted rates?
   h. Where does it save the final itinerary — which endpoint,
      which MySQL tables (itineraries, itinerary_days,
      itinerary_line_items)?

2. MySQL schema — check these tables and show their columns:
   a. itineraries
   b. itinerary_days
   c. itinerary_line_items
   d. hotels (confirm city_id FK exists)
   e. hotel_rates (confirm it joins to hotels via hotel_id)
   f. cab_routes (what columns? from_city, to_city, distance?)
   g. sightseeings (what columns? destination/city field?)
   h. activities and activity_rates (destination filtering?)

3. Express server (razorpay-server.ts) — check if any
   dedicated itinerary endpoints exist beyond the wildcards:
   GET /api/itineraries — does this exist as a named route?
   POST /api/itineraries — does this exist?
   What does the existing itinerary save flow look like?

4. How does the QuoteWorkspace.tsx connect to the itinerary?
   Does it receive itinerary data from ItineraryBuilder,
   or do they operate independently?

5. The leads table has a destinations field (TEXT).
   Show what format destination data is currently stored in
   for the 7 existing leads in MySQL.
   Is it a single city name, a comma-separated list, JSON?

Report all findings. Do not implement anything.
Wait for my approval before Phase 1 Step 2.
```

---

### PHASE 1 — STEP 2: Implementation Prompt
*(Run after Step 1 audit is reviewed and approved)*

```
TASK — Itinerary Builder: destination-driven enhancement

CONTEXT (from Phase 1 Step 1 audit — paste findings here)
[PASTE STEP 1 AUDIT RESULTS HERE BEFORE RUNNING]

HARD CONSTRAINTS
- Do NOT change the visual design of ItineraryBuilder.tsx
  — the layout, drag-and-drop, and UI stay exactly as-is
- Do NOT modify schema.sql tables
- Do NOT break the existing save flow
- All changes are additive — enhance, not replace
- Pass npm run build:dev with zero errors

---

IMPLEMENT THESE ENHANCEMENTS:

ENHANCEMENT 1 — Destination context injection
When ItineraryBuilder opens from a lead:
- If it receives a leadId prop, fetch that lead's 
  destinations field from the existing leads_list.php 
  or a new leads_get.php?id= endpoint
- Parse the destination into an array of city names
- Store as selectedDestinations state inside the builder
- Show a small destination badge strip at the top of 
  the builder: "Building for: Kashmir | Gulmarg | Srinagar"
  using Badge variant="luxuryNavy" from the design system

ENHANCEMENT 2 — Destination-filtered hotel search
In the hotel search/picker section of ItineraryBuilder:
- Currently fetches all hotels via /api/hotels
- Change to: GET /api/hotels?city_ids=1,2,3 OR
  GET /api/hotels?destination=Kashmir
- Check which filter param the hotel endpoint supports.
  If neither exists, add ?destination= filter to the 
  Express /api/hotels route:
    WHERE c.name LIKE '%destination%' OR 
          c.state LIKE '%destination%'
  (joining hotels to cities table via city_id)
- If no destination is set for the lead, show all hotels
  (graceful fallback — never break the UI)

ENHANCEMENT 3 — Auto-populate pricing from hotel_rates
When a hotel is selected for a day:
- Fetch hotel_rates for that hotel:
  GET /api/hotel-rates?hotel_id=X 
  (check if this endpoint exists — if not, add it as
  a named Express route:
  SELECT * FROM hotel_rates WHERE hotel_id = ? 
  AND is_active = 1)
- Show a rate picker dropdown: room type + meal plan + rate
- Auto-fill the cost field with the selected rate × nights × rooms
- If no contracted rate exists, allow manual entry (as before)

ENHANCEMENT 4 — Destination-filtered cab routes
In the cab/transport section:
- Currently fetches all cab_routes via /api/cab-routes
- Change to filter by destination:
  GET /api/cab-routes?destination=Kashmir
  Check what columns cab_routes has (from audit) and 
  filter by the relevant from_city or destination column
- Auto-populate distance and rate from the contracted rate

ENHANCEMENT 5 — Destination-filtered sightseeing
In the sightseeing/activities section:
- Currently fetches all sightseeings via /api/sightseeings
- Add destination filter:
  GET /api/sightseeings?destination=Kashmir
  Filter by destination/location column (from audit findings)
- Show only relevant sightseeing options

ENHANCEMENT 6 — Auto-calculate total quote price
After the day-wise itinerary is built:
- Calculate: sum of all line item costs
- Divide by pax count (adults + children) from the lead
- Show a pricing summary panel at the bottom:
  "Hotels: ₹XX,XXX | Transport: ₹XX,XXX | 
   Sightseeing: ₹XX,XXX | Total: ₹XX,XXX
   Per Person (X pax): ₹XX,XXX"
- This becomes the suggested quote price
- Allow manual override before saving

ENHANCEMENT 7 — Create PHP endpoint: leads_get.php
GET with ?id=leadId
Returns single lead with destinations field
Follow existing PHP patterns (auth, db.php, JSON response)
Used by the builder to load lead context on open.

REPORT BACK:
1. Audit findings summary (what existed vs what was missing)
2. Each enhancement — confirm implemented or explain why skipped
3. New endpoints created (file names)
4. npm run build:dev result
```

---

# PHASE 2 — CHECKOUT INTEGRATION
## Run AFTER Phase 1 is complete and verified

```
TASK — Checkout: Connect BookingForm to Razorpay + PayU

AUDIT FIRST (report before implementing):
1. Show the current BookingForm.tsx — what fields does it
   collect? (name, email, phone, package, amount, dates, pax?)
2. Show the existing Razorpay endpoints in razorpay-server.ts:
   - /api/razorpay/create-order (what params does it need?)
   - /api/razorpay/verify (what does it validate?)
3. Show the existing PayU endpoints:
   - /api/payu/generate-hash (what params?)
   - /api/payu/success and /api/payu/failure
4. Check BookingFormWrapper.tsx — what is the current
   onSubmit handler doing? (has a TODO comment)
5. Check the payments table in MySQL — confirm columns:
   id, lead_id, amount_received, payment_date, payment_mode,
   reference_number, status, received_by, gateway_charges

Report findings. Wait for approval before implementing.

---

IMPLEMENTATION (after audit approved):

FLOW:
User fills BookingForm → clicks "Proceed to Pay" →
Choose gateway (Razorpay default, PayU if Razorpay fails) →
Payment modal opens → User pays →
On success: record payment + update lead + send email →
Redirect to /thank-you with booking reference

IMPLEMENT:

STEP 1 — BookingFormWrapper.tsx enhancement
Replace the TODO comment with actual payment flow:

function BookingFormWrapper({ leadId, packageName, amount, pax }) {
  
  const handleBookingSubmit = async (formData) => {
    try {
      // Step 1: Try Razorpay first
      const order = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay uses paise
          currency: 'INR',
          receipt: `GF-${Date.now()}`,
          notes: { leadId, packageName, pax }
        })
      }).then(r => r.json());
      
      // Step 2: Open Razorpay modal
      openRazorpayModal(order, formData, leadId);
      
    } catch (err) {
      // Step 3: Fallback to PayU if Razorpay fails
      initiatePayUPayment(formData, amount, leadId);
    }
  };
}

STEP 2 — Razorpay modal integration
The Razorpay JS SDK should be loaded in index.html if not already.
Check if <script src="https://checkout.razorpay.com/v1/checkout.js">
exists in index.html. If not, add it.

Open Razorpay modal with:
- key: from VITE_RAZORPAY_KEY_ID env variable
- amount, currency, order_id from create-order response
- name: "GhumoFiroo Travels"
- description: packageName
- prefill: { name, email, contact } from form data
- handler: on success → call handlePaymentSuccess()
- modal.ondismiss: show "Payment cancelled" toast

STEP 3 — handlePaymentSuccess()
After Razorpay payment:
1. Verify payment via /api/razorpay/verify
2. On verified: call recordPayment() 
3. recordPayment(): POST to ${API_BASE}/leads_update.php
   with payment record + status change to 'Booking Confirmed'
4. Send confirmation email via /api/send-confirmation
   (check if this exists in razorpay-server.ts — it does,
   use it with booking details)
5. Navigate to /thank-you?ref=GF-[orderId]&pkg=[packageName]

STEP 4 — PayU fallback
When Razorpay fails or user chooses PayU:
1. POST to /api/payu/generate-hash with:
   txnid, amount, productinfo, firstname, email
2. Submit a hidden form to PayU payment URL
   (PayU requires form POST, not fetch)
3. PayU success → /api/payu/success handler already exists
   Enhance it to also call recordPayment() and update lead

STEP 5 — Create ThankYou page enhancement
The ThankYou.tsx page likely exists — check it.
Add booking reference display:
- Read ref= and pkg= from URL params
- Show: "Booking Confirmed! Reference: GF-XXXXX"
- Show package name
- Show "Our team will contact you within 2 hours"
- WhatsApp CTA button: link to wa.me/[your_number]
  with pre-filled message "Hi, my booking ref is GF-XXXXX"

STEP 6 — Create php-backend/payments_create.php
POST: Insert payment record into MySQL payments table
Fields: lead_id, amount_received, payment_date, payment_mode,
reference_number, remarks, status, received_by, gateway_charges
Response: { success: true, payment_id: id }
This replaces the Supabase payment write that was migrated earlier.

GATEWAY ROUTING RULES:
- Razorpay: primary for all card/UPI/netbanking payments
- PayU: shown as alternative option in payment UI
- Both write to the same payments table in MySQL
- payment_mode field: 'Razorpay' or 'PayU'

CONSTRAINTS
- Do NOT modify BookingForm.tsx internal fields
- Do NOT change existing Razorpay/PayU server endpoints
- Use VITE_RAZORPAY_KEY_ID from env (not hardcoded)
- All payment amounts in paise for Razorpay (multiply × 100)
- All amounts in rupees for PayU

REPORT BACK:
1. Audit findings
2. Whether Razorpay SDK script tag was already in index.html
3. Whether ThankYou.tsx existed and what was changed
4. Whether /api/send-confirmation existed and if reused
5. npm run build:dev result
```

---

# PHASE 3 — QUOTE VERSIONING
## Run AFTER Phase 2 is complete

```
TASK — Quote Versioning: wire QuoteWorkspace to lead pipeline

AUDIT FIRST:
1. Show QuoteWorkspace.tsx current state:
   - What props does it receive?
   - How does it currently save a quote?
   - What endpoint/table does it write to?
2. Show the quotes table in MySQL — all columns
3. Does the quotes table have: version_number, 
   parent_quote_id, status, shared_at, viewed_at?
   If not, these need to be added via ALTER TABLE.
4. How is QuoteWorkspace opened from CRM.tsx?
   What data does it receive (lead, itinerary)?

Report. Wait for approval before implementing.

---

IMPLEMENTATION (after audit approved):

SCHEMA ADDITIONS (ALTER TABLE — not schema.sql CREATE):
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  version_number INT NOT NULL DEFAULT 1;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  parent_quote_id VARCHAR(36) NULL REFERENCES quotes(id);
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  status ENUM(
    'Draft','Shared','Viewed','Discussion',
    'Revised','Accepted','Rejected','Expired','Confirmed'
  ) NOT NULL DEFAULT 'Draft';
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  shared_at TIMESTAMP NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  viewed_at TIMESTAMP NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  expires_at TIMESTAMP NULL;
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS 
  share_token VARCHAR(64) NULL UNIQUE;

Show the ALTER TABLE statements BEFORE running them.
Wait for approval to execute.

QUOTE VERSIONING LOGIC:
- When a quote is edited and re-saved, do NOT overwrite.
  Instead: INSERT new quote with version_number +1,
  parent_quote_id = original quote id
- Original quote status changes to 'Revised'
- New quote status = 'Draft'
- This means one lead can have unlimited quote versions

SHARE QUOTE FLOW:
- "Share Quote" button → generate a unique share_token
  (use bin2hex(random_bytes(32)) in PHP)
- Update quote: status = 'Shared', shared_at = NOW(),
  share_token = generated token
- Generate shareable link: 
  https://ghumofiroo.com/quote/[share_token]
- This link should open a public quote view page
  (customer-facing, no login required)
- Create src/pages/QuoteView.tsx:
  GET /api/quote-view/[token] → returns quote details
  Customer sees: package name, itinerary summary, 
  price, validity date, "Book Now" CTA
  
VIEWED TRACKING:
- When customer opens the quote link, update:
  status = 'Viewed', viewed_at = NOW()
  (via the public quote-view PHP endpoint)
- Sales team sees "Viewed X minutes ago" badge on lead

ACCEPT/REJECT:
- Customer can click "Accept Quote" or "Request Changes"
  on the public QuoteView page
- Accept → status = 'Accepted', trigger notification to CRM
- Request Changes → status = 'Discussion', add note
- Both → create a lead_communication log entry

CREATE ENDPOINTS:
php-backend/quotes_save.php — POST: save/version quote
php-backend/quotes_list.php?lead_id= — GET: all versions
php-backend/quote_share.php — POST: generate share token
php-backend/quote_view.php?token= — GET: public, no auth
php-backend/quote_action.php — POST: accept/reject (no auth)

LEAD PIPELINE CONNECTION:
- When quote status = 'Shared' → update lead status 
  to 'Quote Sent' automatically
- When quote status = 'Accepted' → prompt agent to 
  move lead to 'Booking Confirmed'
- When quote status = 'Rejected' → prompt agent to 
  move lead to 'Closed Lost' or create new version

REPORT BACK:
1. Audit findings
2. ALTER TABLE statements (show before running)
3. All endpoints created
4. npm run build:dev result
5. Test the share link flow manually and report
```

---

# PHASE 4 — LEAD CAPTURE AUTOMATION
## Meta Business API Setup Guide (you do this manually) + Webhook Implementation

### PART A — Meta Business API Setup Guide
*(Complete these steps yourself before running the webhook prompt)*

**Step 1 — Create Meta Business Account (10 minutes)**
1. Go to business.facebook.com
2. Click "Create Account"
3. Enter business name: "GhumoFiroo Travels"
4. Enter your name and business email
5. Complete verification

**Step 2 — Create a Facebook App (15 minutes)**
1. Go to developers.facebook.com
2. Click "My Apps" → "Create App"
3. Select "Business" as app type
4. App name: "GhumoFiroo Lead Capture"
5. Enter your business email
6. Click "Create App"
7. Note down your **App ID** and **App Secret**
   (Settings → Basic)

**Step 3 — Add Lead Ads Product (10 minutes)**
1. In your app dashboard, click "Add Product"
2. Find "Facebook Lead Ads" → click "Set Up"
3. This enables the Lead Ads Webhooks API

**Step 4 — Add WhatsApp Product (10 minutes)**
1. In your app dashboard, click "Add Product"  
2. Find "WhatsApp" → click "Set Up"
3. Add your phone number (+91 XXXXXXXXXX)
4. You'll get a **WhatsApp Business Account ID**
   and a **Phone Number ID**
5. Note these down — needed for the webhook

**Step 5 — Generate a Permanent Access Token (5 minutes)**
1. Go to business.facebook.com → Settings → 
   Business Assets → System Users
2. Create a System User (Admin level)
3. Generate a token with these permissions:
   - leads_retrieval
   - whatsapp_business_messaging
   - pages_read_engagement
4. Note down the **System User Access Token**
   (this never expires unlike page tokens)

**Step 6 — Get your Facebook Page ID (2 minutes)**
1. Go to your Facebook Business Page
2. About → Page Info → scroll to bottom
3. Note down the **Page ID** (long number)

**Step 7 — Environment variables to add to your .env file**
```
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_ACCESS_TOKEN=your_system_user_token
META_VERIFY_TOKEN=ghumofiroo_webhook_2026  # choose any string
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
FACEBOOK_PAGE_ID=your_page_id
```

Once you have all these values, come back and run Part B below.

---

### PART B — Webhook Implementation Prompt
*(Run AFTER completing Part A and adding env variables)*

```
TASK — Lead capture webhooks: Meta Lead Ads + WhatsApp

CONTEXT
Environment variables have been added to .env:
META_APP_ID, META_APP_SECRET, META_ACCESS_TOKEN,
META_VERIFY_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
WHATSAPP_BUSINESS_ACCOUNT_ID, FACEBOOK_PAGE_ID

AUDIT FIRST:
1. Check php-backend/leads_webhook.php — this file 
   already exists. Show its current content.
   Is it handling anything already?
2. Check if UTM tracking columns exist in leads table:
   utm_source, utm_medium, utm_campaign, utm_content,
   utm_term, ad_set_name, ad_name, keyword, device, location
   If not, list what would need to be added.
3. Check razorpay-server.ts for any existing webhook routes.

Report. Wait for approval before implementing.

---

IMPLEMENTATION:

STEP 1 — Add UTM/campaign columns to leads table
ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS utm_term VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS ad_set_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS ad_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS keyword VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS device VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS location_targeting VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS meta_lead_id VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS whatsapp_contact_id VARCHAR(255) NULL;
Show ALTER TABLE before running. Wait for approval.

STEP 2 — Update php-backend/leads_webhook.php
This file already exists. Enhance it to handle:

a) Meta Lead Ads webhook (GET for verification, POST for leads):

GET /leads_webhook.php:
  Verify: check hub.verify_token === META_VERIFY_TOKEN
  If match: echo hub.challenge and exit
  If no match: return 403

POST /leads_webhook.php:
  Parse JSON body
  If object === 'page' and entry[*].changes[*].field === 'leadgen':
    For each leadgen change:
      1. Extract lead_id from changes.value.leadgen_id
      2. Fetch lead data from Meta API:
         GET https://graph.facebook.com/v18.0/{lead_id}
            ?fields=field_data,created_time,ad_id,ad_name,
                    adset_id,adset_name,campaign_id,campaign_name
            &access_token={META_ACCESS_TOKEN}
      3. Parse field_data array into name/email/phone/destination
         (field_data is [{name:'full_name',values:['John']}, ...])
         Common field names in Lead Ads:
         'full_name', 'email', 'phone_number', 
         'what_destination_are_you_interested_in',
         'travel_month', 'budget', 'number_of_travelers'
      4. Insert into leads table via leads_create.php logic:
         source = 'Meta Ads'
         utm_campaign = campaign_name
         utm_medium = 'paid_social'
         utm_source = 'facebook' or 'instagram'
         ad_set_name = adset_name
         ad_name = ad_name
         meta_lead_id = lead_id
      5. Return 200 OK (Meta requires 200 within 20 seconds)

b) WhatsApp message webhook:
  If object === 'whatsapp_business_account':
    For each entry.changes where field === 'messages':
      Extract: from (phone), message text, timestamp
      Check if a lead with customer_phone = from exists:
        If YES: log to lead_communications (channel='whatsapp',
                direction='inbound', summary=message_text)
        If NO: create new lead (source='WhatsApp',
               customer_phone=from, notes=first message)
      Auto-reply via WhatsApp API:
        POST https://graph.facebook.com/v18.0/
             {PHONE_NUMBER_ID}/messages
        Body: {
          messaging_product: 'whatsapp',
          to: from,
          type: 'text',
          text: { body: 'Hi! Thanks for contacting GhumoFiroo 
                  Travels. Our team will reach you shortly. 
                  For urgent queries call: [your number]' }
        }
        Authorization: Bearer {META_ACCESS_TOKEN}

STEP 3 — Register the webhook in Meta
After deploying leads_webhook.php to your hosting:
The webhook URL will be:
https://yourdomain.com/php-backend/leads_webhook.php

In the Meta Developer Console:
1. Go to your app → Add Product → Webhooks
2. For Lead Ads: Subscribe to 'leadgen' field
   Callback URL: [your webhook URL]
   Verify Token: [value of META_VERIFY_TOKEN in .env]
3. For WhatsApp: Go to WhatsApp → Configuration
   Webhook URL: [same URL]
   Verify Token: [same verify token]
   Subscribe to: messages, message_status

STEP 4 — UTM capture from website forms
In EnquireNow.tsx and all lead-creating forms:
Add hidden fields that capture UTM params from URL:
  const urlParams = new URLSearchParams(window.location.search);
  const utmData = {
    utm_source: urlParams.get('utm_source') || 'organic',
    utm_medium: urlParams.get('utm_medium') || 'website',
    utm_campaign: urlParams.get('utm_campaign') || null,
    utm_content: urlParams.get('utm_content') || null,
    utm_term: urlParams.get('utm_term') || null,
  };
Pass utmData to the lead creation payload so website
leads capture UTM data when visitors come from ads.

STEP 5 — CRM display of lead source analytics
In CRM.tsx DashboardStats section, add:
- Source breakdown chart (already exists per audit — 
  enhance to include Meta Ads, WhatsApp as sources)
- Campaign performance: GROUP BY utm_campaign with 
  COUNT(*) leads and COUNT(*) WHERE status='Booking Confirmed'
  (this gives campaign ROI)
This data comes from MySQL via a new PHP endpoint:
php-backend/reports_sources.php
  GET: Returns leads grouped by source + utm_campaign
       with counts and conversion rates

CONSTRAINTS
- Do NOT modify BookingForm.tsx or EnquireNow.tsx internals
  (only add UTM hidden field passing, not form field changes)
- Do NOT change existing leads table columns
- The webhook must respond with 200 OK within 20 seconds
  (run any DB inserts, then return — don't wait for emails)
- Follow existing PHP auth pattern for internal endpoints
  but leads_webhook.php is PUBLIC (no auth) since Meta 
  calls it without a session token

REPORT BACK:
1. What leads_webhook.php already contained
2. ALTER TABLE statements (before running)
3. All new/modified files
4. WhatsApp auto-reply test result
5. npm run build:dev result
```

---

# COMPLETE ROADMAP SUMMARY

| Phase | What | Priority | Estimated sessions |
|-------|------|----------|--------------------|
| 1 | Itinerary Builder (destination-driven + pricing) | FIRST | 2 (audit + implement) |
| 2 | Checkout (Razorpay primary + PayU fallback) | SECOND | 2 (audit + implement) |
| 3 | Quote Versioning + Share Link + Customer View | THIRD | 2 (audit + implement) |
| 4A | Meta Business API setup (manual, you do this) | BEFORE 4B | ~1 hour of setup |
| 4B | WhatsApp + Meta Lead Ads webhooks + UTM | FOURTH | 2 (audit + implement) |

Run each phase's audit prompt first, wait for the report,
then run the implementation prompt.
Never skip the audit step — every phase has found 
something unexpected that changed the implementation.
