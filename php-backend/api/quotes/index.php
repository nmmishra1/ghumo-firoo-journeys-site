<?php
// php-backend/api/quotes/index.php — Domain REST Controller for Quotes API
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
require_once __DIR__ . '/QuoteModel.php';
require_once __DIR__ . '/QuoteService.php';

$pdo = getDb();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$token = $_GET['token'] ?? '';

// Public routes (Share token viewing & client actions)
if (!empty($token) || $action === 'view' || $action === 'action') {
    $quoteService = new QuoteService($pdo);
    if ($method === 'GET') {
        $tokenStr = $token ?: ($_GET['t'] ?? '');
        $quote = $quoteService->getQuoteByToken($tokenStr);
        if ($quote) {
            echo json_encode(['success' => true, 'quote' => $quote]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Quote not found or invalid token']);
        }
        exit;
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $tokenStr = $input['token'] ?? $token;
        $act = $input['action'] ?? 'accept';
        $msg = $input['message'] ?? null;
        $res = $quoteService->submitAction($tokenStr, $act, $msg);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
        exit;
    }
}

// Authenticated CRM Routes
require_once __DIR__ . '/../../auth_middleware.php';
$user = authenticate();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);
checkRateLimit(120, 60);

$quoteService = new QuoteService($pdo);
$id = $_GET['id'] ?? '';

try {
    // -------------------------------------------------------------------------
    // ACTION: Share Quote
    // -------------------------------------------------------------------------
    if ($action === 'share' && $method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $quoteId = $input['quote_id'] ?? $id;
        $msg = $input['message'] ?? null;
        $recipient = $input['recipient_email'] ?? null;
        $res = $quoteService->shareQuote($quoteId, $msg, $recipient);
        if (!$res['success']) {
            http_response_code($res['status_code'] ?? 400);
        }
        echo json_encode($res);
        exit;
    }

    // -------------------------------------------------------------------------
    // RESTful Routes
    // -------------------------------------------------------------------------
    if ($method === 'GET') {
        if (!empty($id)) {
            $quote = $quoteService->getQuoteById($id);
            if ($quote) {
                echo json_encode(['success' => true, 'quote' => $quote]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Quote not found']);
            }
        } else {
            $leadId = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : 0;
            $quotes = $quoteService->listQuotes($leadId);
            echo json_encode(['success' => true, 'quotes' => $quotes]);
        }
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true) ?? [];
        $res = $quoteService->saveQuote($input, $user);
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
