<?php
// php-backend/api/packages/index.php — Domain REST Controller for Packages API
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

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/PackageModel.php';
require_once __DIR__ . '/PackageService.php';

$action = $_GET['action'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

// Authentication checks for write/mutation routes
$user = null;
if ($action === 'save_variant' || $action === 'update_variant' || $action === 'delete_variant' || $action === 'clone_to_itinerary' || ($method !== 'GET' && !$action)) {
    require_once __DIR__ . '/../../auth_middleware.php';
    $user = authenticate();
    $pdo = getDb();
    requireRole($user, $pdo, ['admin', 'manager', 'agent']);
} else {
    $pdo = getDb();
}

$packageService = new PackageService($pdo);

try {
    // -------------------------------------------------------------------------
    // ACTION: Save / Update Variant
    // -------------------------------------------------------------------------
    if ($action === 'save_variant' || $action === 'update_variant') {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $packageService->saveVariant($data, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION: Delete Variant
    // -------------------------------------------------------------------------
    if ($action === 'delete_variant') {
        $variantId = $_GET['id'] ?? null;
        if (!$variantId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing variant id']);
            exit;
        }
        $res = $packageService->deleteVariant($variantId);
        echo json_encode($res);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION: Clone Package Template to Itinerary
    // -------------------------------------------------------------------------
    if ($action === 'clone_to_itinerary') {
        $pkgId = $_GET['package_id'] ?? $_GET['id'] ?? null;
        if (!$pkgId) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing package_id or id parameter']);
            exit;
        }
        $payload = $packageService->cloneToItinerary($pkgId);
        if (!$payload) {
            http_response_code(404);
            echo json_encode(['error' => 'Package not found']);
            exit;
        }
        echo json_encode($payload);
        exit;
    }

    // -------------------------------------------------------------------------
    // RESTful Routes
    // -------------------------------------------------------------------------
    $slug = isset($_GET['slug']) ? trim($_GET['slug']) : null;
    $id = isset($_GET['id']) ? trim($_GET['id']) : (isset($_GET['table']) && isset($_GET['id']) ? $_GET['id'] : null);

    if ($method === 'GET') {
        if ($slug !== null || $id !== null) {
            $identifier = $slug !== null ? $slug : $id;
            $pkg = $packageService->getPackageByIdOrSlug($identifier);
            if ($pkg) {
                echo json_encode($pkg);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Package not found']);
            }
        } else {
            $includeVariants = isset($_GET['include_variants']) && $_GET['include_variants'] == '1';
            $packages = $packageService->listPackages($includeVariants);
            echo json_encode($packages);
        }
    } elseif ($method === 'POST') {
        $p = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $packageService->createPackage($p, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } elseif ($method === 'PUT') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing package id']);
            exit;
        }
        $p = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $packageService->updatePackage($id, $p, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } elseif ($method === 'DELETE') {
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing package id']);
            exit;
        }
        $res = $packageService->deletePackage($id, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server Error: ' . $e->getMessage()]);
}
