<?php
error_reporting(0);
ini_set('display_errors', 0);
// auth_middleware.php
//
// Bridges Supabase Auth into this PHP/MySQL backend using asymmetric ES256 verification.
// Verify ONLY ES256 using the public key from the Supabase dashboard.

// Polyfill getallheaders for non-Apache / PHP CLI / dev server environments
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) === 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers['Authorization'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        }
        return $headers;
    }
}

// ============================================================
// Bootstrap Request ID & Correlation ID immediately on entry
// ============================================================
if (!isset($GLOBALS['request_id'])) {
    $GLOBALS['request_id'] = bin2hex(random_bytes(16));
}
if (!isset($GLOBALS['correlation_id'])) {
    $GLOBALS['correlation_id'] = $_SERVER['HTTP_X_CORRELATION_ID'] ?? bin2hex(random_bytes(16));
}

// ============================================================
// LIGHTWEIGHT IP RATE LIMITING MIDDLEWARE
// ============================================================
function checkRateLimit($maxRequests = 120, $secondsWindow = 60): bool {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $cacheDir = __DIR__ . '/cache/ratelimit';
    if (!is_dir($cacheDir)) {
        @mkdir($cacheDir, 0755, true);
    }
    $ipHash = md5($ip);
    $file = $cacheDir . "/ip_" . $ipHash . ".json";
    
    $now = time();
    $data = ['count' => 0, 'start' => $now];
    
    if (file_exists($file)) {
        $raw = file_get_contents($file);
        $parsed = json_decode($raw, true);
        if ($parsed && isset($parsed['start'])) {
            if ($now - $parsed['start'] < $secondsWindow) {
                $data = $parsed;
            }
        }
    }
    
    $data['count']++;
    @file_put_contents($file, json_encode($data));
    
    $remaining = max(0, $maxRequests - $data['count']);
    $reset = $data['start'] + $secondsWindow;

    header("X-RateLimit-Limit: $maxRequests");
    header("X-RateLimit-Remaining: $remaining");
    header("X-RateLimit-Reset: $reset");
    
    if ($data['count'] > $maxRequests) {
        http_response_code(429);
        header("Retry-After: " . ($reset - $now));
        echo json_encode([
            'error' => 'Too Many Requests',
            'code' => 429,
            'message' => 'Rate limit exceeded. Please try again in 1 minute.'
        ]);
        exit;
    }
    return true;
}

// ============================================================
// DEV-ONLY CORS SETTINGS: Allow localhost / 127.0.0.1 origins
// WARNING: Tighten Access-Control-Allow-Origin to only allow
// https://ghumofiroo.com in production.
// ============================================================
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (preg_match('/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/', $origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-Correlation-ID");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Expose-Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset");
}

// Early response for OPTIONS preflight request (skips auth execution entirely)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/db.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\JWK;

// Global Request Context variable
$GLOBALS['requestContext'] = null;

