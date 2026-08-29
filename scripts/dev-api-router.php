<?php
// Development-only router for Vite's /api proxy. Never deploy this file.
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';

if ($path === '/api/packages') {
    require __DIR__ . '/../public/api/packages.php';
    exit;
}

if (preg_match('#^/api/packages/([A-Za-z0-9-]+)$#', $path, $matches)) {
    $_GET['id'] = $matches[1];
    require __DIR__ . '/../public/api/packages.php';
    exit;
}

http_response_code(404);
header('Content-Type: application/json');
echo json_encode(['error' => 'Development API route not found']);
