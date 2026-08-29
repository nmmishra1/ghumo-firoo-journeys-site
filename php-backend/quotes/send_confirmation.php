<?php
// send_confirmation.php — sends enquiry or booking confirmation emails to clients
// POST /php-backend/quotes/send_confirmation.php

header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';

$pdo = getDb();

// Helper: check if a port is open to avoid blocking timeouts
function isPortOpen($host, $port, $timeout = 2) {
    $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
    if ($fp) {
        fclose($fp);
        return true;
    }
    return false;
}

// 2. Parse inputs
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$email = $input['email'] ?? '';
$name = $input['name'] ?? '';
$packageTitle = $input['packageTitle'] ?? '';
$type = $input['type'] ?? '';
$bookingId = $input['bookingId'] ?? '';

if (empty($email) || empty($packageTitle)) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email and packageTitle are required']);
    exit;
}

$inputUrl = $input['packageUrl'] ?? $input['package_url'] ?? '';

$isBooking = ($type === 'booking');
$subject = $isBooking 
    ? 'Booking Request Received: ' . $packageTitle
    : 'Enquiry Received: ' . $packageTitle;

// Banner helper matching Node logic
function getBrochureBanner($title) {
    $t = strtolower($title);
    if (strpos($t, 'rann') !== false || strpos($t, 'utsav') !== false || strpos($t, 'evoke') !== false || strpos($t, 'tent city') !== false || strpos($t, 'kutch') !== false) {
        return "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"; // White Desert Salt Landscape
    } elseif (strpos($t, 'kashmir') !== false) {
        return "https://images.unsplash.com/photo-1566837430548-c89b4f9c5d00?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'kerala') !== false) {
        return "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'himachal') !== false || strpos($t, 'manali') !== false || strpos($t, 'shimla') !== false) {
        return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'chardham') !== false || strpos($t, 'kedarnath') !== false || strpos($t, 'badrinath') !== false) {
        return "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'ladakh') !== false || strpos($t, 'leh') !== false) {
        return "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'bali') !== false) {
        return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'dubai') !== false) {
        return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'europe') !== false || strpos($t, 'switzerland') !== false || strpos($t, 'paris') !== false) {
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($t, 'rajasthan') !== false || strpos($t, 'jaipur') !== false || strpos($t, 'jaisalmer') !== false) {
        return "https://images.unsplash.com/photo-1477587458883-471a5ed94245?auto=format&fit=crop&w=1200&q=80";
    } else {
        return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    }
}

function getPackageUrl($title, $customUrl = '') {
    if (!empty($customUrl) && strpos($customUrl, 'http') === 0) {
        return $customUrl;
    }
    $t = strtolower($title);
    if (strpos($t, 'rann') !== false || strpos($t, 'utsav') !== false || strpos($t, 'evoke') !== false || strpos($t, 'tent city') !== false || strpos($t, 'kutch') !== false) {
        return "https://ghumofiroo.com/packages/rann-utsav-tent";
    } elseif (strpos($t, 'kashmir') !== false) {
        return "https://ghumofiroo.com/packages/kashmir";
    } elseif (strpos($t, 'himachal') !== false || strpos($t, 'manali') !== false) {
        return "https://ghumofiroo.com/packages/himachal";
    } elseif (strpos($t, 'kerala') !== false) {
        return "https://ghumofiroo.com/packages/kerala";
    } elseif (strpos($t, 'bali') !== false) {
        return "https://ghumofiroo.com/packages/bali";
    } elseif (strpos($t, 'chardham') !== false) {
        return "https://ghumofiroo.com/packages/chardham";
    } else {
        return "https://ghumofiroo.com/packages";
    }
}

$banner = getBrochureBanner($packageTitle);
$packageUrl = getPackageUrl($packageTitle, $inputUrl);
$referenceId = !empty($bookingId) ? $bookingId : 'GF-' . time();
$statusText = $isBooking ? 'Payment Pending' : 'Processing';
$messageBody = $isBooking
    ? "Thank you for submitting your booking details. To finalize your reservation, please ensure you complete the payment using the options provided on our website. Once payment is verified, we will issue your travel vouchers."
    : "Thank you for your enquiry. Our travel experts are reviewing your request and will contact you within 24 hours with a customized itinerary.";

$year = date('Y');

$inputHighlights = is_array($input['highlights'] ?? null) ? $input['highlights'] : [];

