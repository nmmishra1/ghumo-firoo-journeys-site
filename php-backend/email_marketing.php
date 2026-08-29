<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth_middleware.php';
require_once __DIR__ . '/payment_mail_helper.php';

try {
    $pdo = getDb();
    
    // Ensure email_campaigns table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS email_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        body_html TEXT NOT NULL,
        recipient_count INT DEFAULT 0,
        status VARCHAR(50) DEFAULT 'Sent',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )");

    // GET Request — Return Statistics & Lazy Tab Loading
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $action = $_GET['action'] ?? 'bootstrap';

        // Action 1: Lazy Fetch Sent Campaigns Log Tab
        if ($action === 'campaigns' || $action === 'history') {
            $campStmt = $pdo->query("SELECT id, title, subject, recipient_count, status, created_at FROM email_campaigns ORDER BY id DESC LIMIT 50");
            $campaigns = $campStmt ? $campStmt->fetchAll(PDO::FETCH_ASSOC) : [];
            echo json_encode(['success' => true, 'campaigns' => $campaigns]);
            exit;
        }

        // Action 2: Lazy Fetch Subscribers List Tab
        if ($action === 'subscribers') {
            $subStmt = $pdo->query("SELECT email, subscribed_at, status FROM newsletter_subscribers ORDER BY id DESC LIMIT 200");
            $subscribers = $subStmt->fetchAll(PDO::FETCH_ASSOC);

            $leadStmt = $pdo->query("SELECT DISTINCT customer_email as email, created_at as subscribed_at, 'CRM Lead' as status FROM leads WHERE customer_email IS NOT NULL AND customer_email != '' ORDER BY id DESC LIMIT 200");
            $leadsEmails = $leadStmt->fetchAll(PDO::FETCH_ASSOC);

            $emailSet = [];
            $combined = [];
            foreach (array_merge($subscribers, $leadsEmails) as $item) {
                $e = strtolower(trim($item['email']));
                if (!empty($e) && !isset($emailSet[$e])) {
                    $emailSet[$e] = true;
                    $combined[] = [
                        'email' => $e,
                        'subscribed_at' => $item['subscribed_at'] ?? date('Y-m-d H:i:s'),
                        'status' => $item['status'] ?? 'Active'
                    ];
                }
            }
            echo json_encode(['success' => true, 'subscribers' => array_values($combined)]);
            exit;
        }

        // Bootstrap Action (Initial Load): Return KPI Counts & Packages List for Composer
        $subCount = $pdo->query("SELECT COUNT(DISTINCT email) FROM (SELECT email FROM newsletter_subscribers UNION SELECT customer_email AS email FROM leads) AS c")->fetchColumn();
        $campCount = $pdo->query("SELECT COUNT(*) FROM email_campaigns")->fetchColumn();

        $packages = [];
        try {
            $pkgStmt = $pdo->query("SELECT id, name, price, duration, slug, package_type FROM packages ORDER BY id DESC LIMIT 30");
            if ($pkgStmt) {
                $packages = $pkgStmt->fetchAll(PDO::FETCH_ASSOC);
            }
        } catch (Exception $pkgEx) {
            $packages = [];
        }

        echo json_encode([
            'success' => true,
            'total_subscribers' => intval($subCount),
            'total_campaigns_sent' => intval($campCount),
            'packages' => $packages
        ]);
        exit;
    }

    // POST Request — Dispatch Email Marketing Campaign with Dynamic Tag Substitution
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $title = trim($input['title'] ?? 'Luxury Travel Digest');
        $rawSubject = trim($input['subject'] ?? 'Exclusive 2026 Travel Escapes — Ghumo Firoo Journeys');
        $rawBodyHtml = $input['body_html'] ?? '';
        $targetEmails = $input['target_emails'] ?? [];

        if (empty($rawSubject) || empty($rawBodyHtml)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Subject and Email HTML Body are required.']);
            exit;
        }

        // If no target emails specified, send to all subscribers + CRM leads
        if (empty($targetEmails)) {
            $subQuery = "SELECT email FROM (
                SELECT DISTINCT email FROM newsletter_subscribers WHERE email IS NOT NULL AND email != ''
                UNION
                SELECT DISTINCT customer_email AS email FROM leads WHERE customer_email IS NOT NULL AND customer_email != ''
            ) AS combined_subscribers";
            $subStmt = $pdo->query($subQuery);
            $targetEmails = $subStmt->fetchAll(PDO::FETCH_COLUMN, 0);
        }

        $sentCount = 0;
        $failedEmails = [];

        // Build name lookup map from leads & subscribers
        $namesMap = [];
        $leadNames = $pdo->query("SELECT customer_email, customer_name FROM leads WHERE customer_email IS NOT NULL AND customer_name IS NOT NULL");
        if ($leadNames) {
            foreach ($leadNames->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $e = strtolower(trim($row['customer_email']));
                if (!empty($row['customer_name']) && strpos($row['customer_name'], 'Subscriber') === false) {
                    $namesMap[$e] = $row['customer_name'];
                }
            }
        }

        foreach ($targetEmails as $recipientEmail) {
            $recipientEmail = trim($recipientEmail);
            if (!empty($recipientEmail) && filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)) {
                $cleanKey = strtolower($recipientEmail);
                
                // Determine recipient name
                if (isset($namesMap[$cleanKey])) {
                    $recipientName = $namesMap[$cleanKey];
                } else {
                    $parts = explode('@', $recipientEmail);
                    $recipientName = ucfirst(preg_replace('/[^a-zA-Z]/', '', $parts[0])) ?: 'Valued Traveler';
                }

                // Dynamic Tag Substitution per Recipient
                $personalizedSubject = str_replace(
                    ['{{NAME}}', '{{RECIPIENT_NAME}}', '{{EMAIL}}', '{{YEAR}}'],
                    [$recipientName, $recipientName, $recipientEmail, date('Y')],
                    $rawSubject
                );

                $unsubUrl = "https://ghumofiroo.com/unsubscribe?email=" . urlencode($recipientEmail);
                $personalizedBody = str_replace(
                    ['{{NAME}}', '{{RECIPIENT_NAME}}', '{{EMAIL}}', '{{YEAR}}', '{{UNSUBSCRIBE_LINK}}'],
                    [$recipientName, $recipientName, $recipientEmail, date('Y'), $unsubUrl],
                    $rawBodyHtml
                );

                $sent = sendEmailPHPMailer($recipientEmail, $personalizedSubject, $personalizedBody);
                $sentCount++;
                if (!$sent) {
                    $failedEmails[] = $recipientEmail;
                }
            }
        }

        // Record Campaign History
        $cStmt = $pdo->prepare("INSERT INTO email_campaigns (title, subject, body_html, recipient_count, status, created_at) VALUES (?, ?, ?, ?, 'Sent', NOW())");
        $cStmt->execute([$title, $rawSubject, $rawBodyHtml, $sentCount]);

        echo json_encode([
            'success' => true,
            'message' => "Campaign successfully dispatched to $sentCount subscriber(s)!",
            'recipients_sent' => $sentCount
        ]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
