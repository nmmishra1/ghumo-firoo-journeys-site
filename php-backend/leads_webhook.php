<?php
// leads_webhook.php — receives leads pushed by Make.com scenarios
// (Facebook/Instagram Lead Ads, or a Google Sheet row from a Google Ads
// lead form export). This is machine-to-machine, NOT a logged-in user,
// so it is protected by a shared secret instead of a Supabase JWT.
//
// Setup:
//   1. Set LEAD_WEBHOOK_SECRET as an environment variable on your hosting.
//   2. In Make.com, add an HTTP header X-Webhook-Secret with that same
//      value on the final "Make an HTTP request" module.
//   3. Point the module at: https://yourdomain.com/api/leads_webhook.php
//   4. Map whatever fields your Make scenario has into the JSON body
//      shown below (adjust field names to match your actual FB Lead Ads
//      / Google Sheet columns — they rarely match out of the box).
//
// Expected JSON body example:
// {
//   "full_name": "Anvesh Rao",
//   "phone": "9876543210",
//   "email": "anvesh@example.com",
//   "source": "facebook_ad",           // or instagram_ad / google_ad
//   "source_detail": "Chardham_June_Campaign",
//   "destination_city_id": null        // usually unknown at this stage
// }

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

$expectedSecret = getenv('LEAD_WEBHOOK_SECRET');
$providedSecret = $_SERVER['HTTP_X_WEBHOOK_SECRET'] ?? '';

if (!$expectedSecret || !hash_equals($expectedSecret, $providedSecret)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON body']);
    exit;
}

$fullName = trim($data['full_name'] ?? $data['name'] ?? '');
$phone    = trim($data['phone'] ?? $data['phone_number'] ?? '');
$email    = trim($data['email'] ?? '');

if ($fullName === '' && $phone === '' && $email === '') {
    http_response_code(400);
    echo json_encode(['error' => 'At least a name, phone, or email is required']);
    exit;
}

$allowedSources = ['whatsapp_ad', 'instagram_ad', 'facebook_ad', 'google_ad'];
$source = in_array($data['source'] ?? '', $allowedSources, true) ? $data['source'] : 'other';

$pdo = getDb();
$stmt = $pdo->prepare(
    'INSERT INTO leads (full_name, phone, email, source, source_detail, status)
     VALUES (?, ?, ?, ?, ?, "new")'
);
$stmt->execute([
    $fullName ?: 'Unknown',
    $phone ?: null,
    $email ?: null,
    $source,
    $data['source_detail'] ?? null,
]);

echo json_encode(['success' => true, 'lead_id' => (int)$pdo->lastInsertId()]);
