<?php
require_once __DIR__ . '/../db.php';
$serverBaseUrl = getEnvVal('SERVER_BASE_URL', 'https://ghumofiroo.com');

$status = $_POST['status'] ?? '';
$amount = $_POST['amount'] ?? '';
$txnid = $_POST['txnid'] ?? '';
$productinfo = $_POST['productinfo'] ?? '';
$firstname = $_POST['firstname'] ?? '';
$email = $_POST['email'] ?? '';

// Retrieve metadata fields from UDF
$lead_id = $_POST['udf1'] ?? '';
$remarks = $_POST['udf2'] ?? 'PayU Payment';
$c_email = $_POST['udf3'] ?? '';
$c_phone = $_POST['udf4'] ?? '';
$mode = $_POST['mode'] ?? '';
$bankcode = $_POST['bankcode'] ?? '';
$additional_charges = $_POST['additionalcharges'] ?? 0;

if ($status === 'success') {
    // Try to find lead by email/phone if lead_id was not explicitly passed
    if (empty($lead_id)) {
        $lead_id = findLeadByContact($c_email, $c_phone);
    }
    
    // Resolve exact payment mode
    $payment_mode = 'PayU';
    if (!empty($mode)) {
        if ($mode === 'CC') {
            $payment_mode = 'Card: Credit (' . (!empty($bankcode) ? $bankcode : 'Visa/Master') . ')';
        } else if ($mode === 'DC') {
            $payment_mode = 'Card: Debit (' . (!empty($bankcode) ? $bankcode : 'Visa/Master') . ')';
        } else if ($mode === 'UPI') {
            $payment_mode = 'UPI';
        } else if ($mode === 'NB') {
            $payment_mode = 'Net Banking: ' . (!empty($bankcode) ? $bankcode : 'Bank');
        } else {
            $payment_mode = 'PayU (' . $mode . ')';
        }
    }
    
    // Compute gateway charges: if PayU returns additionalcharges in POST, use it. Otherwise fall back to 2.36%
    $gateway_charges = $amount * 0.0236;
    if ($additional_charges > 0) {
        $gateway_charges = floatval($additional_charges);
    }
    
    // Insert into Supabase payments table
    insertSupabasePayment(
        !empty($lead_id) ? $lead_id : null,
        $amount,
        $payment_mode,
        $txnid,
        $remarks,
        $gateway_charges
    );
    
    // Send confirmation email to guest
    $targetEmail = !empty($c_email) ? $c_email : $email;
    if (!empty($targetEmail)) {
        sendPaymentReceiptEmailPHP(
            $targetEmail,
            !empty($firstname) ? $firstname : 'Guest',
            $amount,
            $payment_mode,
            $txnid,
            $remarks
        );
    }
    
    // Send notification to admin
    sendAdminNotificationEmailPHP(
        !empty($firstname) ? $firstname : 'Guest',
        $amount,
        $payment_mode,
        $txnid,
        $remarks
    );
    
    header("Location: $serverBaseUrl/thank-you?payment=success&gateway=payu");
} else {
    header("Location: $serverBaseUrl/booking-failed?payment=failure&gateway=payu");
}
exit;
?>
