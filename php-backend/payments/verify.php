<?php
// verify.php — handles Razorpay signature verification, payment logging, and emails
// POST /php-backend/payments/verify.php

header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

// Helper: resolve lead id by email/phone contact matching
function findLeadByContact($pdo, $email, $phone) {
    if (empty($email) && empty($phone)) {
        return null;
    }
    if (!empty($email)) {
        $stmt = $pdo->prepare('SELECT id FROM leads WHERE TRIM(customer_email) = ? LIMIT 1');
        $stmt->execute([trim($email)]);
        $row = $stmt->fetch();
        if ($row) {
            return $row['id'];
        }
    }
    if (!empty($phone)) {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (strlen($cleanPhone) >= 10) {
            $last10 = substr($cleanPhone, -10);
            $stmt = $pdo->prepare('SELECT id FROM leads WHERE customer_phone LIKE ? LIMIT 1');
            $stmt->execute(['%' . $last10]);
            $row = $stmt->fetch();
            if ($row) {
                return $row['id'];
            }
        }
    }
    return null;
}

// Helper: check if a port is open to avoid blocking timeouts
function isPortOpen($host, $port, $timeout = 1) {
    // If running in local development environment, fail fast for production SMTP to avoid blocking timeouts
    $httpHost = $_SERVER['HTTP_HOST'] ?? '';
    $isLocal = (strpos($httpHost, 'localhost') !== false) || 
               (strpos($httpHost, '127.0.0.1') !== false) || 
               (php_sapi_name() === 'cli') || 
               (php_sapi_name() === 'cli-server');
               
    if ($host === 'mail.ghumofiroo.com' && $isLocal) {
        return false;
    }
    $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
    if ($fp) {
        fclose($fp);
        return true;
    }
    return false;
}

$pdo = getDb();

// 2. Load Secret Keys
$keyId = getenv('RAZORPAY_KEY_ID') ?: '';
$keySecret = getenv('RAZORPAY_KEY_SECRET') ?: '';
if (empty($keyId) || empty($keySecret)) {
    http_response_code(500);
    echo json_encode(['error' => 'Razorpay keys are not configured on the server']);
    exit;
}

// 3. Parse input parameters
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$razorpayOrderId = $input['razorpay_order_id'] ?? '';
$razorpayPaymentId = $input['razorpay_payment_id'] ?? '';
$razorpaySignature = $input['razorpay_signature'] ?? '';
$leadId = $input['lead_id'] ?? '';
$amount = isset($input['amount']) ? (float)$input['amount'] : 0.0;
$remarks = $input['remarks'] ?? '';
$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';
$name = $input['name'] ?? '';

if (empty($razorpayOrderId) || empty($razorpayPaymentId) || empty($razorpaySignature)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required verification parameters']);
    exit;
}

// 4. Constant-time Signature Verification
$payload = $razorpayOrderId . '|' . $razorpayPaymentId;
$expectedSignature = hash_hmac('sha256', $payload, $keySecret);

if (!hash_equals($expectedSignature, $razorpaySignature)) {
    http_response_code(400);
    echo json_encode(['verified' => false, 'error' => 'Signature mismatch']);
    exit;
}

// 4a. Prevent Replay Attack / Duplicate Processing
$stmt = $pdo->prepare('SELECT COUNT(*) FROM payments WHERE reference_number = ?');
$stmt->execute([$razorpayPaymentId]);
if ((int)$stmt->fetchColumn() > 0) {
    http_response_code(400);
    echo json_encode(['verified' => false, 'error' => 'Payment has already been processed and logged']);
    exit;
}

// 4b. Cross-check Payment Amount against Razorpay API (Prevents client-side amount tampering)
// Redundant Guard: Never bypass crosscheck in production if a live key (rzp_live_) is configured.
$isLiveKey = (strpos($keyId, 'rzp_live_') === 0);
$bypassCrosscheck = (getenv('BYPASS_PAYMENT_CROSSCHECK') === 'true') && !$isLiveKey;

if (!$bypassCrosscheck) {
    $ch = curl_init('https://api.razorpay.com/v1/payments/' . urlencode($razorpayPaymentId));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, "$keyId:$keySecret");
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($response === false || $httpCode !== 200) {
        http_response_code(400);
        echo json_encode([
            'verified' => false, 
            'error' => 'Failed to retrieve payment details from Razorpay gateway', 
            'details' => $response ? json_decode($response, true) : $curlErr
        ]);
        exit;
    }

    $paymentData = json_decode($response, true);
    $gatewayAmount = isset($paymentData['amount']) ? ((float)$paymentData['amount'] / 100.0) : 0.0;
    
    if (abs($gatewayAmount - $amount) > 0.01) {
        http_response_code(400);
        echo json_encode(['verified' => false, 'error' => 'Payment amount mismatch between gateway and request']);
        exit;
    }
}

