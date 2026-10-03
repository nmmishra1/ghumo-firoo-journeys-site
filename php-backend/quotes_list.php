<?php
// quotes_list.php — returns version history of all quotes associated with a lead (or all quotes globally).
// Bridges both `quotes` and `proposals` tables so proposals and quotes appear seamlessly in /crm/quotes.
// Requires a valid CRM agent JWT in the Authorization header.

header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
$profile = requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$leadId = isset($_GET['lead_id']) ? (int)$_GET['lead_id'] : 0;

// Ensure quotes table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `quotes` (
        `id` VARCHAR(36) PRIMARY KEY,
        `lead_id` INT NOT NULL,
        `itinerary_id` VARCHAR(100) NULL,
        `version_number` INT NOT NULL DEFAULT 1,
        `parent_quote_id` VARCHAR(36) NULL,
        `status` VARCHAR(50) DEFAULT 'Draft',
        `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        `package_name` VARCHAR(255) NOT NULL,
        `cost_breakdown` JSON NULL,
        `inclusions` JSON NULL,
        `exclusions` JSON NULL,
        `terms` TEXT NULL,
        `notes` TEXT NULL,
        `share_token` VARCHAR(64) NULL,
        `share_message` TEXT NULL,
        `shared_at` TIMESTAMP NULL,
        `viewed_at` TIMESTAMP NULL,
        `expires_at` TIMESTAMP NULL,
        `created_by` VARCHAR(255) NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX `idx_quotes_lead_id` (`lead_id`),
        INDEX `idx_quotes_version` (`lead_id`, `version_number`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
} catch (Exception $te) {}

try {
    $quotes = [];

    // 1. Fetch from quotes table
    try {
        if ($leadId > 0) {
            $stmt = $pdo->prepare("
                SELECT q.*, l.customer_name, l.customer_phone
                FROM quotes q
                JOIN leads l ON q.lead_id = l.id
                WHERE q.lead_id = ? 
                ORDER BY q.created_at DESC, q.version_number DESC
            ");
            $stmt->execute([$leadId]);
        } else {
            $stmt = $pdo->query("
                SELECT q.*, l.customer_name, l.customer_phone
                FROM quotes q
                JOIN leads l ON q.lead_id = l.id
                ORDER BY q.created_at DESC, q.version_number DESC
            ");
        }
        if ($stmt) {
            $quotes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } catch (Exception $qe) {
        $quotes = [];
    }

    // 2. Fetch from proposals table to bridge multi-option proposals from ItineraryBuilder
    try {
        $hasPropTable = (int)$pdo->query("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'proposals'")->fetchColumn() > 0;
        if ($hasPropTable) {
            $pSql = $leadId > 0 
                ? "SELECT p.*, l.customer_name, l.customer_phone FROM proposals p JOIN leads l ON p.lead_id = l.id WHERE p.lead_id = ? ORDER BY p.created_at DESC, p.option_number DESC"
                : "SELECT p.*, l.customer_name, l.customer_phone FROM proposals p JOIN leads l ON p.lead_id = l.id ORDER BY p.created_at DESC, p.option_number DESC";
            $pStmt = $pdo->prepare($pSql);
            $pStmt->execute($leadId > 0 ? [$leadId] : []);
            $proposals = $pStmt->fetchAll(PDO::FETCH_ASSOC);

            $existingIds = array_flip(array_column($quotes, 'id'));
            foreach ($proposals as $prop) {
                $propId = 'prop_' . $prop['id'];
                if (isset($existingIds[$propId])) continue;

                $itinData = !empty($prop['itinerary_data']) ? json_decode($prop['itinerary_data'], true) : [];
                $items = [];
                if (!empty($itinData['days']) && is_array($itinData['days'])) {
                    foreach ($itinData['days'] as $d) {
                        if (!empty($d['hotels'])) {
                            foreach ($d['hotels'] as $h) {
                                $items[] = [
                                    'type' => 'hotel',
                                    'name' => $h['name'] ?? 'Hotel Stay',
                                    'detail' => $h['room_type'] ?? 'Standard Room',
                                    'qty' => 1,
                                    'rate' => (float)($h['price'] ?? 3500),
                                    'total' => (float)($h['price'] ?? 3500)
                                ];
                            }
                        }
                    }
                }

                $quotes[] = [
                    'id' => $propId,
                    'lead_id' => (int)$prop['lead_id'],
                    'itinerary_id' => 'itin_' . $prop['lead_id'],
                    'version_number' => (int)($prop['option_number'] ?? 1),
                    'parent_quote_id' => null,
                    'status' => $prop['status'] ?? 'Draft',
                    'total_amount' => (float)($prop['total_price'] ?? 0),
                    'package_name' => $prop['title'] ?? ($prop['option_name'] ?? 'Custom Tour Proposal'),
                    'cost_breakdown' => [
                        'hotels' => (float)($prop['total_price'] ?? 0) * 0.5,
                        'transport' => (float)($prop['total_price'] ?? 0) * 0.3,
                        'sightseeing' => (float)($prop['total_price'] ?? 0) * 0.2,
                        'items' => $items,
                        'margin' => 15
                    ],
                    'inclusions' => [],
                    'exclusions' => [],
                    'customer_name' => $prop['customer_name'] ?? 'Valued Client',
                    'customer_phone' => $prop['customer_phone'] ?? '',
                    'created_at' => $prop['created_at'] ?? date('Y-m-d H:i:s')
                ];
            }
        }
    } catch (Exception $pe) {}

    // Cast total_amount to float and version_number to int
    foreach ($quotes as &$q) {
        $q['total_amount'] = (float)$q['total_amount'];
        $q['version_number'] = (int)($q['version_number'] ?? 1);
        if (is_string($q['cost_breakdown'])) {
            $q['cost_breakdown'] = json_decode($q['cost_breakdown'], true);
        }
        if (is_string($q['inclusions'])) {
            $q['inclusions'] = json_decode($q['inclusions'], true) ?: [];
        }
        if (is_string($q['exclusions'])) {
            $q['exclusions'] = json_decode($q['exclusions'], true) ?: [];
        }
    }

    echo json_encode(['success' => true, 'quotes' => $quotes]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database query failed: ' . $e->getMessage()]);
}
