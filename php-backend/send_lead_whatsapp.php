<?php
// send_lead_whatsapp.php — Branded CRM WhatsApp Dispatcher for Ghumo Firoo Journeys
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/send_whatsapp.php';

if (function_exists('loadEnvFile')) {
    loadEnvFile();
}

// Main handler when invoked directly via HTTP POST or CLI
if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'send_lead_whatsapp.php') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST ?? [];

    $leadId       = $input['lead_id'] ?? null;
    $templateType = $input['template_type'] ?? 'quote_pdf';
    $overridePhone = $input['phone'] ?? null;
    $customPdfUrl  = $input['pdf_url'] ?? null;
    $customText    = $input['custom_text'] ?? null;
    $paymentUrl    = $input['payment_url'] ?? null;

    $customerName  = $input['customer_name'] ?? null;
    $destination   = $input['destination'] ?? $input['destinations'] ?? null;

    if (!$leadId && !$overridePhone) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Lead ID or target phone number is required']);
        exit;
    }
    
    $result = sendBrandedLeadWhatsApp($leadId, $templateType, $overridePhone, $customPdfUrl, $customText, $paymentUrl, $customerName, $destination);
    echo json_encode($result);
    exit;
}

function sendBrandedLeadWhatsApp(
    $leadId = null, 
    string $templateType = 'quote_pdf', 
    ?string $overridePhone = null, 
    ?string $customPdfUrl = null, 
    ?string $customText = null, 
    ?string $paymentUrl = null,
    ?string $customCustomerName = null,
    ?string $customDestination = null
): array {
    global $pdo;

    // Fetch Lead Data from MySQL if lead_id provided
    $lead = [];
    if ($leadId && isset($pdo)) {
        try {
            $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ? OR lead_id = ? LIMIT 1");
            $stmt->execute([$leadId, $leadId]);
            $lead = $stmt->fetch(PDO::FETCH_ASSOC) ?: [];
        } catch (Exception $e) {
            $lead = [];
        }
    }

    $customerName = !empty($customCustomerName) ? $customCustomerName : (!empty($lead['customer_name']) ? $lead['customer_name'] : (!empty($lead['name']) ? $lead['name'] : 'Valued Guest'));
    $phone        = $overridePhone ?: ($lead['whatsapp_number'] ?? $lead['customer_phone'] ?? $lead['phone'] ?? '');
    $destination  = !empty($customDestination) ? $customDestination : (!empty($lead['destinations']) ? $lead['destinations'] : (!empty($lead['destination']) ? $lead['destination'] : (!empty($lead['package_name']) ? $lead['package_name'] : 'Holiday Package')));
    $duration     = $lead['duration'] ?? 'Custom Days';
    $travelDates  = $lead['trip_start_date'] ?? $lead['travel_dates'] ?? 'Upcoming Travel Date';
    $packagePrice = !empty($lead['quoted_price']) ? ('₹' . number_format((float)$lead['quoted_price'])) : ($lead['price_text'] ?? 'Best Market Rate');
    $pdfUrl       = $customPdfUrl ?: ($lead['pdf_brochure_url'] ?: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');

if (empty($phone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'No phone/WhatsApp number found for this lead']);
    exit;
}

// Format Branded Templates
$messageText = '';
$result = [];

switch ($templateType) {
    case 'welcome_greeting':
        $messageText = $customText ?: "🌟 *WELCOME TO GHUMO FIROO JOURNEYS!* 🌟\n\n"
            . "Dear *{$customerName}*,\n\n"
            . "Thank you for reaching out to *Ghumo Firoo Journeys* regarding your upcoming *{$destination}* travel plan! 🏰✨\n\n"
            . "We are preparing your customized holiday options.\n"
            . "📅 *What is the best time today for your dedicated Travel Concierge to connect with a short 2-minute call?*\n\n"
            . "📱 *A)* Morning (10 AM - 1 PM)\n"
            . "📱 *B)* Afternoon (1 PM - 5 PM)\n"
            . "📱 *C)* Evening (5 PM - 8 PM)\n\n"
            . "*(Or simply reply with your preferred time!)*\n\n"
            . "📞 Concierge Helpline: *+91 98702 29792* | 🌐 www.ghumofiroo.com";
        $result = sendWhatsAppText($phone, $messageText);
        break;

    case 'quote_pdf':
        $messageText = $customText ?: "🌟 *GHUMO FIROO JOURNEYS — LUXURY TRAVEL QUOTE* 🌟\n\n"
            . "Dear *{$customerName}*,\n\n"
            . "Greetings from Ghumo Firoo Journeys! 🏰✨\n\n"
            . "Thank you for inquiring about your upcoming *{$destination}* holiday package.\n\n"
            . "📄 *Attached PDF*: Complete Day-by-Day Itinerary & Price Breakdown\n"
            . "💰 *Special Package Price*: *{$packagePrice}*\n"
            . "📅 *Travel Dates*: {$travelDates}\n\n"
            . "🎒 *Included Services*:\n"
            . "• Luxury Resort / Tent Accommodation\n"
            . "• Daily Breakfast & Chef Dinners\n"
            . "• Private AC Vehicle Sightseeing & Airport Transfers\n"
            . "• 24/7 Personal Travel Concierge\n\n"
            . "💬 Reply directly to this message or call your Concierge at *+91 98702 29792* to lock in your dates!\n\n"
            . "🌐 www.ghumofiroo.com";
        
        $result = sendWhatsAppPdf($phone, $pdfUrl, "GhumoFiroo_{$destination}_Quote.pdf", $messageText);
        break;

    case 'payment_reminder':
        $payLink = $paymentUrl ?: "https://ghumofiroo.com/pay?lead={$leadId}";
        $messageText = $customText ?: "💳 *GHUMO FIROO JOURNEYS — RESERVATION PAYMENT LINK* 💳\n\n"
            . "Dear *{$customerName}*,\n\n"
            . "Your booking for *{$destination}* (*{$travelDates}*) is ready for instant confirmation!\n\n"
            . "📄 *Reference ID*: `#GF-{$leadId}`\n"
            . "💰 *Amount Due*: *{$packagePrice}*\n\n"
            . "🔗 *Click to Complete Secure Payment (Razorpay/PayU)*:\n{$payLink}\n\n"
            . "*(Once payment is completed, your official booking voucher and GST tax invoice will be dispatched immediately to your WhatsApp!)*\n\n"
            . "📞 Concierge Helpline: +91 98702 29792 | booking@ghumofiroo.com";

        $result = sendWhatsAppText($phone, $messageText);
        break;

    case 'booking_voucher':
        $messageText = $customText ?: "🎉 *BOOKING CONFIRMED — GHUMO FIROO JOURNEYS* 🎉\n\n"
            . "Dear *{$customerName}*,\n\n"
            . "Pack your bags! Your holiday to *{$destination}* is officially confirmed! 🧳✨\n\n"
            . "🎫 *Voucher ID*: `#VCH-{$leadId}`\n"
            . "📅 *Travel Dates*: {$travelDates}\n"
            . "🚘 *Transfers*: Private AC Vehicle Included\n\n"
            . "📄 *Attached Document*: Official Booking Confirmation Voucher & GST Tax Invoice\n\n"
            . "💬 We wish you a delightful journey! Need anything? Call your concierge directly at *+91 98702 29792*.";

        $result = sendWhatsAppPdf($phone, $pdfUrl, "GhumoFiroo_Booking_Voucher.pdf", $messageText);
        break;

    case 'post_trip_review':
        $reviewLink = "https://ghumofiroo.com/review";
        $messageText = $customText ?: "❤️ *THANK YOU FOR TRAVELING WITH GHUMO FIROO JOURNEYS!* ❤️\n\n"
            . "Dear *{$customerName}*,\n\n"
            . "We hope you had an unforgettable, magical experience on your *{$destination}* holiday! 🏔️✨\n\n"
            . "Could you spare 60 seconds to share your review with fellow travelers?\n"
            . "⭐ *Share Your Google Review*: {$reviewLink}\n\n"
            . "As a token of our gratitude, enjoy an *extra ₹1,500 OFF* on your next holiday booking with us!\n\n"
            . "📞 Helpline: +91 98702 29792 | www.ghumofiroo.com";

        $result = sendWhatsAppText($phone, $messageText);
        break;

    case 'custom_text':
    default:
        $messageText = $customText ?: "Hello *{$customerName}*, greetings from Ghumo Firoo Journeys (+91 98702 29792)! How can we assist with your *{$destination}* travel plans?";
        $result = sendWhatsAppText($phone, $messageText);
        break;
}

// Log Communication in Database
if ($leadId && isset($pdo) && !empty($result['success'])) {
    try {
        $logStmt = $pdo->prepare("INSERT INTO lead_communications (lead_id, type, channel, content, created_at) VALUES (?, 'whatsapp_sent', 'whatsapp', ?, NOW())");
        $logStmt->execute([$leadId, "Sent {$templateType} template to {$phone}"]);
    } catch (Exception $e) {}
}

    return [
        'success'       => !empty($result['success']),
        'template_type' => $templateType,
        'customer_name' => $customerName,
        'phone'         => $phone,
        'result'        => $result
    ];
}
