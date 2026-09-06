<?php
// lead_sources.php — CRUD API for Dynamic Lead Sources in MySQL

header('Content-Type: application/json');
require_once __DIR__ . '/db.php';

try {
    $pdo = getDb();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        try {
            $stmt = $pdo->query("SELECT id, source_name, category, is_active, created_at FROM lead_sources ORDER BY is_active DESC, source_name ASC");
            $sources = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $eTable) {
            $sources = [];
        }

        if (empty($sources)) {
            // Auto-provision canonical sources requested
            $defaults = [
                'Trip Clap' => 'b2b',
                'Travecode' => 'b2b',
                'Hello_Visit' => 'b2b',
                'Referral' => 'offline',
                'Google Ads' => 'digital',
                'Facebook Ads' => 'digital',
                'Instagram' => 'digital',
                'Travel Lead' => 'aggregator',
                'Partner' => 'partnership',
                'B2B' => 'b2b',
                'WhatsApp' => 'direct',
                'LinkedIn' => 'social',
                'Website - Download Brochure' => 'website',
                'Website - Enquire Now Modal' => 'website',
                'Website - Contact Form' => 'website',
                'Website - Floating WhatsApp' => 'website',
                'Direct Customer' => 'direct',
                'Phone Call' => 'direct',
                'Walk-in' => 'offline'
            ];

            try {
                $pdo->exec("
                    CREATE TABLE IF NOT EXISTS `lead_sources` (
                        `id` INT AUTO_INCREMENT PRIMARY KEY,
                        `source_name` VARCHAR(100) NOT NULL UNIQUE,
                        `category` VARCHAR(50) NOT NULL DEFAULT 'digital',
                        `is_active` TINYINT(1) NOT NULL DEFAULT 1,
                        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                ");
                $ins = $pdo->prepare("INSERT INTO `lead_sources` (`source_name`, `category`, `is_active`) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE `is_active` = 1");
                foreach ($defaults as $src => $cat) {
                    $ins->execute([$src, $cat]);
                }
                $stmt = $pdo->query("SELECT id, source_name, category, is_active, created_at FROM lead_sources ORDER BY is_active DESC, source_name ASC");
                $sources = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } catch (Exception $eSeed) {
                // Fallback virtual response
                $id = 1;
                foreach ($defaults as $src => $cat) {
                    $sources[] = ['id' => $id++, 'source_name' => $src, 'category' => $cat, 'is_active' => 1];
                }
            }
        }

        echo json_encode(['success' => true, 'sources' => $sources]);
        exit;
    }

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $sourceName = trim($input['source_name'] ?? '');
        $category = trim($input['category'] ?? 'digital');

        if (empty($sourceName)) {
            http_response_code(400);
            echo json_encode(['error' => 'Source name is required']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO lead_sources (source_name, category, is_active) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE is_active = 1");
        $stmt->execute([$sourceName, $category]);

        echo json_encode(['success' => true, 'message' => 'Lead source added successfully']);
        exit;
    }

    if ($method === 'PUT') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE lead_sources SET is_active = ? WHERE id = ?");
            $stmt->execute([$isActive, $id]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

    if ($method === 'DELETE') {
        $input = json_decode(file_get_contents('php://input'), true);
        $id = (int)($input['id'] ?? 0);
        if ($id > 0) {
            $stmt = $pdo->prepare("DELETE FROM lead_sources WHERE id = ?");
            $stmt->execute([$id]);
        }
        echo json_encode(['success' => true]);
        exit;
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
