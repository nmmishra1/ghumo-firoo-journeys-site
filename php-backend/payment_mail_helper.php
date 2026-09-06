<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/vendor/autoload.php';

// Parse .env if environment variables are not set
if (!getenv('SMTP_HOST')) {
    $envFile = __DIR__ . '/../.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '#') === 0) continue;
            $parts = explode('=', $line, 2);
            if (count($parts) === 2) {
                putenv(trim($parts[0]) . '=' . trim($parts[1]));
                $_ENV[trim($parts[0])] = trim($parts[1]);
            }
        }
    }
}

function wrapLuxuryEmailTemplate($subject, $contentHtml) {
    if (strpos($contentHtml, '<html') !== false) {
        return $contentHtml;
    }

    $year = date('Y');
    return "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <meta name='viewport' content='width=device-width, initial-scale=1.0'>
      <title>{$subject}</title>
      <style>
        body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f1f5f9; padding: 30px 10px; }
        .main-card { max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .header { background: linear-gradient(135deg, #0B1226 0%, #101936 100%); padding: 30px 24px; text-align: center; border-bottom: 3px solid #C9A25A; }
        .header-logo { max-height: 52px; width: auto; margin-bottom: 8px; }
        .badge { display: inline-block; background-color: rgba(201, 162, 90, 0.18); border: 1px solid rgba(201, 162, 90, 0.4); color: #E5C378; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 50px; margin-top: 6px; }
        .body-content { padding: 32px 28px; font-size: 14px; line-height: 1.7; color: #334155; background-color: #ffffff; text-align: left; }
        .body-content h1, .body-content h2, .body-content h3 { color: #0F172A; font-family: Georgia, serif; margin-top: 0; }
        .body-content a { color: #855B14; font-weight: bold; text-decoration: underline; }
        .footer { background-color: #0B1226; padding: 24px; text-align: center; font-size: 11px; color: #94A3B8; border-top: 1px solid rgba(255,255,255,0.08); }
        .footer a { color: #E5C378; text-decoration: none; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class='wrapper'>
        <div class='main-card'>
          <div class='header'>
            <a href='https://ghumofiroo.com' target='_blank'>
              <img src='https://ghumofiroo.com/ghumo-firoo-logo.png' alt='Ghumo Firoo Journeys' class='header-logo' />
            </a>
            <div>
              <span class='badge'>🌐 Ministry of Tourism (MoT) NIDHI Registered Partner</span>
            </div>
          </div>
          <div class='body-content'>
            {$contentHtml}
          </div>
          <div class='footer'>
            <p style='margin: 0 0 6px 0; color: #F8FAFC;'><strong>Ghumo Firoo Travels Private Limited</strong></p>
            <p style='margin: 0 0 10px 0; color: #94A3B8;'>📞 Concierge: <a href='tel:+919910987264' style='color: #E5C378;'>+91 99109 87264</a> / <a href='tel:+919870229792' style='color: #E5C378;'>+91 98702 29792</a> | ✉️ <a href='mailto:booking@ghumofiroo.com' style='color: #E5C378;'>booking@ghumofiroo.com</a></p>
            <p style='margin: 0; color: #64748B;'>&copy; {$year} Ghumo Firoo Journeys. All rights reserved. Built for Luxury Travel.</p>
          </div>
        </div>
      </div>
    </body>
    </html>";
}

function sendEmailPHPMailer($to, $subject, $htmlBody) {
    if (empty($to)) return false;

    // Wrap body with luxury Ghumo Firoo branding
    $htmlBody = wrapLuxuryEmailTemplate($subject, $htmlBody);

    // 1. Primary High-Reliability Mailer: Resend REST API
    $resendKey = getenv('RESEND_API_KEY') ?: '';
    if (!empty($resendKey)) {
        $resendPayload = json_encode([
            'from' => 'Ghumo Firoo Journeys <noreply@ghumofiroo.com>',
            'to' => [$to],
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
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        $resendResponse = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300) {
            return true;
        }
    }

    // 2. Secondary Mailer: PHPMailer SMTP
    $smtpPass = getenv('SMTP_PASS') ?: '';
    if (empty($smtpPass)) {
        error_log("[Mailer] SMTP_PASS not set in environment");
    }

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = getenv('SMTP_HOST') ?: 'mail.ghumofiroo.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = getenv('SMTP_USER') ?: 'noreply@ghumofiroo.com';
        $mail->Password   = $smtpPass;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL/TLS port 465
        $mail->Port       = intval(getenv('SMTP_PORT')) ?: 465;
        $mail->Timeout    = 8;
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        if ($mail->Port === 587) {
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->setFrom($mail->Username, 'Ghumo Firoo Travels');
        $mail->addAddress($to);
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("PHPMailer failed sending to $to: " . $mail->ErrorInfo);
        // Fallback to PHP mail()
        $fromEmail = getenv('SMTP_USER') ?: 'noreply@ghumofiroo.com';
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=utf-8\r\n";
        $headers .= "From: Ghumo Firoo Travels <{$fromEmail}>\r\n";
        return mail($to, $subject, $htmlBody, $headers);
    }
}

function sendPaymentReceiptEmail($toEmail, $guestName, $amount, $paymentMode, $referenceNumber, $remarks) {
    if (empty($toEmail)) return;

    $dateStr = date('j F Y');
    $formattedAmount = number_format($amount, 2, '.', ',');
    
    $emailHtml = "
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset='utf-8'>
      <title>Payment Receipt - Ghumo Firoo Travels</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fc; margin: 0; padding: 0; color: #333333; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #e1e8ed; }
        .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 30px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #f59e0b; margin-bottom: 5px; }
        .header-title { font-size: 20px; margin: 0; font-weight: 600; color: #ffffff; }
        .content { padding: 30px 25px; line-height: 1.6; }
        .greeting { font-size: 16px; font-weight: bold; margin-bottom: 15px; }
        .receipt-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
        .receipt-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-weight: 500; }
        .value { color: #0f172a; font-weight: 600; text-align: right; }
        .total-amount { font-size: 18px; font-weight: 800; color: #10b981; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .support-info { margin-top: 10px; font-weight: 500; }
      </style>
    </head>
    <body>
      <div class='container'>
        <div class='header'>
          <div class='logo'>GHUMO FIROO TRAVELS</div>
          <h1 class='header-title'>Payment Confirmation</h1>
        </div>
        <div class='content'>
          <div class='greeting'>Dear {$guestName},</div>
          <p>Thank you for making your payment. We have successfully processed and received your transaction. Below are your payment details for your reference:</p>
          
          <div class='receipt-card'>
            <table width='100%' cellpadding='0' cellspacing='0'>
              <tr class='receipt-row'><td class='label' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0;'>Client Name:</td><td class='value' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 600; text-align: right;'>{$guestName}</td></tr>
              <tr class='receipt-row'><td class='label' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0;'>Payment Mode:</td><td class='value' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 600; text-align: right;'>{$paymentMode}</td></tr>
              <tr class='receipt-row'><td class='label' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0;'>Reference ID:</td><td class='value' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 600; text-align: right;'>{$referenceNumber}</td></tr>
              <tr class='receipt-row'><td class='label' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0;'>Purpose:</td><td class='value' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 600; text-align: right;'>{$remarks}</td></tr>
              <tr class='receipt-row'><td class='label' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0;'>Date:</td><td class='value' style='padding: 10px 0; border-bottom: 1px dashed #e2e8f0; font-weight: 600; text-align: right;'>{$dateStr}</td></tr>
              <tr class='receipt-row'><td class='label' style='padding: 10px 0;'>Amount Paid:</td><td class='value total-amount' style='padding: 10px 0; font-weight: 800; color: #10b981; text-align: right;'>₹{$formattedAmount}</td></tr>
            </table>
          </div>
          
          <p>Your booking ledger has been automatically updated in our CRM system. Our travel planner will contact you shortly with the next steps.</p>
          <p>If you have any questions or require immediate assistance, please do not hesitate to contact us.</p>
        </div>
        <div class='footer'>
          <div>This is an automated payment receipt. Please do not reply directly to this email.</div>
          <div class='support-info'>
            Contact Support: info@ghumofiroo.com | +91-9910987264
          </div>
        </div>
      </div>
    </body>
    </html>
    ";
    
    return sendEmailPHPMailer($toEmail, "Payment Receipt: ₹" . number_format($amount, 0) . " received successfully", $emailHtml);
}

function sendAdminNotificationEmail($guestName, $amount, $paymentMode, $referenceNumber, $remarks) {
    $adminEmail = 'info@ghumofiroo.com';
    $formattedAmount = number_format($amount, 2, '.', ',');
    $dateStr = date('Y-m-d H:i:s');
    
    $emailHtml = "
    <h3>New Online Payment Received</h3>
    <p>A new payment has been completed via the Quick Payment Link portal.</p>
    <table border='1' cellpadding='6' style='border-collapse: collapse;'>
      <tr><td><b>Guest Name</b></td><td>{$guestName}</td></tr>
      <tr><td><b>Amount</b></td><td>₹{$formattedAmount}</td></tr>
      <tr><td><b>Payment Mode</b></td><td>{$paymentMode}</td></tr>
      <tr><td><b>Reference ID</b></td><td>{$referenceNumber}</td></tr>
      <tr><td><b>Purpose</b></td><td>{$remarks}</td></tr>
      <tr><td><b>Date</b></td><td>{$dateStr}</td></tr>
    </table>
    <p>Check the CRM Payments Ledger at <a href='https://ghumofiroo.com/crm/payments'>https://ghumofiroo.com/crm/payments</a>.</p>
    ";
    
    return sendEmailPHPMailer($adminEmail, "[Payment Notification] ₹{$amount} from {$guestName}", $emailHtml);
}