function getDynamicHighlights($title, $providedHighlights = []) {
    if (!empty($providedHighlights) && count($providedHighlights) > 0) {
        $html = '';
        foreach ($providedHighlights as $h) {
            $html .= '✦ <strong>' . htmlspecialchars($h) . '</strong><br/>';
        }
        return $html;
    }
    
    $t = strtolower($title);
    if (strpos($t, 'rann') !== false || strpos($t, 'utsav') !== false || strpos($t, 'evoke') !== false || strpos($t, 'tent city') !== false || strpos($t, 'kutch') !== false) {
        return '🍽️ <strong>All Gourmet Meals Included</strong> (Breakfast, Lunch, High Tea & Dinner)<br/>' .
               '🚌 <strong>Fixed AC Shared Coach Transfer</strong> (Bhuj Station & Airport Pickup/Drop)<br/>' .
               '🏜️ <strong>Great White Rann Desert Walk</strong> (Sunset & Sunrise Excursions)<br/>' .
               '🎭 <strong>Live Kutchi Cultural Folk Show & Handicraft Village Excursion</strong>';
    } elseif (strpos($t, 'kashmir') !== false) {
        return '🏔️ <strong>Shikara Ride on Dal Lake & Houseboat Stay</strong><br/>' .
               '❄️ <strong>Gulmarg Gondola Cable Car Ride & Snow Experience</strong><br/>' .
               '🌸 <strong>Pahalgam Valley & Betaab Valley Sightseeing</strong><br/>' .
               '🚗 <strong>Private AC Vehicle Transfers & Daily Breakfast</strong>';
    } elseif (strpos($t, 'himachal') !== false || strpos($t, 'manali') !== false) {
        return '🏔️ <strong>Solang Valley Adventure Sports & Snow Point Excursion</strong><br/>' .
               '🌲 <strong>Hadimba Temple, Vashisht Hot Springs & Mall Road Walk</strong><br/>' .
               '🚗 <strong>Private AC Vehicle Transfers & Daily Breakfast</strong>';
    } elseif (strpos($t, 'kerala') !== false) {
        return '🛶 <strong>Luxury Houseboat Cruise & Backwater Stay in Alleppey</strong><br/>' .
               '🌿 <strong>Munnar Tea Gardens & Spice Plantation Tour</strong><br/>' .
               '🌊 <strong>Kovalam Beach & Athirappilly Waterfalls Excursion</strong>';
    } elseif (strpos($t, 'chardham') !== false || strpos($t, 'kedarnath') !== false || strpos($t, 'badrinath') !== false) {
        return '🚁 <strong>Helicopter / VIP Darshan Assistance for Kedarnath & Badrinath</strong><br/>' .
               '⛩️ <strong>Holy Temple Darshan & Dedicated Priest Assistance</strong><br/>' .
               '🏨 <strong>Premium Hotel Accommodation with Pure Veg Meals</strong>';
    } else {
        return '🏨 <strong>Handpicked Luxury Accommodations & Daily Breakfast</strong><br/>' .
               '🚗 <strong>Sightseeing & Airport / Station Transfers Included</strong><br/>' .
               '🗺️ <strong>Dedicated 24/7 Travel Concierge & Expert Support</strong>';
    }
}

$highlightsHtml = getDynamicHighlights($packageTitle, $inputHighlights);

