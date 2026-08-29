# Remaining Roadmap: Express→PHP + Deployment + Phase 4

---

## PROMPT 1 — Express to PHP Conversion (run first)

```
TASK — Convert Express server to PHP: full audit then convert

CONTEXT
The site runs on PHP-only shared hosting (cPanel).
The Express server (razorpay-server.ts) cannot run there.
All Express routes must become PHP files following the
existing php-backend/ patterns already established.

AUDIT FIRST — before writing any PHP:

1. List every route registered in razorpay-server.ts
   with: METHOD, path, and what it does in one line.
   Group them by category:
   - Payment routes (Razorpay, PayU, UPI)
   - Email routes
   - Named database routes (packages, hotels, blogs, etc.)
   - Wildcard CRUD routes (/api/:tableName)
   - File upload routes
   - Any other routes

2. Check what email library/method Express currently uses:
   - Is it nodemailer? If so what SMTP config?
   - Show the env vars it uses for SMTP
   - Show the email template/content for each email type

3. Check what Razorpay credentials are used:
   - RAZORPAY_KEY_ID env var name
   - RAZORPAY_KEY_SECRET env var name
   - Show the create-order logic and verify logic

4. Check PayU credentials:
   - PAYU_MERCHANT_KEY env var name
   - PAYU_MERCHANT_SALT env var name
   - Show the hash generation logic

5. Check the wildcard CRUD handler:
   - What is the full ALLOWED_TABLES list currently?
   - What JSON fields does localJsonFields include?
   - Show the exact GET/POST/PUT/DELETE logic

6. Check file upload:
   - What does /api/upload do?
   - Where does it save files (local path or S3)?
   - What env vars does it use?

Report all findings. Wait for approval before 
writing any PHP. Do not modify any files yet.

---

IMPLEMENTATION (after audit approved):

PART 1 — Razorpay PHP

CREATE php-backend/razorpay_create_order.php
Method: POST, NO auth (public — called during checkout)
Uses cURL to call Razorpay REST API directly 
(no composer/SDK needed — avoids dependency issues):

$keyId = getenv('RAZORPAY_KEY_ID');
$keySecret = getenv('RAZORPAY_KEY_SECRET');

$payload = json_decode(file_get_contents('php://input'), true);
$amount = $payload['amount']; // already in paise
$currency = $payload['currency'] ?? 'INR';
$receipt = $payload['receipt'];
$notes = $payload['notes'] ?? [];

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_POST => true,
  CURLOPT_USERPWD => "$keyId:$keySecret",
  CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
  CURLOPT_POSTFIELDS => json_encode([
    'amount' => $amount,
    'currency' => $currency,
    'receipt' => $receipt,
    'notes' => $notes
  ])
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
  $order = json_decode($response, true);
  echo json_encode([
    'id' => $order['id'],
    'amount' => $order['amount'],
    'currency' => $order['currency'],
    'receipt' => $order['receipt']
  ]);
} else {
  http_response_code(500);
  echo json_encode(['error' => 'Failed to create order']);
}

CREATE php-backend/razorpay_verify.php
Method: POST, NO auth (called after payment success)
1. Read razorpay_order_id, razorpay_payment_id, 
   razorpay_signature, lead_id, amount, email, 
   name, phone, remarks from POST body
2. Verify signature:
   $expectedSig = hash_hmac('sha256',
     $orderId . '|' . $paymentId,
     getenv('RAZORPAY_KEY_SECRET')
   );
   if ($expectedSig !== $signature) return 400 error
3. On verified: INSERT into payments table
4. UPDATE leads SET status='Booking Confirmed' 
   WHERE id = lead_id
5. Send confirmation email (see PART 3 email)
Response: { success: true }

PART 2 — PayU PHP

CREATE php-backend/payu_generate_hash.php
Method: POST, NO auth (called during checkout)
1. Read: amount, productinfo, firstname, email, 
   phone, lead_id, purpose
2. Generate txnid: 'Txn' . time() . rand(1000,9999)
3. Generate hash (SHA512):
   $hashString = implode('|', [
     getenv('PAYU_MERCHANT_KEY'),
     $txnid, $amount, $productinfo,
     $firstname, $email,
     $lead_id, '', '', '', '', '', // udf1-udf8
     getenv('PAYU_MERCHANT_SALT')
   ]);
   $hash = hash('sha512', $hashString);
4. Return: key, txnid, amount, hash, 
   productinfo, firstname, email,
   surl (success URL), furl (failure URL)
   
The success/failure URLs should point to:
surl: https://[yourdomain]/php-backend/payu_success.php
furl: https://[yourdomain]/php-backend/payu_failure.php

CREATE php-backend/payu_success.php
Method: POST, NO auth (PayU calls this as callback)
1. Verify the PayU hash in reverse:
   $reverseHash = hash('sha512', implode('|', [
     getenv('PAYU_MERCHANT_SALT'),
     $status, '', '', '', '', '',
     $email, $firstname, $productinfo,
     $amount, $txnid,
     getenv('PAYU_MERCHANT_KEY')
   ]));
   if ($reverseHash !== $_POST['hash']) redirect to failure
2. INSERT into payments table
3. UPDATE leads SET status='Booking Confirmed'
4. Send confirmation email
5. Redirect to: /thank-you?ref={txnid}&pkg={productinfo}&gateway=payu

CREATE php-backend/payu_failure.php
Method: POST, NO auth
Redirect to: /booking-failed?payment=failure&gateway=payu

PART 3 — Email PHP (PHPMailer)

Check if PHPMailer is available on the host:
  require_once 'PHPMailer/PHPMailerAutoload.php';
  OR via: vendor/autoload.php if composer is available
  OR check if it's in the existing codebase already

If PHPMailer not available, use PHP mail() as fallback.

CREATE php-backend/send_email.php
Method: POST, auth optional (internal use + public checkout)
Accepts: { to, subject, html_body, text_body }

Also create two helper functions used internally:
- sendConfirmationEmail(name, email, ref, packageName)
- sendEnquiryEmail(name, email, phone, packageName, message)

These are called from razorpay_verify.php and 
payu_success.php after payment, and from 
send_travel_enquiry.php for contact form submissions.

Check what email the current Express server sends 
(from audit step 2) and replicate the same content.

PART 4 — Named database routes PHP equivalents

Check which named routes in Express return different
data shapes than what the wildcard would return.
For each one that adds transformation logic:
Create a dedicated PHP file.

Common ones found in Express servers like this:
- GET /api/packages → packages_list.php (may already exist)
- GET /api/activities → activities_list.php
- GET /api/blogs → blogs_list.php (may already exist)
- GET /api/reports → reports.php

Check each one from the audit — if the route just
does SELECT * FROM table with no transformation,
it can be handled by the wildcard CRUD (Part 5).
Only create dedicated PHP if there's custom logic.

PART 5 — Wildcard CRUD PHP equivalent

CREATE php-backend/api.php
This replaces the Express /api/:tableName wildcard.
It handles GET/POST/PUT/DELETE for all 
ALLOWED_TABLES using the URL path as table name:

URL pattern: /php-backend/api.php?table=hotels&id=5
OR: /php-backend/api/hotels.php (using .htaccess rewrite)

The simpler approach (no .htaccess needed):
All calls go to api.php?table=tableName&id=optionalId

ALLOWED_TABLES list from the audit.
For GET: SELECT *, parse JSON fields
For POST: dynamic INSERT from request body
For PUT: dynamic UPDATE WHERE id = ?
For DELETE: DELETE WHERE id = ? (check if soft delete needed)

Include the same JSON field parsing from localJsonFields.

IMPORTANT: After creating this, update the 
frontend calls that currently hit Express wildcard
(/api/tableName) to instead call 
(${VITE_PHP_BASE_URL}/api.php?table=tableName).

Check which frontend files make calls to 
/api/tableName directly (HotelContracting,
CabContracting, SightseeingMaster) and update them.

PART 6 — File upload PHP

If /api/upload currently saves to local filesystem:
CREATE php-backend/upload.php
Use $_FILES superglobal to handle multipart uploads
Save to /uploads/ directory on shared hosting
Return: { url: 'https://domain.com/uploads/filename' }

If it saves to AWS S3: check if AWS SDK for PHP
is available or use pre-signed URL approach.

PART 7 — Update frontend env vars

In .env, add/update:
VITE_PHP_BASE_URL=https://ghumofiroo.com/php-backend
VITE_API_BASE_URL=https://ghumofiroo.com/php-backend

Remove or deprecate:
VITE_EXPRESS_URL (no longer needed)

Update any frontend fetch calls that point to
the old Express server URL (localhost:8081 or similar).
Search codebase for: localhost:8081, :8081, 
VITE_EXPRESS_URL and update to VITE_PHP_BASE_URL.

CONSTRAINTS
- Follow existing php-backend/ patterns throughout
- All PHP files use db.php include pattern
- Public endpoints (payment callbacks, checkout):
  NO auth required
- Admin endpoints: use auth_middleware.php
- Do NOT modify any React component logic —
  only change the URL it calls
- Do NOT change database schema

REPORT BACK (after implementation):
1. Complete list of Express routes from audit
2. PHP files created (with path and what they replaced)
3. Frontend files updated with new base URL
4. Any routes that couldn't be converted and why
5. npm run build:dev result
```

