<?php
// php-backend/migrations/20260907_add_proposal_advance_required.php
//
// Adds the single column needed to gate voucher/invoice generation on
// advance payment received: how much advance is required before this
// specific accepted proposal's documents can be generated.
//
// Hotel confirmation numbers and cab driver details are stored inline in
// proposals.itinerary_data (JSON) instead of new columns — see
// itinerary_confirm_leg.php — so no other schema change is needed.
require_once __DIR__ . '/../db.php';
$pdo = getDb();

try {
    $exists = $pdo->query("SHOW COLUMNS FROM proposals LIKE 'advance_required'")->fetch();
    if (!$exists) {
        $pdo->exec("ALTER TABLE proposals ADD COLUMN advance_required DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER price_per_person");
    }
    echo json_encode(['status' => 'success', 'message' => 'proposals.advance_required column created or already present.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
