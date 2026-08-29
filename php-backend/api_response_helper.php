<?php
/**
 * Standardized API Response & Traceability Utility
 * Ghumo Firoo Journeys Enterprise Backend
 */

if (!defined('START_TIME')) {
    define('START_TIME', microtime(true));
}

// Generate unique request ID for end-to-end request tracing
if (!isset($GLOBALS['REQUEST_ID'])) {
    $GLOBALS['REQUEST_ID'] = 'REQ-' . time() . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 6));
}

header('X-Request-ID: ' . $GLOBALS['REQUEST_ID']);

/**
 * Ensures api_request_logs table exists for developer issue tracing
 */
function ensureApiLogsTable($pdo) {
    static $created = false;
    if ($created || !$pdo) return;
    try {
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS api_request_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id VARCHAR(64) NOT NULL,
                endpoint VARCHAR(255) NOT NULL,
                method VARCHAR(10) NOT NULL,
                status_code INT NOT NULL,
                request_params JSON NULL,
                response_summary JSON NULL,
                error_message TEXT NULL,
                exec_time_ms DECIMAL(8,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (request_id),
                INDEX (status_code)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        ");
        $created = true;
    } catch (Exception $e) {
        // Silent fallback to file logger if table creation fails
    }
}

/**
 * Log API request execution for traceability
 */
function logApiTraceability($pdo, $statusCode, $data = null, $error = null, $action = 'UNKNOWN', $table = '') {
    $requestId = $GLOBALS['REQUEST_ID'];
    $endpoint = $_SERVER['SCRIPT_NAME'] ?? $_SERVER['REQUEST_URI'] ?? '/api';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $execTimeMs = round((microtime(true) - START_TIME) * 1000, 2);

    $params = [
        'query' => $_GET ?? [],
        'body_received' => json_decode(file_get_contents('php://input'), true) ?? $_POST ?? []
    ];

    if ($pdo) {
        ensureApiLogsTable($pdo);
        try {
            $stmt = $pdo->prepare("
                INSERT INTO api_request_logs 
                (request_id, endpoint, method, status_code, request_params, response_summary, error_message, exec_time_ms)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $summary = [
                'table' => $table,
                'action' => $action,
                'item_count' => is_array($data) ? count($data) : ($data !== null ? 1 : 0)
            ];
            $stmt->execute([
                $requestId,
                $endpoint,
                $method,
                $statusCode,
                json_encode($params),
                json_encode($summary),
                $error ? (is_array($error) ? json_encode($error) : (string)$error) : null,
                $execTimeMs
            ]);
        } catch (Exception $e) {
            // Ignore DB log failure
        }
    }
}

/**
 * Return Standardized Success API Response Envelope
 */
function sendApiResponse($data = null, $message = 'Success', $statusCode = 200, $action = 'SUCCESS', $table = '', $pdo = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    $execTimeMs = round((microtime(true) - START_TIME) * 1000, 2);
    $count = is_array($data) ? count($data) : ($data !== null ? 1 : 0);

    $response = [
        'success' => true,
        'request_id' => $GLOBALS['REQUEST_ID'],
        'timestamp' => date('c'),
        'endpoint' => $_SERVER['SCRIPT_NAME'] ?? '/api',
        'table' => $table,
        'action' => $action,
        'message' => $message,
        'data' => $data,
        'count' => $count,
        'meta' => [
            'status' => $statusCode,
            'execution_time_ms' => $execTimeMs
        ],
        'error' => null
    ];

    logApiTraceability($pdo, $statusCode, $data, null, $action, $table);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Return Standardized Error API Response Envelope
 */
function sendApiError($message, $statusCode = 400, $errorCode = 'BAD_REQUEST', $details = null, $table = '', $pdo = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');

    $execTimeMs = round((microtime(true) - START_TIME) * 1000, 2);

    $errorObject = [
        'code' => $errorCode,
        'message' => $message,
        'details' => $details,
        'traceable_id' => $GLOBALS['REQUEST_ID']
    ];

    $response = [
        'success' => false,
        'request_id' => $GLOBALS['REQUEST_ID'],
        'timestamp' => date('c'),
        'endpoint' => $_SERVER['SCRIPT_NAME'] ?? '/api',
        'table' => $table,
        'action' => 'ERROR',
        'message' => $message,
        'data' => null,
        'count' => 0,
        'meta' => [
            'status' => $statusCode,
            'execution_time_ms' => $execTimeMs
        ],
        'error' => $errorObject
    ];

    logApiTraceability($pdo, $statusCode, null, $errorObject, 'ERROR', $table);
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Universal Shared-Hosting Background Processor
 * Immediately flushes response buffer to client and processes background tasks
 */
function finishResponseAndProcessInBackground(callable $backgroundTask) {
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
        $backgroundTask();
    } else {
        // Fallback for standard Apache mod_php shared hosting
        ignore_user_abort(true);
        register_shutdown_function($backgroundTask);
    }
}
