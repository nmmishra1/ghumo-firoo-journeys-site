<?php
// index.php — Canonical Itineraries Domain REST Controller
// Ghumo Firoo Travels Enterprise Architecture
declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../../db.php';
require_once __DIR__ . '/../../auth_middleware.php';
require_once __DIR__ . '/ItineraryService.php';

try {
    $pdo = getDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

try {
    $user = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);
} catch (Throwable $t) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: ' . $t->getMessage(), 'code' => 401]);
    exit;
}

$service = new ItineraryService($pdo, $user);
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
$action = trim($_GET['action'] ?? '');

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true) ?? $_POST ?? [];

try {
    switch ($method) {
        case 'GET':
            if ($action === 'load') {
                $id = trim($_GET['id'] ?? '');
                $leadId = trim($_GET['lead_id'] ?? '');
                if (empty($id) && empty($leadId)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Either id or lead_id is required']);
                    exit;
                }
                echo json_encode($service->getItinerary($id, $leadId));
                exit;
            }

            if ($action === 'list_by_lead') {
                $leadId = trim($_GET['lead_id'] ?? '');
                if (empty($leadId)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Lead ID is required']);
                    exit;
                }
                echo json_encode($service->listByLead($leadId));
                exit;
            }

            if (!empty($_GET['id'])) {
                echo json_encode($service->getItinerary($_GET['id']));
                exit;
            }

            if (!empty($_GET['lead_id']) && $action !== 'list') {
                echo json_encode($service->getItinerary('', $_GET['lead_id']));
                exit;
            }

            // Default list all itineraries
            echo json_encode($service->listItineraries($_GET));
            exit;

        case 'POST':
            if ($action === 'confirm_leg') {
                $proposalId = intval($input['proposal_id'] ?? 0);
                $legType = trim(strtolower((string)($input['leg_type'] ?? '')));
                $legId = trim((string)($input['leg_id'] ?? ''));
                echo json_encode($service->confirmLeg($proposalId, $legType, $legId, $input));
                exit;
            }

            if ($action === 'update_status') {
                $id = $input['id'] ?? null;
                $leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : null;
                $status = trim($input['status'] ?? '');
                if (empty($id) && empty($leadId)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Missing itinerary id/lead_id parameter']);
                    exit;
                }
                echo json_encode($service->updateStatus($id, $leadId, $status));
                exit;
            }

            // Default save/upsert itinerary
            echo json_encode($service->saveItinerary($input));
            exit;

        case 'PUT':
        case 'PATCH':
            if ($action === 'confirm_leg' || isset($input['leg_type'])) {
                $proposalId = intval($input['proposal_id'] ?? 0);
                $legType = trim(strtolower((string)($input['leg_type'] ?? '')));
                $legId = trim((string)($input['leg_id'] ?? ''));
                echo json_encode($service->confirmLeg($proposalId, $legType, $legId, $input));
                exit;
            }

            $id = $input['id'] ?? null;
            $leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : null;
            $status = trim($input['status'] ?? '');
            if (empty($id) && empty($leadId)) {
                http_response_code(400);
                echo json_encode(['error' => 'Missing itinerary id/lead_id parameter']);
                exit;
            }
            echo json_encode($service->updateStatus($id, $leadId, $status));
            exit;

        default:
            http_response_code(405);
            echo json_encode(['error' => "Method $method not allowed"]);
            exit;
    }
} catch (InvalidArgumentException $iae) {
    http_response_code(400);
    echo json_encode(['error' => $iae->getMessage()]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
