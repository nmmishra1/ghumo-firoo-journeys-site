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
$targetEmail = trim($input['email'] ?? 'agent@ghumofiroo.com');

$resendKey = getenv('RESEND_API_KEY') ?: '';

$startDate = date('Y-m-01');
$endDate = date('Y-m-t');

$htmlReport = '
<div style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
    <div style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
      <h1 style="color: #f59e0b; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 1px;">✦ GHUMO FIROO TRAVELS ✦</h1>
      <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0; font-weight: 600;">Executive Performance & Operational Analytics Summary</p>
    </div>

    <div style="padding: 28px;">
      <p style="font-size: 13px; color: #64748b; margin: 0 0 20px 0;">
        Reporting Period: <strong>' . date('d M Y', strtotime($startDate)) . ' to ' . date('d M Y', strtotime($endDate)) . '</strong>
      </p>

      <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;">
          <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Pipeline Health</span>
          <h3 style="font-size: 22px; font-weight: 900; color: #0f172a; margin: 4px 0 0 0;">Active Enquiries</h3>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;">
          <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase;">Revenue Status</span>
          <h3 style="font-size: 22px; font-weight: 900; color: #10b981; margin: 4px 0 0 0;">Confirmed Bookings</h3>
        </div>
      </div>

      <div style="background-color: #fff7ed; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
        <h4 style="margin: 0 0 4px 0; color: #b45309; font-size: 14px;">🏆 Top Destination Performers</h4>
        <p style="margin: 0; color: #78350f; font-size: 12.5px; line-height: 1.6;">
          <strong>Rann Utsav Kutch</strong> and <strong>Char Dham Yatra</strong> continue to generate the highest conversion yields and average ticket sizes this month.
        </p>
      </div>
    </div>

    <div style="background-color: #f8fafc; padding: 16px 28px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
      © ' . date('Y') . ' GHUMO FIROO TRAVELS • EXECUTIVE REPORTING SYSTEM
    </div>
</div>';

$resendPayload = json_encode([
    'from' => 'Ghumo Firoo Travels <noreply@ghumofiroo.com>',
    'to' => [$targetEmail],
    'subject' => 'Executive Performance & Operational Analytics Report - Ghumo Firoo Travels',
    'html' => $htmlReport
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
    echo json_encode(['success' => true, 'mail_sent' => true, 'id' => $resData['id'] ?? null]);
    exit;
}

http_response_code(500);
echo json_encode(['error' => 'Failed to send weekly report email', 'resend_response' => $resendResponse]);
