<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

$dir1 = __DIR__ . '/php-backend';
$dir2 = dirname(__DIR__) . '/public_html/php-backend';

echo "--- INSPECTING PHP BACKEND DIRECTORIES ---\n";
echo "Dir 1 (site root /php-backend): " . $dir1 . "\n";
if (file_exists($dir1)) {
    echo "Dir 1 Exists. Is Dir: " . (is_dir($dir1) ? 'YES' : 'NO') . ", Is Link: " . (is_link($dir1) ? 'YES' : 'NO') . "\n";
    $files = scandir($dir1);
    echo "Dir 1 Files count: " . count($files) . "\n";
    echo "Sample files: " . implode(', ', array_slice($files, 0, 15)) . "\n";
} else {
    echo "Dir 1 DOES NOT EXIST.\n";
}

echo "\nDir 2 (public_html/php-backend): " . $dir2 . "\n";
if (file_exists($dir2)) {
    echo "Dir 2 Exists. Is Dir: " . (is_dir($dir2) ? 'YES' : 'NO') . ", Is Link: " . (is_link($dir2) ? 'YES' : 'NO') . "\n";
    $files2 = scandir($dir2);
    echo "Dir 2 Files count: " . count($files2) . "\n";
    echo "Sample files: " . implode(', ', array_slice($files2, 0, 15)) . "\n";
} else {
    echo "Dir 2 DOES NOT EXIST.\n";
}

echo "\n--- DOCUMENT ROOT INFO ---\n";
echo "DOCUMENT_ROOT: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'unknown') . "\n";
echo "SCRIPT_FILENAME: " . ($_SERVER['SCRIPT_FILENAME'] ?? 'unknown') . "\n";
