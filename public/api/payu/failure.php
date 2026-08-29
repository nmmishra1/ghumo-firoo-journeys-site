<?php
require_once __DIR__ . '/../db.php';
$serverBaseUrl = getEnvVal('SERVER_BASE_URL', 'https://ghumofiroo.com');
header("Location: $serverBaseUrl/booking-failed?payment=failure&gateway=payu");
exit;
?>
