<?php
error_reporting(0);
ini_set('display_errors', 0);
// newsletter.php — Public endpoint to handle newsletter subscriptions and auto-create leads in CRM.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth_middleware.php';

$input = json_decode(file_get_contents('php://input'), true);
$email = trim($input['email'] ?? $_POST['email'] ?? '');

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Valid email address is required']);
    exit;
}

try {
    $pdo = getDb();
    
    // 1. Check or Create newsletter_subscribers table
    $pdo->exec("CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'Active'
    )");

    // 2. Insert into newsletter_subscribers
    $stmt = $pdo->prepare("INSERT INTO newsletter_subscribers (email, status) VALUES (?, 'Active') ON DUPLICATE KEY UPDATE status = 'Active'");
    $stmt->execute([$email]);

    // 4. Send Automated Luxury HTML Welcome Email to Subscriber
    require_once __DIR__ . '/payment_mail_helper.php';
    
    $welcomeSubject = "Welcome to Ghumo Firoo Journeys — Your 2026 Private Travel Journal";
    $welcomeHtml = "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #070C1E; color: #E2E8F0; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #0B1226; border: 1px solid #C9A25A; border-radius: 16px; padding: 32px; }
        .header { text-align: center; border-b: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #C9A25A; text-decoration: none; }
        .content { font-size: 14px; line-height: 1.6; color: #CBD5E1; margin: 24px 0; }
        .highlight-box { background: rgba(201,162,90,0.1); border-left: 4px solid #C9A25A; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .btn { display: inline-block; background: linear-gradient(135deg, #C9A25A, #E5C378); color: #070C1E; text-decoration: none; font-weight: bold; padding: 12px 28px; border-radius: 8px; font-size: 13px; text-transform: uppercase; margin-top: 16px; }
        .footer { font-size: 11px; color: #64748B; text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; margin-top: 28px; }
      </style>
    </head>
    <body>
      <div class='container'>
        <div class='header'>
          <a href='https://ghumofiroo.com' class='logo'>✨ GHUMO FIROO JOURNEYS</a>
          <p style='color: #94A3B8; font-size: 12px; margin-top: 4px;'>Ministry of Tourism (MoT) NIDHI Registered Partner</p>
        </div>
        <div class='content'>
          <h2 style='color: #FFFFFF; font-size: 20px;'>Welcome to Private Travel Inspiration, $nameFromEmail!</h2>
          <p>Thank you for subscribing to our bespoke travel journal. You are now part of an exclusive circle of travelers receiving early-bird access to seasonal festival packages, private helicopter slots, and curated luxury itineraries.</p>
          
          <div class='highlight-box'>
            <h4 style='color: #E5C378; margin: 0 0 8px 0;'>🎁 Your VIP Welcome Offer:</h4>
            <p style='margin: 0; font-size: 13px;'>Enjoy <strong>₹2,500 Instant Discount</strong> or <strong>Complimentary Airport SUV Upgrade</strong> on your first booking for Rann Utsav, Char Dham Yatra, or Europe!</p>
          </div>

          <p>Popular 2026 Destinations currently open for reservation:</p>
          <ul>
            <li><strong>White Desert Rann Utsav</strong> (Official Evoke Tent City AC Swiss Tents)</li>
            <li><strong>Char Dham Yatra by Helicopter</strong> (Kedarnath & Badrinath VIP Darshan)</li>
            <li><strong>Singapore 4D3N Luxury Retreat</strong> (Universal Studios & Marina Bay Sands)</li>
            <li><strong>Grand Europe & Swiss Alps</strong> (Schengen Visa & Panoramic Trains)</li>
          </ul>

          <div style='text-align: center;'>
            <a href='https://ghumofiroo.com/packages' class='btn'>Explore 2026 Packages →</a>
          </div>
        </div>
        <div class='footer'>
          <p>Ghumo Firoo Travels • Delhi NCR, India • Concierge: +91 99109 87264 / +91 98702 29792</p>
          <p>&copy; " . date('Y') . " Ghumo Firoo Journeys. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>";

    @sendEmailPHPMailer($email, $welcomeSubject, $welcomeHtml);

    // 5. Send Notification Email to Admin
    $adminSubject = "🟢 New Newsletter Lead: $email";
    $adminHtml = "<p>A new visitor subscribed to <strong>Private Travel Inspiration</strong> on your website footer:</p><ul><li>Email: <strong>$email</strong></li><li>Time: " . date('Y-m-d H:i:s') . "</li><li>Source: Website Footer</li></ul><p>View in CRM: <a href='http://localhost:8080/crm/leads'>http://localhost:8080/crm/leads</a></p>";
    @sendEmailPHPMailer('booking@ghumofiroo.com', $adminSubject, $adminHtml);

    echo json_encode([
        'success' => true,
        'message' => 'Thank you for subscribing! Your 2026 Private Travel Journal & VIP Welcome Offer email has been sent.'
    ]);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
