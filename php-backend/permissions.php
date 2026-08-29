<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();

$permFile = __DIR__ . '/data/permissions_matrix.json';
$permDir = __DIR__ . '/data';
if (!is_dir($permDir)) {
    @mkdir($permDir, 0777, true);
}

// Default Granular Permission Matrix
$defaultMatrix = [
    'admin' => [
        'hotels' => true,
        'cabs' => true,
        'sightseeings' => true,
        'activities' => true,
        'visas' => true,
        'packages' => true,
        'blogs' => true,
        'reports' => true,
        'leads' => true,
        'audit_logs' => true,
        'bulk_upload' => true,
        'payments' => true
    ],
    'manager' => [
        'hotels' => true,
        'cabs' => true,
        'sightseeings' => true,
        'activities' => true,
        'visas' => true,
        'packages' => true,
        'blogs' => true,
        'reports' => true,
        'leads' => true,
        'audit_logs' => false,
        'bulk_upload' => true,
        'payments' => true
    ],
    'agent' => [
        'hotels' => true,
        'cabs' => true,
        'sightseeings' => true,
        'activities' => true,
        'visas' => true,
        'packages' => true,
        'blogs' => false,
        'reports' => false,
        'leads' => true,
        'audit_logs' => false,
        'bulk_upload' => false,
        'payments' => false
    ]
];

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $matrix = $defaultMatrix;
    if (file_exists($permFile)) {
        $saved = json_decode(file_get_contents($permFile), true);
        if ($saved && is_array($saved)) {
            $matrix = array_merge($defaultMatrix, $saved);
        }
    }
    echo json_encode(['success' => true, 'permissions' => $matrix]);
    exit;
}

if ($method === 'POST') {
    $profile = requireRole($user, $pdo, ['admin', 'manager']);
    if (!in_array(strtolower($profile['role'] ?? ''), ['admin', 'super admin'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Only Super Admin can save permissions matrix']);
        exit;
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $permissions = $input['permissions'] ?? null;

    if ($permissions && is_array($permissions)) {
        @file_put_contents($permFile, json_encode($permissions, JSON_PRETTY_PRINT));
        echo json_encode(['success' => true, 'message' => 'Granular module permissions saved successfully!']);
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid permissions payload']);
    }
    exit;
}
