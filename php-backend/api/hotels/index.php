<?php
// php-backend/api/hotels/index.php — Domain REST Controller for Hotels API
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
require_once __DIR__ . '/HotelModel.php';
require_once __DIR__ . '/HotelService.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];

// GET requests are public; write operations require auth
$user = null;
if ($method !== 'GET') {
    $user = authenticate();
    requireRole($user, $pdo, ['admin', 'manager', 'agent']);
}

checkRateLimit(120, 60);

$id = $_GET['id'] ?? '';
$action = $_GET['action'] ?? '';

$hotelService = new HotelService($pdo);

try {
    // -------------------------------------------------------------------------
    // ACTION: Bootstrap hotel metadata
    // -------------------------------------------------------------------------
    if ($action === 'bootstrap') {
        $data = $hotelService->getBootstrapData();
        echo json_encode($data);
        exit;
    }

    // -------------------------------------------------------------------------
    // ACTION: Rates for a hotel
    // -------------------------------------------------------------------------
    if ($action === 'rates') {
        $hotelId = $id ?: ($_GET['hotel_id'] ?? '');
        if (empty($hotelId)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing hotel_id parameter']);
            exit;
        }
        $rates = $hotelService->getHotelRates($hotelId);
        echo json_encode(['success' => true, 'data' => $rates]);
        exit;
    }

    // -------------------------------------------------------------------------
    // RESTful Routes
    // -------------------------------------------------------------------------
    if ($method === 'GET') {
        if (!empty($id)) {
            $hotel = $hotelService->getHotelById($id);
            if ($hotel) {
                echo json_encode($hotel);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Hotel not found']);
            }
        } else {
            $result = $hotelService->getHotels($_GET);
            if ($result['is_paginated']) {
                echo json_encode([
                    'success' => true,
                    'data' => $result['data'],
                    'pagination' => $result['pagination']
                ]);
            } else {
                echo json_encode($result['data']);
            }
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $hotelService->createHotel($input, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } elseif ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $hotelService->updateHotel($id, $input, $action, $user);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
    } elseif ($method === 'DELETE') {
        $res = $hotelService->deleteHotel($id, $action, $user);
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
