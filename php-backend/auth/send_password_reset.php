<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../db.php';
loadEnvFile();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = trim($input['email'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email address is required']);
    exit;
}

// Generate secure token
$token = bin2hex(random_bytes(24));
$expiresAt = time() + 3600; // Token valid for 1 hour

// Ensure storage directory exists
$resetDir = __DIR__ . '/../data/resets';
if (!is_dir($resetDir)) {
    @mkdir($resetDir, 0777, true);
}

// Store reset token
$resetData = [
    'email' => $email,
    'token' => $token,
    'expires_at' => $expiresAt,
    'created_at' => date('Y-m-d H:i:s')
];
@file_put_contents($resetDir . '/' . md5($email) . '.json', json_encode($resetData));

// Build reset URL
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost:8080';
$resetUrl = "http://localhost:8080/reset-password?email=" . urlencode($email) . "&token=" . $token;

// HTML Email Body
$htmlBody = '
<div style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
    <div style="background-color: #0f172a; text-align: center; padding: 28px 24px 20px 24px;">
      <h1 style="color: #f97316; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 1px;">✦ GHUMO FIROO TRAVELS ✦</h1>
      <p style="color: #94a3b8; font-size: 11px; font-style: italic; margin: 4px 0 0 0;">Where Dreams Become Itineraries</p>
    </div>

    <div style="padding: 32px 28px;">
      <h2 style="color: #0f172a; margin: 0 0 16px 0; font-size: 20px; font-weight: 800;">Password Reset Request</h2>
      
      <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
        Hello, We received a request to reset your password for your <strong>Ghumo Firoo Travels CRM Account</strong> (<span style="color:#ea580c;">' . htmlspecialchars($email) . '</span>).
      </p>

      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 10px; padding: 18px; margin: 24px 0;">
        <p style="font-size: 13px; color: #9a3412; font-weight: 700; margin: 0 0 6px 0;">🔒 Security Notice:</p>
        <p style="font-size: 12.5px; color: #475569; margin: 0; line-height: 1.6;">
          This link will expire in <strong>60 minutes</strong>. If you did not request a password reset, please ignore this email.
        </p>
      </div>

      <div style="text-align: center; padding: 24px 0;">
        <a href="' . htmlspecialchars($resetUrl) . '" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);" target="_blank">🔑 Reset My Password</a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; word-break: break-all; margin: 20px 0 0 0;">
        Or copy and paste this link into your browser:<br/>
        <a href="' . htmlspecialchars($resetUrl) . '" style="color: #ea580c;">' . htmlspecialchars($resetUrl) . '</a>
      </p>
    </div>

    <div style="background-color: #f8fafc; padding: 20px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
      © ' . date('Y') . ' GHUMO FIROO TRAVELS • CRM SECURITY SYSTEM
    </div>
</div>';

// Primary Email Provider: Resend REST API
$resendKey = getenv('RESEND_API_KEY') ?: 're_V2udxcv8_G7Y7DLDj4yaUcVQMhn1AKMsE';

$resendPayload = json_encode([
    'from' => 'Ghumo Firoo Travels <noreply@ghumofiroo.com>',
    'to' => [$email],
    'subject' => 'Password Reset Request - Ghumo Firoo Travels',
    'html' => $htmlBody
]);

$ch = curl_init('https://api.resend.com/emails');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $resendKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $resendPayload);
$resendResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    $resData = json_decode($resendResponse, true);
    echo json_encode(['success' => true, 'mail_sent' => true, 'provider' => 'resend', 'id' => $resData['id'] ?? null]);
    exit;
}

// Fallback response if cURL failed
http_response_code(500);
echo json_encode(['error' => 'Failed to send reset email', 'resend_response' => $resendResponse]);
