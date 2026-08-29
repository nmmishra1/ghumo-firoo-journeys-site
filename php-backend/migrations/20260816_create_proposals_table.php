<?php
// php-backend/migrations/20260816_create_proposals_table.php
require_once __DIR__ . '/../db.php';

try {
    $sql = "CREATE TABLE IF NOT EXISTS proposals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NOT NULL,
        option_number INT NOT NULL DEFAULT 1,
        option_name VARCHAR(255) NOT NULL DEFAULT 'Option 1',
        title VARCHAR(255) NOT NULL DEFAULT 'Trip Itinerary Proposal',
        total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        price_per_person DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        currency VARCHAR(10) NOT NULL DEFAULT 'INR',
        status ENUM('Draft', 'Sent', 'Accepted', 'Expired', 'Archived') NOT NULL DEFAULT 'Sent',
        expiry_date DATE NULL,
        payment_schedule JSON NULL,
        itinerary_data JSON NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_lead_id (lead_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

    $pdo->exec($sql);
    echo json_encode(['status' => 'success', 'message' => 'Proposals table created or verified successfully.']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
