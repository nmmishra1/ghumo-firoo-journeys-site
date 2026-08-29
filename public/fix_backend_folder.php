<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

$htaccessFile = __DIR__ . '/php-backend/.htaccess';
$content = "# php -- BEGIN cPanel-generated handler, do not edit\n"
         . "<IfModule mime_module>\n"
         . "  AddHandler application/x-httpd-ea-php83___lsphp .php .php8 .phtml\n"
         . "</IfModule>\n"
         . "# php -- END cPanel-generated handler, do not edit\n\n"
         . "<IfModule mod_authz_core.c>\n"
         . "    Require all granted\n"
         . "</IfModule>\n"
         . "<IfModule !mod_authz_core.c>\n"
         . "    Order Allow,Deny\n"
         . "    Allow from all\n"
         . "</IfModule>\n";

$res = file_put_contents($htaccessFile, $content);
echo "Updating php-backend/.htaccess status: " . ($res !== false ? "SUCCESS ($res bytes)" : "FAILED") . "\n";

$testFile = __DIR__ . '/php-backend/test.php';
file_put_contents($testFile, "<?php header('Content-Type: application/json'); echo json_encode(['status' => 'OK', 'message' => 'PHP backend is running successfully!']); ?>");
echo "Updated test.php in php-backend.\n";