---

## PROMPT 2 — Production Deployment (run after Prompt 1)

```
TASK — Deploy to shared hosting (cPanel, PHP-only)

CONTEXT
Stack: React + Vite frontend, PHP backend, MySQL
Hosting: shared hosting with cPanel
Express server: fully converted to PHP in previous step
Domain: ghumofiroo.com (confirm actual domain)

BEFORE DEPLOYMENT — confirm these:
1. What is the actual domain/subdomain for this site?
2. What is the public_html path on the server?
3. Does the hosting support .htaccess (Apache)?
4. What PHP version is available? 
   (need 7.4+ for named arguments, 8.0+ preferred)
5. Is the MySQL database on the same server?
   If yes: use localhost as DB_HOST
   If no (remote): confirm DB_HOST value

---

STEP 1 — Build the frontend for production

Update .env for production (create .env.production):
VITE_PHP_BASE_URL=https://ghumofiroo.com/php-backend
VITE_API_BASE_URL=https://ghumofiroo.com/php-backend
VITE_SUPABASE_URL=[keep existing value]
VITE_SUPABASE_ANON_KEY=[keep existing value]
VITE_RAZORPAY_KEY_ID=rzp_live_[your live key]

Run: npm run build
(Not build:dev — use the production build)
This creates dist/ folder.

---

STEP 2 — Create .htaccess for SPA routing

CREATE public_html/.htaccess (or verify it exists):

Options -MultiViews
RewriteEngine On
RewriteBase /

# Serve existing files/directories directly
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d

# Don't rewrite php-backend requests
RewriteCond %{REQUEST_URI} !^/php-backend/

# Don't rewrite api requests  
RewriteCond %{REQUEST_URI} !^/api/

# Rewrite everything else to index.html (SPA)
RewriteRule ^(.*)$ /index.html [QSA,L]

# Security headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options nosniff
  Header always set X-Frame-Options SAMEORIGIN
  Header always set X-XSS-Protection "1; mode=block"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access 1 year"
  ExpiresByType image/jpeg "access 1 year"
  ExpiresByType image/png "access 1 year"
  ExpiresByType image/webp "access 1 year"
  ExpiresByType text/css "access 1 month"
  ExpiresByType application/javascript "access 1 month"
</IfModule>

---

STEP 3 — Create deployment checklist

Generate a DEPLOY.md file in the project root with:

PRE-DEPLOYMENT:
[ ] npm run build completed successfully
[ ] .env.production values verified (live Razorpay keys)
[ ] MySQL database backup taken
[ ] Supabase project not paused (ping it first)

FILES TO UPLOAD via FTP/cPanel File Manager:
[ ] Upload dist/* to public_html/
[ ] Upload dist/.htaccess to public_html/
[ ] Upload php-backend/* to public_html/php-backend/
[ ] Create public_html/php-backend/.env with production values
[ ] Create public_html/uploads/ directory (chmod 755)

DATABASE:
[ ] MySQL already on hosting (no action needed for tables)
[ ] Verify DB credentials in php-backend/.env match hosting MySQL
[ ] Run: SELECT COUNT(*) FROM leads; to confirm connection

ENVIRONMENT FILE (public_html/php-backend/.env):
DB_HOST=localhost
DB_NAME=[your_db_name]
DB_USER=[your_db_user]
DB_PASS=[your_db_password]
RAZORPAY_KEY_ID=rzp_live_XXXXX
RAZORPAY_KEY_SECRET=XXXXX
PAYU_MERCHANT_KEY=XXXXX
PAYU_MERCHANT_SALT=XXXXX
META_APP_SECRET=XXXXX (for Phase 4 webhook verification)
META_VERIFY_TOKEN=ghumofiroo_webhook_2026
WHATSAPP_PHONE_NUMBER_ID=XXXXX
META_ACCESS_TOKEN=XXXXX
SMTP_HOST=mail.ghumofiroo.com (or your SMTP host)
SMTP_USER=noreply@ghumofiroo.com
SMTP_PASS=XXXXX
SMTP_PORT=587
SITE_URL=https://ghumofiroo.com

POST-DEPLOYMENT CHECKS:
[ ] https://ghumofiroo.com loads homepage
[ ] https://ghumofiroo.com/packages loads
[ ] https://ghumofiroo.com/packages/char-dham loads
[ ] https://ghumofiroo.com/crm redirects to login
[ ] https://ghumofiroo.com/php-backend/leads_list.php returns JSON
[ ] Test booking form submits (use Razorpay test mode first)
[ ] Switch to Razorpay live mode after first successful test

SECURITY:
[ ] php-backend/.env is NOT accessible from browser
    Test: curl https://ghumofiroo.com/php-backend/.env
    Should return 403 or 404, NOT the file contents

CREATE php-backend/.htaccess to protect .env:
<Files .env>
  Order allow,deny
  Deny from all
</Files>
<Files "*.php">
  Order allow,deny
  Allow from all
</Files>

---

REPORT BACK:
1. DEPLOY.md created and path confirmed
2. .htaccess created for SPA routing
3. php-backend/.htaccess created to protect .env
4. Production build (npm run build) passes
5. List of all env vars needed for .env.production
```

---

## PROMPT 3 — Phase 4B Webhooks (run after deployment is live)

This prompt is in the main roadmap file already.
Run it AFTER:
1. Deployment is live at https://ghumofiroo.com
2. Meta Business account setup is complete (Steps 1-5 from roadmap)
3. All .env values are populated on the server

The webhook URL that Meta will call:
https://ghumofiroo.com/php-backend/leads_webhook.php

This URL must be publicly accessible (HTTPS) before 
Meta can verify it. That's why deployment comes first.
