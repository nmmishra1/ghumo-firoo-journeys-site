<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/payment_mail_helper.php';

$payuKey = getenv('PAYU_KEY');
$payuSalt = getenv('PAYU_SALT');

$status = $_POST['status'] ?? '';
$amount = $_POST['amount'] ?? '';
$txnid = $_POST['txnid'] ?? '';
$firstname = $_POST['firstname'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$udf1 = $_POST['udf1'] ?? ''; // lead_id
$udf2 = $_POST['udf2'] ?? ''; // remarks/purpose
$udf3 = $_POST['udf3'] ?? ''; // email
$udf4 = $_POST['udf4'] ?? ''; // phone
$mode = $_POST['mode'] ?? 'Online';
$postedHash = $_POST['hash'] ?? '';

// Check if status is success
if ($status === 'success') {
    try {
        $pdo = getDb();
        
        $leadId = $udf1;
        if (empty($leadId)) {
            $targetEmail = $udf3 ?: $email;
            if (!empty($targetEmail)) {
                $stmt = $pdo->prepare("SELECT id FROM leads WHERE customer_email = ? LIMIT 1");
                $stmt->execute([trim($targetEmail)]);
                $row = $stmt->fetch();
                if ($row) {
                    $leadId = $row['id'];
                }
            }
            if (empty($leadId)) {
                $targetPhone = $udf4 ?: $phone;
                if (!empty($targetPhone)) {
                    $cleanPhone = preg_replace('/[^0-9]/', '', $targetPhone);
                    if (strlen($cleanPhone) >= 10) {
                        $last10 = substr($cleanPhone, -10);
                        $stmt = $pdo->prepare("SELECT id FROM leads WHERE customer_phone LIKE ? LIMIT 1");
                        $stmt->execute(["%$last10"]);
                        $row = $stmt->fetch();
                        if ($row) {
                            $leadId = $row['id'];
                        }
                    }
                }
            }
        }
        
        $payId = 'pay-' . time() . '-' . rand(1000, 9999);
        $payDate = date('Y-m-d');
        $gatewayCharges = floatval($amount) * 0.0236;
        
        $stmt = $pdo->prepare("
            INSERT INTO payments (id, lead_id, amount_received, payment_date, payment_mode, reference_number, remarks, status, received_by, gateway_charges)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $payId,
            !empty($leadId) ? $leadId : null,
            floatval($amount),
            $payDate,
            "PayU ({$mode})",
            $txnid,
            $udf2 ?: 'Quick Payment Link',
            'Success',
            'Online Payment',
            $gatewayCharges
        ]);
        
        // Update lead status
        if (!empty($leadId)) {
            $stmt = $pdo->prepare("UPDATE leads SET status = 'Booking Confirmed' WHERE id = ?");
            $stmt->execute([$leadId]);
        }
        
        // Send email receipt
        $targetEmail = $udf3 ?: $email;
        if (!empty($targetEmail)) {
            sendPaymentReceiptEmail($targetEmail, $firstname ?: 'Guest', floatval($amount), "PayU ({$mode})", $txnid, $udf2 ?: 'Quick Payment Link');
        }
        sendAdminNotificationEmail($firstname ?: 'Guest', floatval($amount), "PayU ({$mode})", $txnid, $udf2 ?: 'Quick Payment Link');
        
    } catch (Exception $e) {
        error_log("PayU success callback database log failed: " . $e->getMessage());
    }
    
    // Redirect to thank you page
    header("Location: https://ghumofiroo.com/thank-you?payment=success&gateway=payu&ref=" . urlencode($txnid));
} else {
    // Redirect to failed page
    header("Location: https://ghumofiroo.com/booking-failed?payment=failure&gateway=payu");
}
