<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

$target = __DIR__ . '/php-backend';

echo "Checking: " . $target . "\n";

if (is_link($target)) {
    echo "Found 42-byte symlink! Deleting symlink...\n";
    if (unlink($target)) {
        echo "Symlink successfully deleted!\n";
    } else {
        echo "Failed to delete symlink via PHP.\n";
    }
}

if (!is_dir($target)) {
    echo "Creating real directory php-backend...\n";
    if (mkdir($target, 0755, true)) {
        echo "Directory php-backend successfully created!\n";
    } else {
        echo "Failed to create directory php-backend.\n";
    }
} else {
    echo "Directory php-backend is already a real directory!\n";
}

echo "Done.\n";
