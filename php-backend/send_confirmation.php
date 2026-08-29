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

function getBrochureBanner($destination) {
    $d = strtolower($destination ?: "");
    if (strpos($d, "char dham") !== false || strpos($d, "chardham") !== false || strpos($d, "kedarnath") !== false || strpos($d, "badrinath") !== false || strpos($d, "yamunotri") !== false || strpos($d, "gangotri") !== false) {
        return "https://ghumofiroo.com/chardham-by-helicopter.jpg";
    } elseif (strpos($d, "rann") !== false || strpos($d, "utsav") !== false || strpos($d, "kutch") !== false) {
        return "https://ghumofiroo.com/Rann-Utsav-Gujarat.png";
    } elseif (strpos($d, "bali") !== false) {
        return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "dubai") !== false) {
        return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "europe") !== false) {
        return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "kashmir") !== false) {
        return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "ladakh") !== false || strpos($d, "leh") !== false) {
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "goa") !== false) {
        return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "georgia") !== false) {
        return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "kerala") !== false) {
        return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "singapore") !== false) {
        return "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "thailand") !== false) {
        return "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "japan") !== false) {
        return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "rajasthan") !== false || strpos($d, "jaisalmer") !== false || strpos($d, "jaipur") !== false || strpos($d, "udaipur") !== false) {
        return "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "turkey") !== false) {
        return "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "himachal") !== false || strpos($d, "manali") !== false || strpos($d, "shimla") !== false) {
        return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "mauritius") !== false) {
        return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "seychelles") !== false) {
        return "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80";
    } elseif (strpos($d, "golden") !== false || strpos($d, "triangle") !== false) {
        return "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80";
    } else {
        return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
    }
}

$payload = json_decode(file_get_contents('php://input'), true);
if (empty($payload)) {
    http_response_code(400);
    echo json_encode(['error' => 'Empty request body']);
    exit;
}

$email = $payload['email'] ?? '';
$name = $payload['name'] ?? '';
$packageTitle = $payload['packageTitle'] ?? '';
$type = $payload['type'] ?? 'enquiry';
$bookingId = $payload['bookingId'] ?? '';

