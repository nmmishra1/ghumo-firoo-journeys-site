<?php
error_reporting(0);
ini_set('display_errors', 0);
// api.php — Wildcard CRUD entrypoint.

$table = $_GET['table'] ?? '';
if ($table === 'packages') {
    require_once __DIR__ . '/packages.php';
    exit;
} else if ($table === 'blogs') {
    require_once __DIR__ . '/blogs.php';
    exit;
} else if ($table === 'hotels') {
    require_once __DIR__ . '/hotels.php';
    exit;
}

require_once __DIR__ . '/mysql-crud.php';
