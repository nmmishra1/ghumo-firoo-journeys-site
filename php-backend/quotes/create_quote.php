<?php
// create_quote.php — inserts a quote log/draft into the quotes table
// POST /php-backend/quotes/create_quote.php

header('Content-Type: application/json');
require_once __DIR__ . '/../auth_middleware.php';

// 1. Authenticate user (Supabase JWT verification)
$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

// 2. Parse inputs
$input = json_decode(file_get_contents('php://input'), true) ?? [];
$itineraryId = isset($input['itinerary_id']) ? (int)$input['itinerary_id'] : 0;
$leadId = isset($input['lead_id']) ? (int)$input['lead_id'] : 0;
$version = isset($input['version']) ? (int)$input['version'] : 1;
$pdfPath = $input['pdf_path'] ?? null;
$sentToEmail = $input['sent_to_email'] ?? null;
$status = $input['status'] ?? 'draft';

if ($itineraryId <= 0 || $leadId <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid itinerary_id and lead_id are required']);
    exit;
}

// Allowed statuses matching enum
$allowedStatuses = ['draft', 'sent', 'viewed', 'accepted', 'rejected'];
if (!in_array($status, $allowedStatuses)) {
    $status = 'draft';
}

$createdBy = $user['sub'] ?? null; // UUID from Supabase auth token

try {
    $stmt = $pdo->prepare(
        'INSERT INTO quotes (itinerary_id, lead_id, version, pdf_path, sent_to_email, sent_at, status, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    
    $sentAt = ($status === 'sent') ? date('Y-m-d H:i:s') : null;
    
    $stmt->execute([
        $itineraryId,
        $leadId,
        $version,
        $pdfPath,
        $sentToEmail,
        $sentAt,
        $status,
        $createdBy
    ]);
    
    $newId = $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $newId]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database operation failed', 'details' => $e->getMessage()]);
}
