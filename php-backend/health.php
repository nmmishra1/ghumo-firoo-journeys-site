<?php
/**
 * Ghumo Firoo Journeys Enterprise Health & Performance Monitor
 * Endpoint: /php-backend/health.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$startTime = microtime(true);
require_once __DIR__ . '/db.php';
if (function_exists('loadEnvFile')) {
    loadEnvFile();
}

$dbStatus = 'UNKNOWN';
$dbLatencyMs = 0;
$dbError = null;

try {
    $t1 = microtime(true);
    $pdo = getDb();
    $stmt = $pdo->query('SELECT 1');
    $stmt->fetch();
    $dbLatencyMs = round((microtime(true) - $t1) * 1000, 2);
    $dbStatus = 'HEALTHY';
} catch (Exception $e) {
    $dbStatus = 'ERROR';
    $dbError = $e->getMessage();
}

$skipExternal = isset($_GET['fast']) || isset($_GET['skip_external']) || isset($_GET['quick']);
$web2ApiUrl = getenv('GEMINI_WEB2API_URL') ?: getenv('VITE_GEMINI_WEB2API_URL') ?: 'https://gemini-web2api-sxti.onrender.com/v1';
$web2ApiStatus = 'UNCHECKED';
$geminiApiKey = getenv('GEMINI_API_KEY') ?: getenv('VITE_GEMINI_API_KEY') ?: '';
$hasDirectKey = !empty($geminiApiKey);

if ($skipExternal) {
    $web2ApiStatus = 'SKIPPED_FAST_MODE';
} elseif (function_exists('curl_init')) {
    $web2ApiStatus = 'OFFLINE';
    $chPing = curl_init($web2ApiUrl);
    curl_setopt($chPing, CURLOPT_NOBODY, true);
    curl_setopt($chPing, CURLOPT_TIMEOUT, 1);
    curl_setopt($chPing, CURLOPT_CONNECTTIMEOUT, 1);
    curl_setopt($chPing, CURLOPT_SSL_VERIFYPEER, false);
    curl_exec($chPing);
    $pingCode = curl_getinfo($chPing, CURLINFO_HTTP_CODE);
    curl_close($chPing);
    if ($pingCode >= 200 && $pingCode < 500) {
        $web2ApiStatus = 'ACTIVE';
    }
}

$aiEngineMode = 'DATABASE_RAG_FALLBACK';
$aiStatus = 'READY';
if ($hasDirectKey) {
    $aiEngineMode = 'OFFICIAL_GOOGLE_GEMINI_DIRECT';
    $aiStatus = 'READY';
} elseif ($web2ApiStatus === 'ACTIVE') {
    $aiEngineMode = 'RENDER_WEB2API_PROXY';
    $aiStatus = 'READY';
} else {
    $aiEngineMode = 'INTELLIGENT_DB_RAG_FALLBACK';
    $aiStatus = 'READY (FALLBACK_ACTIVE)';
}

$opcacheEnabled = function_exists('opcache_get_status') && !empty(opcache_get_status(false)['opcache_enabled']);
$execTimeMs = round((microtime(true) - $startTime) * 1000, 2);

$response = [
    'status' => $dbStatus === 'HEALTHY' ? 'OK' : 'DEGRADED',
    'timestamp' => date('c'),
    'environment' => 'Shared Hosting / Enterprise PHP',
    'services' => [
        'database' => [
            'status' => $dbStatus,
            'latency_ms' => $dbLatencyMs,
            'driver' => 'PDO MySQL (Persistent Pool Enabled)',
            'error' => $dbError
        ],
        'opcache' => [
            'enabled' => $opcacheEnabled,
            'status' => $opcacheEnabled ? 'ACTIVE' : 'DISABLED_BY_HOST'
        ],
        'background_worker' => [
            'fastcgi_finish_request' => function_exists('fastcgi_finish_request'),
            'register_shutdown_function' => function_exists('register_shutdown_function')
        ],
        'ai_concierge_engine' => [
            'status' => $aiStatus,
            'active_engine_mode' => $aiEngineMode,
            'curl_supported' => function_exists('curl_init'),
            'gemini_api_key_set' => $hasDirectKey,
            'web_gemini_service' => $web2ApiStatus,
            'web_gemini_url' => $web2ApiUrl,
            'active_model' => getenv('GEMINI_MODEL') ?: ($hasDirectKey ? 'gemini-2.5-flash' : 'gemini-3.6-flash'),
            'rag_db_query_enabled' => true
        ]
    ],
    'system_metrics' => [
        'php_version' => PHP_VERSION,
        'memory_usage_mb' => round(memory_get_usage(true) / 1024 / 1024, 2),
        'memory_limit' => ini_get('memory_limit'),
        'health_check_exec_time_ms' => $execTimeMs
    ]
];

http_response_code(200);

echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