$htmlBody = '
<div style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);">
    <!-- LOGO -->
    <div style="background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;">
      <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" style="max-height: 64px; width: auto; display: inline-block;" />
    </div>

    <!-- HERO BANNER -->
    <img src="' . htmlspecialchars($banner) . '" alt="' . htmlspecialchars($packageTitle) . ' Banner" style="width: 100%; height: 250px; object-fit: cover; display: block;" />

    <!-- BODY CONTENT -->
    <div style="padding: 28px 24px;">
      <h2 style="color: #ea580c; margin: 0 0 14px 0; font-size: 18px; font-weight: 700;">Hello ' . htmlspecialchars($name) . ',</h2>
      
      <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
        Thank you for choosing <strong style="color:#ea580c;">Ghumo Firoo Travels</strong>!
        We are thrilled to assist you in planning your next escape. We are dedicated to crafting an exceptional travel experience customized just for you.
      </p>

      <!-- INQUIRY CARD -->
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 10px; padding: 20px; margin: 20px 0;">
        <p style="font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;">📋 Reservation Details</p>

        <div style="padding: 10px 0; border-bottom: 1px solid #fde8d0;">
          <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Reference ID</span>
          <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">' . htmlspecialchars($referenceId) . '</span>
        </div>
        <div style="padding: 10px 0; border-bottom: 1px solid #fde8d0;">
          <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Package Reserved</span>
          <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">' . htmlspecialchars($packageTitle) . '</span>
        </div>
        <div style="padding: 10px 0; border-bottom: none; padding-bottom: 0;">
          <span style="font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">Status</span>
          <span style="font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;">' . htmlspecialchars($statusText) . '</span>
        </div>
      </div>

      <!-- DYNAMIC INCLUSIONS BREAKDOWN -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
        <p style="font-size: 13px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0;">✨ Package Highlights & Included Experience:</p>
        <p style="font-size: 12.5px; color: #334155; line-height: 1.8; margin: 0;">
          ' . $highlightsHtml . '
        </p>
      </div>

      <p style="font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;">
        ' . htmlspecialchars($messageBody) . '
      </p>

      <!-- CTA BUTTON WITH VALID REDIRECT LINK -->
      <div style="text-align: center; padding: 20px 0 10px 0;">
        <a href="' . htmlspecialchars($packageUrl) . '" style="display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);" target="_blank">✈️ View Package Details</a>
      </div>

      <p style="font-size: 14px; color: #475569; margin: 20px 0 0 0;">Warm regards,</p>
      <p style="font-size: 15px; font-weight: 800; color: #ea580c; margin: 6px 0 0 0;">Ghumo Firoo Travels Team</p>
    </div>

    <!-- FOOTER -->
    <div style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
      <p style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px;">✦ Ghumo Firoo Travels ✦</p>
      <p style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0;">Where Dreams Become Itineraries</p>
      <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
      <p style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8;">
        📞 <a href="tel:+919910987264" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">+91 99109 87264</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        📧 <a href="mailto:info@ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;">info@ghumofiroo.com</a>
      </p>
      <p style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
        🌐 <a href="https://ghumofiroo.com" style="color: #f97316 !important; text-decoration: none; font-weight: 600;" target="_blank">www.ghumofiroo.com</a>
      </p>
      <div style="height: 1px; background-color: #1e293b; margin: 16px 0;"></div>
      
      <!-- Social Media Section -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; margin-bottom: 15px;">
        <tr>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://www.facebook.com/ghumofirootravels" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">facebook.com</span>
            </a>
          </td>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/instagram-new.png" width="24" height="24" alt="Instagram" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">instagram.com</span>
            </a>
          </td>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://x.com/GhumoFiroo" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/twitterx.png" width="24" height="24" alt="Twitter/X" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">x.com</span>
            </a>
          </td>
        </tr>
      </table>

      <div style="font-family: \'Helvetica Neue\', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
        © ' . $year . ' GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
      </div>
    </div>
</div>';

// 1. Primary Email Provider: Resend REST API
$resendKey = getenv('RESEND_API_KEY');
if ($resendKey && strlen($resendKey) > 10) {
    $resendPayload = json_encode([
        'from' => 'Ghumo Firoo Travels <noreply@ghumofiroo.com>',
        'to' => [trim($email)],
        'subject' => $subject,
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
        echo json_encode(['success' => true, 'mail_sent' => true, 'provider' => 'resend', 'resend_id' => $resData['id'] ?? null]);
        exit;
    }
}

try {
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
    
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ];
    
    $mail->setFrom($mail->Username, 'Ghumo Firoo Travels');
    $mail->addAddress(trim($email));
    $mail->isHTML(true);
    $mail->Subject = $subject;
    $mail->Body = $htmlBody;

    $mail->send();
    echo json_encode(['success' => true, 'mail_sent' => true]);
} catch (Exception $e) {
    // Fallback to PHP native mail()
    $fromEmail = getenv('SMTP_USER') ?: 'noreply@ghumofiroo.com';
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=utf-8\r\n";
    $headers .= "From: Ghumo Firoo Travels <{$fromEmail}>\r\n";
    $sent = @mail(trim($email), $subject, $htmlBody, $headers);

    echo json_encode(['success' => true, 'mail_sent' => $sent, 'fallback' => 'php_mail']);
}
