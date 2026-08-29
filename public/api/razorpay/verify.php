<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/../db.php';

$key_secret = getEnvVal('RAZORPAY_KEY_SECRET', 'uyoKOzxi5rnikfuGAB8RoJ1L');

if (empty($key_secret)) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['error' => 'razorpay_not_configured']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$order_id = $input['razorpay_order_id'] ?? '';
$payment_id = $input['razorpay_payment_id'] ?? '';
$signature = $input['razorpay_signature'] ?? '';

// Lead association fields
$lead_id = $input['lead_id'] ?? '';
$amount = $input['amount'] ?? 0;
$remarks = $input['remarks'] ?? 'Razorpay Payment';
$email = $input['email'] ?? '';
$phone = $input['phone'] ?? '';
$name = $input['name'] ?? 'Guest';

if (empty($order_id) || empty($payment_id) || empty($signature)) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Missing signature fields']);
    exit;
}

$payload = "$order_id|$payment_id";
$expectedSignature = hash_hmac('sha256', $payload, $key_secret);

if ($expectedSignature === $signature) {
    // Payment verified!
    // Try to find lead_id if not directly passed
    if (empty($lead_id)) {
        $lead_id = findLeadByContact($email, $phone);
    }
    
    // Fetch payment details from Razorpay API to get exact payment mode and gateway charges
    $payment_mode = 'Razorpay';
    $gateway_charges = $amount * 0.0236; // Default fallback
    
    $key_id = getEnvVal('RAZORPAY_KEY_ID', 'rzp_live_SlexboFyFLdaX8');
    if (!empty($key_id) && !empty($key_secret)) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://api.razorpay.com/v1/payments/" . $payment_id);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_USERPWD, $key_id . ":" . $key_secret);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $response = curl_exec($ch);
        $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($http_status === 200) {
            $pay_details = json_decode($response, true);
            if (!empty($pay_details)) {
                $method = $pay_details['method'] ?? 'Razorpay';
                if ($method === 'card') {
                    $card_network = $pay_details['card']['network'] ?? 'Card';
                    $payment_mode = "Card: " . $card_network;
                } else if ($method === 'upi') {
                    $payment_mode = 'UPI';
                } else if ($method === 'netbanking') {
                    $payment_mode = 'Net Banking: ' . ($pay_details['bank'] ?? 'Bank');
                } else {
                    $payment_mode = ucfirst($method);
                }
                
                // Exact fee charged by Razorpay (in paise, so divide by 100)
                if (isset($pay_details['fee'])) {
                    $gateway_charges = floatval($pay_details['fee']) / 100;
                }
            }
        }
    }
    
    // Insert payment record into Supabase
    $dbInserted = insertSupabasePayment(
        !empty($lead_id) ? $lead_id : null,
        $amount,
        $payment_mode,
        $payment_id,
        $remarks,
        $gateway_charges
    );
    
    // Send confirmation email to guest
    if (!empty($email)) {
        sendPaymentReceiptEmailPHP(
            $email,
            $name,
            $amount,
            $payment_mode,
            $payment_id,
            $remarks
        );
    }
    
    // Send notification to admin
    sendAdminNotificationEmailPHP(
        $name,
        $amount,
        $payment_mode,
        $payment_id,
        $remarks
    );
    
    echo json_encode([
        'verified' => true,
        'db_recorded' => $dbInserted,
        'lead_id' => $lead_id,
        'gateway_charges' => $gateway_charges
    ]);
} else {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['verified' => false]);
}
?>