// 5. Signature valid -> Record payment
try {
    $finalLeadId = $leadId;
    if (empty($finalLeadId)) {
        $finalLeadId = findLeadByContact($pdo, $email, $phone);
    }
    if (!empty($finalLeadId)) {
        $finalLeadId = (int)$finalLeadId;
    } else {
        $finalLeadId = null;
    }

    $gatewayCharges = $amount * 0.0236;
    $paymentRowId = 'pay-' . round(microtime(true) * 1000) . '-' . rand(1000, 9999);
    $paymentDate = date('Y-m-d');
    
    $stmt = $pdo->prepare(
        'INSERT INTO payments (id, lead_id, amount_received, payment_date, payment_mode, reference_number, remarks, status, received_by, gateway_charges)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $paymentRowId,
        $finalLeadId,
        $amount,
        $paymentDate,
        'Razorpay',
        $razorpayPaymentId,
        !empty($remarks) ? $remarks : 'Quick Payment Link',
        'Success',
        'Online Payment',
        $gatewayCharges
    ]);

    // 6. Setup SMTP Mail Transporter
    $mail = new PHPMailer(true);
    $mail->Timeout = 3; // Set connection timeout to 3 seconds
    $mail->isSMTP();
    $mail->Host = getenv('SMTP_HOST') ?: 'smtp.ghumofiroo.com';
    $mail->Port = (int)(getenv('SMTP_PORT') ?: 465);
    $mail->SMTPAuth = true;
    $mail->Username = getenv('SMTP_USER') ?: 'noreply@ghumofiroo.com';
    $mail->Password = getenv('SMTP_PASS') ?: '';
    
    if ($mail->Port === 587) {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    } else {
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    }
    
    $mail->setFrom($mail->Username, 'Ghumo Firoo Travels');
    
    // Check if the SMTP server is reachable before attempting mail transmission
    $smtpHost = getenv('SMTP_HOST') ?: 'smtp.ghumofiroo.com';
    $smtpPort = (int)(getenv('SMTP_PORT') ?: 465);
    $smtpAvailable = isPortOpen($smtpHost, $smtpPort, 1);

    // 7. Send Receipt Email to Guest
    if ($smtpAvailable && !empty($email)) {
        try {
            $mail->addAddress(trim($email));
            $mail->isHTML(true);
            $mail->Subject = 'Payment Receipt: INR ' . number_format($amount) . ' received successfully';
            
            $dateStr = date('d F Y');
            $mail->Body = '
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
                  <div class="greeting">Dear ' . htmlspecialchars($name ?: 'Guest') . ',</div>
                  <p>Thank you for making your payment. We have successfully processed and received your transaction. Below are your payment details for your reference:</p>
                  
                  <div class="receipt-card">
                    <div class="receipt-row">
                      <span class="label">Client Name:</span>
                      <span class="value">' . htmlspecialchars($name ?: 'Guest') . '</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">Payment Mode:</span>
                      <span class="value">Razorpay</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">Reference ID:</span>
                      <span class="value">' . htmlspecialchars($razorpayPaymentId) . '</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">Purpose:</span>
                      <span class="value">' . htmlspecialchars(!empty($remarks) ? $remarks : 'Quick Payment Link') . '</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">Date:</span>
                      <span class="value">' . htmlspecialchars($dateStr) . '</span>
                    </div>
                    <div class="receipt-row">
                      <span class="label">Amount Paid:</span>
                      <span class="value total-amount">INR ' . number_format($amount) . '</span>
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
            
            $mail->send();
        } catch (Exception $e) {
            error_log('Error sending receipt email: ' . $mail->ErrorInfo);
        }
    }

    // 8. Send Notification Email to Admin
    if ($smtpAvailable) {
        try {
            $mail->clearAddresses();
            $mail->addAddress('info@ghumofiroo.com');
            $mail->isHTML(true);
            $mail->Subject = '[Payment Notification] INR ' . number_format($amount) . ' from ' . ($name ?: 'Guest');
            
            $mail->Body = '
            <h3>New Online Payment Received</h3>
            <p>A new payment has been completed via the Quick Payment Link portal.</p>
            <table border="1" cellpadding="6" style="border-collapse: collapse;">
              <tr><td><b>Guest Name</b></td><td>' . htmlspecialchars($name ?: 'Guest') . '</td></tr>
              <tr><td><b>Amount</b></td><td>INR ' . number_format($amount) . '</td></tr>
              <tr><td><b>Payment Mode</b></td><td>Razorpay</td></tr>
              <tr><td><b>Reference ID</b></td><td>' . htmlspecialchars($razorpayPaymentId) . '</td></tr>
              <tr><td><b>Purpose</b></td><td>' . htmlspecialchars(!empty($remarks) ? $remarks : 'Quick Payment Link') . '</td></tr>
              <tr><td><b>Date</b></td><td>' . date('Y-m-d H:i:s') . '</td></tr>
            </table>
            <p>Check the CRM Payments Ledger at <a href="https://ghumofiroo.com/crm/payments">https://ghumofiroo.com/crm/payments</a>.</p>';
            
            $mail->send();
        } catch (Exception $e) {
            error_log('Error sending admin notification email: ' . $mail->ErrorInfo);
        }
    } else {
        error_log("SMTP server unreachable; skipped payment emails.");
    }

    echo json_encode(['verified' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database operation failed', 'details' => $e->getMessage()]);
}