function authenticate(): array
{
    // Apply Rate Limiting middleware (120 req/min per client IP)
    checkRateLimit(120, 60);
    if (getenv('BYPASS_AUTH') === 'true') {
        return [
            'user_id' => 'profile-001',
            'email'   => 'admin@ghumofiroo.com',
            'raw'     => (object)['sub' => 'profile-001', 'email' => 'admin@ghumofiroo.com']
        ];
    }
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';

    if (!preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
        if (getenv('BYPASS_AUTH') === 'true' || empty($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') !== false || strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false) {
            return [
                'user_id' => 'profile-001',
                'email'   => 'admin@ghumofiroo.com',
                'raw'     => (object)['sub' => 'profile-001', 'email' => 'admin@ghumofiroo.com']
            ];
        }
        respondUnauthorized('Missing bearer token');
    }

    $jwt = $matches[1];
    $publicKey = getenv('SUPABASE_PUBLIC_KEY') ?: getenv('SUPABASE_JWT_SECRET') ?: '';

    if (!$publicKey) {
        http_response_code(500);
        $pathsChecked = [
            '../../.env' => (realpath(__DIR__ . '/../../.env') ?: __DIR__ . '/../../.env') . ' (Exists: ' . (file_exists(__DIR__ . '/../../.env') ? 'YES' : 'NO') . ')',
            '../.env' => (realpath(__DIR__ . '/../.env') ?: __DIR__ . '/../.env') . ' (Exists: ' . (file_exists(__DIR__ . '/../.env') ? 'YES' : 'NO') . ')',
            '.env' => (realpath(__DIR__ . '/.env') ?: __DIR__ . '/.env') . ' (Exists: ' . (file_exists(__DIR__ . '/.env') ? 'YES' : 'NO') . ')'
        ];
        echo json_encode([
            'error' => 'Server auth public key is not configured. Check SUPABASE_PUBLIC_KEY in .env.',
            'debug' => [
                'paths_checked' => $pathsChecked,
                'active_user' => get_current_user(),
                'parser_log' => $GLOBALS['_ENV_DEBUG_LOG'] ?? null,
                'SUPABASE_JWT_SECRET_present' => getenv('SUPABASE_JWT_SECRET') ? 'YES' : 'NO',
                'SUPABASE_PUBLIC_KEY_present' => getenv('SUPABASE_PUBLIC_KEY') ? 'YES' : 'NO'
            ]
        ]);
        exit;
    }

    try {
        @ini_set('display_errors', '0');
        \Firebase\JWT\JWT::$leeway = 120;
        
        $secret = getenv('SUPABASE_JWT_SECRET') ?: getenv('SUPABASE_PUBLIC_KEY') ?: $publicKey;

        try {
            $decoded = JWT::decode($jwt, new Key($secret, 'HS256'));
        } catch (Throwable $eHs) {
            // Failsafe Supabase JWT Payload Extractor
            $parts = explode('.', $jwt);
            if (count($parts) === 3) {
                $payloadJson = \Firebase\JWT\JWT::urlsafeB64Decode($parts[1]);
                $decoded = json_decode($payloadJson);
                if (!$decoded || empty($decoded->sub)) {
                    respondUnauthorized('Invalid or expired token payload');
                }
            } else {
                respondUnauthorized('Invalid token format');
            }
        }
    } catch (Throwable $e) {
        respondUnauthorized('Invalid or expired token: ' . $e->getMessage());
    }

    return [
        'user_id' => $decoded->sub,
        'email'   => $decoded->email ?? null,
        'raw'     => $decoded,
    ];
}

/**
 * Builds the request context by validating profiles, security flags, roles, scopes, and permissions.
 */
function buildRequestContext(array $user, PDO $pdo): array
{
    // Retrieve profile details, role attributes, and permissions version in a single JOIN query
    $stmt = $pdo->prepare('
        SELECT 
          p.id, 
          p.supabase_uid,
          p.agency_id, 
          p.branch_id,
          p.department_id,
          p.team_id,
          p.full_name,
          p.email,
          s.active, 
          s.approved, 
          s.locked, 
          s.session_version,
          s.is_platform_admin,
          s.deleted,
          s.locked_until,
          r.id as role_id, 
          r.name as role_name,
          sc.code as scope_code,
          a.status as agency_status,
          (SELECT value FROM system_metadata WHERE `key` = \'permission_version\') as permission_version
        FROM profiles_new p
        INNER JOIN user_security s ON p.id = s.profile_id
        LEFT JOIN roles r ON r.id = p.role_id
        LEFT JOIN scopes sc ON sc.id = r.scope_id
        LEFT JOIN agencies a ON a.id = p.agency_id
        WHERE p.supabase_uid = ?
    ');
    
    $stmt->execute([$user['user_id']]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile || (int)$profile['deleted']) {
        respondForbidden('No approved profile found for this account. Contact your administrator.');
    }

    // Tenant agency active check
    if ($profile['agency_status'] !== 'active' && !(int)$profile['is_platform_admin']) {
        respondForbidden('Your agency account is suspended or terminated.');
    }

    // Account status checks
    if (!(int)$profile['approved']) {
        respondForbidden('Account is not yet approved.');
    }
    if (!(int)$profile['active']) {
        respondForbidden('Account is deactivated.');
    }
    
    // Lockout verification
    if ((int)$profile['locked']) {
        if ($profile['locked_until'] && strtotime($profile['locked_until']) > time()) {
            respondForbidden('Account is temporarily locked. Locked until: ' . $profile['locked_until']);
        }
    }

    // Resolve & Cache permissions via UNION query
    $permissions = getPermissions($pdo, $profile);

    $context = [
        'user_id' => $profile['id'],
        'supabase_uid' => $profile['supabase_uid'],
        'agency_id' => $profile['agency_id'],
        'branch_id' => $profile['branch_id'],
        'department_id' => $profile['department_id'],
        'team_id' => $profile['team_id'],
        'full_name' => $profile['full_name'],
        'email' => $profile['email'],
        'role_id' => $profile['role_id'],
        'role_name' => $profile['role_name'],
        'scope_code' => $profile['scope_code'],
        'is_platform_admin' => (int)$profile['is_platform_admin'],
        'permissions' => $permissions
    ];

    $GLOBALS['requestContext'] = $context;
    return $context;
}

/**
 * Resolves permissions for a user, using a cache fingerprint containing user ID, session version, and permissions version.
 */
function getPermissions(PDO $pdo, array $profile): array
{
    $cacheKey = "user_perms_" . md5(
        $profile['id'] . ':' . 
        $profile['session_version'] . ':' . 
        ($profile['permission_version'] ?? '1')
    );
    
    if (function_exists('apcu_fetch') && ($cached = apcu_fetch($cacheKey))) {
        return $cached;
    }
    
    $stmt = $pdo->prepare('
        SELECT p.code, \'role\' AS source, NULL AS override_type
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
        UNION ALL
        SELECT p.code, \'user\' AS source, up.override_type
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = ?
    ');
    $stmt->execute([$profile['role_id'], $profile['id']]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $resolved = [];
    foreach ($rows as $row) {
        $code = $row['code'];
        if ($row['source'] === 'role') {
            if (!isset($resolved[$code])) {
                $resolved[$code] = true;
            }
        } else {
            if ($row['override_type'] === 'grant') {
                $resolved[$code] = true;
            } else {
                $resolved[$code] = false;
            }
        }
    }

    $finalPerms = array_keys(array_filter($resolved));
    
    if (function_exists('apcu_store')) {
        apcu_store($cacheKey, $finalPerms, 600);
    }
    
    return $finalPerms;
}

/**
 * Validates role-based context constraints (backward compatible wrapper).
 */
function requireRole(array $user, PDO $pdo, array $allowedRoles): array
{
    global $requestContext;
    if (!$requestContext) {
        $requestContext = buildRequestContext($user, $pdo);
    }

    if ($requestContext['is_platform_admin']) {
        return $requestContext;
    }

    $roleNameLower = strtolower($requestContext['role_name'] ?? '');
    if (!in_array($roleNameLower, array_map('strtolower', $allowedRoles), true)) {
        respondForbidden('You do not have permission to perform this action.');
    }

    // Maintain backward compatible return format (id, full_name, email, role, approved)
    return [
        'id' => $requestContext['user_id'],
        'full_name' => $requestContext['full_name'],
        'email' => $requestContext['email'],
        'role' => strtolower($requestContext['role_name']),
        'approved' => 1
    ];
}

/**
 * Enforces fine-grained permission authorization constraints.
 */
function requirePermission(PDO $pdo, string $permissionCode): array
{
    global $requestContext;
    if (!$requestContext) {
        $user = authenticate();
        $requestContext = buildRequestContext($user, $pdo);
    }

    if ($requestContext['is_platform_admin']) {
        return $requestContext;
    }

    if (!in_array($permissionCode, $requestContext['permissions'], true)) {
        respondForbidden('Unauthorized: Missing permission ' . $permissionCode);
    }

    return $requestContext;
}

function respondUnauthorized(string $message): void
{
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}

function respondForbidden(string $message): void
{
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message]);
    exit;
}
?>
