<?php
// php-backend/api/leads/index.php — Domain REST Controller for Leads API
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
require_once __DIR__ . '/LeadModel.php';
require_once __DIR__ . '/LeadService.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$leadService = new LeadService($pdo);

// -----------------------------------------------------------------------------
// Public Endpoint: Public visitor inquiry capture (leads_create_public.php)
// -----------------------------------------------------------------------------
if ($action === 'public_create' || isset($_GET['public'])) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
        $ip = trim(end($ipList));
    }

    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $res = $leadService->createPublicLead($input, $ip);
    if (!$res['success']) {
        http_response_code($res['status_code'] ?? 400);
    }
    echo json_encode($res);
    exit;
}

// -----------------------------------------------------------------------------
// Authenticated CRM Endpoints
// -----------------------------------------------------------------------------
require_once __DIR__ . '/../../auth_middleware.php';
$user = authenticate();
requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);
checkRateLimit(120, 60);

try {
    if ($method === 'GET') {
        if ($id > 0) {
            $lead = $leadService->getLeadById($id);
            if ($lead) {
                echo json_encode(['success' => true, 'lead' => $lead]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Lead not found']);
            }
        } else {
            $leads = $leadService->listLeads($_GET);
            echo json_encode(['success' => true, 'leads' => $leads]);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $leadIdInput = (int)($input['id'] ?? 0);

        if ($action === 'update' || $leadIdInput > 0) {
            $targetId = $leadIdInput ?: $id;
            $res = $leadService->updateLead($targetId, $input, $user);
        } elseif ($action === 'delete') {
            $targetId = $leadIdInput ?: $id;
            $res = $leadService->deleteLead($targetId, $user);
        } else {
            $res = $leadService->createLead($input, $user);
        }

        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } elseif ($method === 'PUT') {
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing or invalid lead id']);
            exit;
        }
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $leadService->updateLead($id, $input, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } elseif ($method === 'DELETE') {
        if ($id <= 0) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing or invalid lead id']);
            exit;
        }
        $res = $leadService->deleteLead($id, $user);
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
    echo json_encode(['error' => $e->getMessage(), 'file' => $e->getFile(), 'line' => $e->getLine()]);
}
