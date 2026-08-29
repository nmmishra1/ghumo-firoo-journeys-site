<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/payment_mail_helper.php';

function callSupabaseRpc($functionName, $bodyParams = [])
{
    $supabaseUrl = getenv('VITE_SUPABASE_URL');
    $supabaseKey = getenv('VITE_SUPABASE_ANON_KEY');

    $ch = curl_init("{$supabaseUrl}/rest/v1/rpc/{$functionName}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => [
            "apikey: {$supabaseKey}",
            "Authorization: Bearer {$supabaseKey}",
            "Content-Type: application/json"
        ],
        CURLOPT_POSTFIELDS => json_encode($bodyParams)
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'data' => json_decode($response, true),
        'raw' => $response
    ];
}

function getBrochureBanner($destination) {
    $d = strtolower($destination ?: "");
    if (strpos($d, "char dham") !== false || strpos($d, "chardham") !== false || strpos($d, "kedarnath") !== false || strpos($d, "badrinath") !== false || strpos($d, "yamunotri") !== false || strpos($d, "gangotri") !== false) {
        return "https://ghumofiroo.com/chardham-by-helicopter.jpg";
    } elseif (strpos($d, "rann") !== false || strpos($d, "utsav") !== false || strpos($d, "kutch") !== false) {
        return "https://ghumofiroo.com/Rann-Utsav-Gujarat.png";
    } else {
        return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    }
}

try {
    $res = callSupabaseRpc('send_pending_review_emails_fetch');
    if ($res['code'] !== 200) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to fetch pending reviews', 'details' => $res['raw']]);
        exit;
    }

    $data = $res['data'] ?? [];
    if (empty($data)) {
        echo json_encode(['success' => true, 'count' => 0, 'message' => 'No pending review requests']);
        exit;
    }

    $successfulIds = [];
    $currentYear = date('Y');

    foreach ($data as $itin) {
        try {
            $destName = (!empty($itin['destinations']) && is_array($itin['destinations'])) ? $itin['destinations'][0] : 'your recent trip';
            $reviewLink = "https://ghumofiroo.com/review/{$itin['itinerary_code']}";
            $banner = getBrochureBanner($destName);

            $emailHtml = "
            <div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);\">
                <!-- LOGO -->
                <div style=\"background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;\">
                  <img src=\"https://ghumofiroo.com/ghumo-firoo-logo.png\" alt=\"Ghumo Firoo Travels\" style=\"max-height: 64px; width: auto; display: inline-block;\" />
                </div>

                <!-- HERO BANNER -->
                <img src=\"{$banner}\" alt=\"{$destName} Banner\" style=\"width: 100%; height: 220px; object-fit: cover; display: block;\" />

                <!-- BODY CONTENT -->
                <div style=\"padding: 28px 24px;\">
                  <h2 style=\"color: #ea580c; margin: 0 0 14px 0; font-size: 20px; font-weight: 700; text-align: center;\">How was your trip with Ghumo Firoo Travels?</h2>
                  
                  <p style=\"font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;\">
                    Hello <strong>{$itin['customer_name']}</strong>,
                  </p>
                  <p style=\"font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;\">
                    Welcome back! We hope you had a fantastic and memorable time exploring <strong>{$destName}</strong>. 
                    Our team at Ghumo Firoo Travels strives to deliver the best travel experiences, and we would love to hear your feedback.
                  </p>
                  <p style=\"font-size: 15px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;\">
                    Could you take 2 minutes to rate your overall experience, hotels, transport, sightseeing, and planning? Your feedback helps us maintain high quality standards and assists other travelers in planning their dream holidays.
                  </p>

                  <!-- CTA BUTTON -->
                  <div style=\"text-align: center; padding: 20px 0 10px 0;\">
                    <a href=\"{$reviewLink}\" style=\"display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);\" target=\"_blank\">⭐ Write A Review</a>
                  </div>

                  <p style=\"font-size: 14px; color: #94a3b8; text-align: center; margin-top: 15px;\">
                    If the button doesn't work, copy and paste this link in your browser:<br/>
                    <a href=\"{$reviewLink}\" style=\"color: #ea580c; text-decoration: underline;\">{$reviewLink}</a>
                  </p>

                  <p style=\"font-size: 14px; color: #475569; margin: 20px 0 0 0;\">Warm regards,</p>
                  <p style=\"font-size: 15px; font-weight: 800; color: #ea580c; margin: 6px 0 0 0;\">Ghumo Firoo Travels Team</p>
                </div>

                <!-- FOOTER -->
                <div style=\"background-color: #0f172a; padding: 32px 24px; text-align: center;\">
                  <p style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;\">✦ Ghumo Firoo Travels ✦</p>
                  <p style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0;\">Where Dreams Become Itineraries</p>
                  <div style=\"height: 1px; background-color: #1e293b; margin: 16px 0;\"></div>
                  <p style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8;\">
                    📞 <a href=\"tel:+919910987264\" style=\"color: #f97316 !important; text-decoration: none; font-weight: 600;\">+91 99109 87264</a>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    📧 <a href=\"mailto:info@ghumofiroo.com\" style=\"color: #f97316 !important; text-decoration: none; font-weight: 600;\">info@ghumofiroo.com</a>
                  </p>
                  <p style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;\">
                    🌐 <a href=\"https://ghumofiroo.com\" style=\"color: #f97316 !important; text-decoration: none; font-weight: 600;\" target=\"_blank\">www.ghumofiroo.com</a>
                  </p>
                  <div style=\"height: 1px; background-color: #1e293b; margin: 16px 0;\"></div>
                  <div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;\">
                    © {$currentYear} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
                  </div>
                </div>
              </div>
            ";

            sendEmailPHPMailer($itin['customer_email'], 'How was your trip with Ghumo Firoo Travels?', $emailHtml);
            $successfulIds[] = $itin['id'];

        } catch (Exception $sendErr) {
            error_log("Failed sending review invite to {$itin['customer_email']}: " . $sendErr->getMessage());
        }
    }

    if (!empty($successfulIds)) {
        callSupabaseRpc('mark_review_request_sent', ['itin_ids' => $successfulIds]);
    }

    echo json_encode(['success' => true, 'count' => count($successfulIds), 'total' => count($data)]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Review requests run failed: ' . $e->getMessage()]);
}
