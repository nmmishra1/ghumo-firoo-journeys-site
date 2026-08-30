<?php
header('Access-Control-Allow-Origin: https://ghumofiroo.com');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

try {
    $pdo = getDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database connection error']);
    exit;
}

try {
    $user = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);
} catch (Throwable $t) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Unauthorized: ' . $t->getMessage(), 'code' => 401]);
    exit;
}

try {
    $stmt = $pdo->query("
        SELECT 
            MIN(id) as id,
            customer_name as name,
            customer_email as email,
            customer_phone as mobile,
            customer_home_city as home_city,
            COUNT(*) as total_leads,
            SUM(CASE WHEN status = 'Booking Confirmed' THEN 1 ELSE 0 END) as total_bookings
        FROM leads 
        WHERE is_deleted = 0 OR is_deleted IS NULL
        GROUP BY COALESCE(NULLIF(customer_email, ''), customer_phone, customer_name)
        ORDER BY total_leads DESC
    ");
    $customers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(['success' => true, 'data' => $customers]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'An error occurred while fetching customers']);
}
