<?php
// php-backend/api/cabs/index.php — Domain REST Controller for Cabs API
// Ghumo Firoo Travels Enterprise Architecture

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../auth_middleware.php';
require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/CabModel.php';
require_once __DIR__ . '/CabService.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// GET requests are public; write operations require auth
$user = null;
if ($method !== 'GET') {
    $user = authenticate();
    requireRole($user, $pdo, ['admin', 'manager', 'agent']);
}

checkRateLimit(120, 60);

$action = $_GET['action'] ?? '';
$cabService = new CabService($pdo);

try {
    // -------------------------------------------------------------------------
    // ACTION: Route search
    // -------------------------------------------------------------------------
    if ($action === 'search_routes' || isset($_GET['destination'])) {
        $dest = $_GET['destination'] ?? '';
        $routes = $cabService->searchRoutes($dest);
        echo json_encode(['success' => true, 'routes' => $routes]);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION: Contract Rates
    // -------------------------------------------------------------------------
    if ($action === 'contract_rates' || isset($_GET['contract_id'])) {
        $contractId = $_GET['contract_id'] ?? '';
        if (empty($contractId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing contract_id parameter']);
            exit;
        }
        $rates = $cabService->getContractRates($contractId);
        echo json_encode(['success' => true, 'rates' => $rates]);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION: Bootstrap Cab Contracting Data
    // -------------------------------------------------------------------------
    if ($action === 'bootstrap') {
        $data = $cabService->getBootstrapData();
        echo json_encode($data);
        exit;
    }

    // Default: List routes or sub-tables
    $table = $_GET['table'] ?? 'cab_routes';
    $data = $cabService->querySubTable($table, $_GET);
    echo json_encode($data);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
}
