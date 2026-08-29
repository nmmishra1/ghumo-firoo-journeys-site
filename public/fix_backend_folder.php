<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

$dir = __DIR__ . '/php-backend';
echo "Target dir: $dir\n";

if (!is_dir($dir)) {
    @mkdir($dir, 0755, true);
}

// Create a test file
$testFile = $dir . '/test.php';
$written = file_put_contents($testFile, "<?php echo 'PHP_BACKEND_WORKING_OK'; ?>");

echo "Test file write status: " . ($written !== false ? "SUCCESS ($written bytes)" : "FAILED") . "\n";

// List files in $dir
$files = is_dir($dir) ? scandir($dir) : [];
echo "Total files in php-backend: " . count($files) . "\n";
echo "Files list: " . implode(', ', array_slice($files, 0, 30)) . "\n";
