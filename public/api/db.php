<?php
// Prevent PHP warnings/notices from leaking and breaking HTTP/2 protocols
ini_set('display_errors', '0');
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING & ~E_DEPRECATED);

// db.php
// Helper to read variables from .env file
function getEnvVal($key, $default = '') {
    static $env = null;
    if ($env === null) {
        $env = [];
        $envFile = __DIR__ . '/../../.env';
        if (file_exists($envFile)) {
            $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || strpos($line, '#') === 0) continue;
                $parts = explode('=', $line, 2);
                if (count($parts) === 2) {
                    $env[trim($parts[0])] = trim($parts[1]);
                }
            }
        }
    }
    return isset($env[$key]) ? $env[$key] : $default;
}

$host = getEnvVal('MYSQL_HOST', 'md-92.webhostbox.net');
$user = getEnvVal('MYSQL_USER', 'a17511nd_GFPackage');
$pass = getEnvVal('MYSQL_PASSWORD', 'S@ngeet@143286');
$db   = getEnvVal('MYSQL_DATABASE', 'a17511nd_GFPackage');

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    header('HTTP/1.1 500 Internal Server Error');
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Database connection failed', 'details' => $e->getMessage()]);
    exit;
}

// Find a lead ID by email or phone in Supabase
function findLeadByContact($email, $phone) {
    $supabase_url = getEnvVal('VITE_SUPABASE_URL', 'https://rfdumlnkmfuacsznogzz.supabase.co');
    $supabase_key = getEnvVal('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZHVtbG5rbWZ1YWNzem5vZ3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzYxMDUsImV4cCI6MjA5NjM1MjEwNX0.5VtSJ46jEgI8tlqXMWOXz8jvc68C__Suo1WgGJw_KIM');
    
    if (empty($supabase_url) || empty($supabase_key)) {
        return null;
    }
    
    if (!empty($email) || !empty($phone)) {
        $url = $supabase_url . '/rest/v1/rpc/find_lead_by_contact';
        $postData = json_encode([
            'email_param' => trim($email),
            'phone_param' => trim($phone)
        ]);
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'apikey: ' . $supabase_key,
            'Authorization: Bearer ' . $supabase_key,
            'Content-Type: application/json'
        ]);
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if (!empty($data) && isset($data[0]['id'])) {
                return $data[0]['id'];
            }
        }
    }
    
    return null;
}

// Insert a payment record directly into Supabase
function insertSupabasePayment($lead_id, $amount_received, $payment_mode, $reference_number, $remarks, $gateway_charges) {
    $supabase_url = getEnvVal('VITE_SUPABASE_URL', 'https://rfdumlnkmfuacsznogzz.supabase.co');
    $supabase_key = getEnvVal('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZHVtbG5rbWZ1YWNzem5vZ3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzYxMDUsImV4cCI6MjA5NjM1MjEwNX0.5VtSJ46jEgI8tlqXMWOXz8jvc68C__Suo1WgGJw_KIM');
    
    if (empty($supabase_url) || empty($supabase_key)) {
        return false;
    }
    
    $postData = json_encode([
        'id' => 'pay-' . time() . '-' . rand(1000, 9999),
        'lead_id' => $lead_id,
        'amount_received' => (float)$amount_received,
        'payment_date' => date('Y-m-d'),
        'payment_mode' => $payment_mode,
        'reference_number' => $reference_number,
        'remarks' => $remarks,
        'received_by' => 'Online Payment',
        'gateway_charges' => (float)$gateway_charges
    ]);
    
    $ch = curl_init($supabase_url . '/rest/v1/payments');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $supabase_key,
        'Authorization: Bearer ' . $supabase_key,
        'Content-Type: application/json',
        'Prefer: return=minimal'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 201 || $httpCode === 200;
}

// Send standard HTML email via PHP mail()
function sendPHPEmail($to, $subject, $htmlContent) {
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Ghumo Firoo Travels <noreply@ghumofiroo.com>\r\n";
    $headers .= "Reply-To: info@ghumofiroo.com\r\n";
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    return mail($to, $subject, $htmlContent, $headers);
}