if (empty($email) || empty($name) || empty($packageTitle)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$isBooking = ($type === 'booking');
$subject = $isBooking 
    ? "Booking Request Received: {$packageTitle} - Ghumo Firoo Travels" 
    : "Enquiry Received: {$packageTitle}";

$banner = getBrochureBanner($packageTitle);
$currentYear = date('Y');
$refId = $bookingId ?: ('GF-' . time());
$statusText = $isBooking ? 'Payment Pending' : 'Processing';
$bodyText = $isBooking 
    ? "Thank you for submitting your booking details. To finalize your reservation, please ensure you complete the payment using the options provided on our website. Once payment is verified, we will issue your travel vouchers."
    : "Thank you for your enquiry. Our travel experts are reviewing your request and will contact you within 24 hours with a customized itinerary.";

$html = "
<div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #1e293b; background-color: #ffffff; box-shadow: 0 8px 30px rgba(0,0,0,0.08);\">
  <!-- LOGO -->
  <div style=\"background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px;\">
    <img src=\"https://ghumofiroo.com/ghumo-firoo-logo.png\" alt=\"Ghumo Firoo Travels\" style=\"max-height: 64px; width: auto; display: inline-block;\" />
  </div>

  <!-- HERO BANNER -->
  <img src=\"{$banner}\" alt=\"{$packageTitle} Banner\" style=\"width: 100%; height: 250px; object-fit: cover; display: block;\" />

  <!-- BODY CONTENT -->
  <div style=\"padding: 28px 24px;\">
    <h2 style=\"color: #ea580c; margin: 0 0 14px 0; font-size: 18px; font-weight: 700;\">Hello {$name},</h2>
    
    <p style=\"font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;\">
      Thank you for choosing <strong style=\"color:#ea580c;\">Ghumo Firoo Travels</strong>!
      We are thrilled to assist you in planning your next escape. We are dedicated to crafting an exceptional travel experience customized just for you.
    </p>

    <!-- INQUIRY CARD -->
    <div style=\"background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 10px; padding: 20px; margin: 20px 0;\">
      <p style=\"font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0;\">📋 Details</p>

      <div style=\"padding: 10px 0; border-bottom: 1px solid #fde8d0;\">
        <span style=\"font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;\">Reference ID</span>
        <span style=\"font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;\">{$refId}</span>
      </div>
      <div style=\"padding: 10px 0; border-bottom: 1px solid #fde8d0;\">
        <span style=\"font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;\">Package Interest</span>
        <span style=\"font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;\">{$packageTitle}</span>
      </div>
      <div style=\"padding: 10px 0; border-bottom: none; padding-bottom: 0;\">
        <span style=\"font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;\">Status</span>
        <span style=\"font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word;\">{$statusText}</span>
      </div>
    </div>

    <p style=\"font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0;\">
      {$bodyText}
    </p>

    <!-- CTA BUTTON -->
    <div style=\"text-align: center; padding: 20px 0 10px 0;\">
      <a href=\"https://ghumofiroo.com\" style=\"display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35);\" target=\"_blank\">✈️ View Details</a>
    </div>

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
      E-mail <a href=\"mailto:info@ghumofiroo.com\" style=\"color: #f97316 !important; text-decoration: none; font-weight: 600;\">info@ghumofiroo.com</a>
    </p>
    <p style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;\">
      🌐 <a href=\"https://ghumofiroo.com\" style=\"color: #f97316 !important; text-decoration: none; font-weight: 600;\" target=\"_blank\">www.ghumofiroo.com</a>
    </p>
    <div style=\"height: 1px; background-color: #1e293b; margin: 16px 0;\"></div>
    
    <!-- Social Media Section -->
    <table role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin-top: 15px; margin-bottom: 15px;\">
      <tr>
        <td align=\"center\" valign=\"top\" style=\"padding: 0 5px; width: 33.33%;\">
          <a href=\"https://www.facebook.com/ghumofirootravels\" target=\"_blank\" style=\"text-decoration: none; display: inline-block;\">
            <img src=\"https://img.icons8.com/color/48/facebook-new.png\" width=\"24\" height=\"24\" alt=\"Facebook\" style=\"display: block; margin: 0 auto 6px auto; border: 0;\" />
            <span style=\"font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2;\">facebook.com</span>
          </a>
        </td>
        <td align=\"center\" valign=\"top\" style=\"padding: 0 5px; width: 33.33%;\">
          <a href=\"https://www.instagram.com/ghumofirootravels/\" target=\"_blank\" style=\"text-decoration: none; display: inline-block;\">
            <img src=\"https://img.icons8.com/color/48/instagram-new.png\" width=\"24\" height=\"24\" alt=\"Instagram\" style=\"display: block; margin: 0 auto 6px auto; border: 0;\" />
            <span style=\"font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2;\">instagram.com</span>
          </a>
        </td>
        <td align=\"center\" valign=\"top\" style=\"padding: 0 5px; width: 33.33%;\">
          <a href=\"https://x.com/GhumoFiroo\" target=\"_blank\" style=\"text-decoration: none; display: inline-block;\">
            <img src=\"https://img.icons8.com/color/48/twitterx.png\" width=\"24\" height=\"24\" alt=\"Twitter/X\" style=\"display: block; margin: 0 auto 6px auto; border: 0;\" />
            <span style=\"font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2;\">x.com</span>
          </a>
        </td>
      </tr>
    </table>

    <div style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;\">
      © {$currentYear} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
    </div>
  </div>
</div>
";

$success = sendEmailPHPMailer($email, $subject, $html);

if ($success) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send email']);
}