// Send payment receipt to guest
function sendPaymentReceiptEmailPHP($toEmail, $guestName, $amount, $paymentMode, $referenceNumber, $remarks) {
    if (empty($toEmail)) return false;
    
    $dateStr = date('d F Y');
    $subject = "Payment Receipt: ₹" . number_format($amount, 2) . " received successfully";
    
    $emailHtml = '
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Payment Receipt - Ghumo Firoo Travels</title>
      <style>
        body { font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #f59e0b; margin-bottom: 5px; }
        .header-title { font-size: 20px; margin: 0; font-weight: 600; color: #ffffff; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .receipt-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
        .receipt-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 600; text-align: right; }
        .total-amount { font-size: 18px; font-weight: 800; color: #10b981; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .support-info { margin-top: 10px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">GHUMO FIROO TRAVELS</div>
          <h1 class="header-title">Payment Confirmation</h1>
        </div>
        <div class="content">
          <div class="greeting">Dear ' . htmlspecialchars($guestName) . ',</div>
          <p>Thank you for making your payment. We have successfully processed and received your transaction. Below are your payment details for your reference:</p>
          
          <div class="receipt-card">
            <div class="receipt-row">
              <span class="label">Client Name:</span>
              <span class="value">' . htmlspecialchars($guestName) . '</span>
            </div>
            <div class="receipt-row">
              <span class="label">Payment Mode:</span>
              <span class="value">' . htmlspecialchars($paymentMode) . '</span>
            </div>
            <div class="receipt-row">
              <span class="label">Reference ID:</span>
              <span class="value">' . htmlspecialchars($referenceNumber) . '</span>
            </div>
            <div class="receipt-row">
              <span class="label">Purpose:</span>
              <span class="value">' . htmlspecialchars($remarks) . '</span>
            </div>
            <div class="receipt-row">
              <span class="label">Date:</span>
              <span class="value">' . $dateStr . '</span>
            </div>
            <div class="receipt-row">
              <span class="label">Amount Paid:</span>
              <span class="value total-amount">₹' . number_format($amount, 2) . '</span>
            </div>
          </div>
          
          <p>Your booking ledger has been automatically updated in our CRM system. Our travel planner will contact you shortly with the next steps.</p>
          <p>If you have any questions or require immediate assistance, please do not hesitate to contact us.</p>
        </div>
        <div class="footer">
          <div>This is an automated payment receipt. Please do not reply directly to this email.</div>
          <div class="support-info">
            Contact Support: info@ghumofiroo.com | +91-9910987264
          </div>
        </div>
      </div>
    </body>
    </html>';
    
    return sendPHPEmail($toEmail, $subject, $emailHtml);
}

// Send admin transaction alert
function sendAdminNotificationEmailPHP($guestName, $amount, $paymentMode, $referenceNumber, $remarks) {
    $adminEmail = 'info@ghumofiroo.com';
    $subject = "[Payment Notification] ₹" . number_format($amount) . " from " . $guestName;
    
    $emailHtml = '
    <h3>New Online Payment Received</h3>
    <p>A new payment has been completed via the Quick Payment Link portal.</p>
    <table border="1" cellpadding="6" style="border-collapse: collapse;">
      <tr><td><b>Guest Name</b></td><td>' . htmlspecialchars($guestName) . '</td></tr>
      <tr><td><b>Amount</b></td><td>₹' . number_format($amount, 2) . '</td></tr>
      <tr><td><b>Payment Mode</b></td><td>' . htmlspecialchars($paymentMode) . '</td></tr>
      <tr><td><b>Reference ID</b></td><td>' . htmlspecialchars($referenceNumber) . '</td></tr>
      <tr><td><b>Purpose</b></td><td>' . htmlspecialchars($remarks) . '</td></tr>
      <tr><td><b>Date</b></td><td>' . date('Y-m-d H:i:s') . '</td></tr>
    </table>
    <p>Check the CRM Payments Ledger at <a href="https://ghumofiroo.com/crm/payments">https://ghumofiroo.com/crm/payments</a>.</p>';
    
    return sendPHPEmail($adminEmail, $subject, $emailHtml);
}
