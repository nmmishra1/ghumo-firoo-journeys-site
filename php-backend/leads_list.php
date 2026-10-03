<?php
// leads_list.php — returns all active leads for Ghumo Firoo Journeys CRM.
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://ghumofiroo.com');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

try {
    $pdo = getDb();
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error']);
    exit;
}

try {
    $user = authenticate();
    $profile = requireRole($user, $pdo, ['admin', 'manager', 'agent', 'user']);
    $role = $profile['role'] ?? 'agent';
    $userId = $profile['id'] ?? null;
} catch (Throwable $t) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: ' . $t->getMessage(), 'code' => 401]);
    exit;
}

function formatStopsArrayHelper($stops) {
    $parts = [];
    $count = count($stops);
    foreach ($stops as $item) {
        if (is_array($item)) {
            $city = trim($item['city'] ?? $item['destination'] ?? $item['name'] ?? '');
            $state = trim($item['state'] ?? '');
            $nights = !empty($item['nights']) ? " ({$item['nights']}N)" : '';
            if (!empty($city) && !empty($state) && $count === 1) {
                $parts[] = "{$city}, {$state}{$nights}";
            } elseif (!empty($city)) {
                $parts[] = "{$city}{$nights}";
            } elseif (!empty($state)) {
                $parts[] = "{$state}{$nights}";
            }
        } elseif (is_string($item)) {
            $clean = trim($item);
            if (!empty($clean) && !str_starts_with($clean, '[') && !str_starts_with($clean, '{')) {
                $parts[] = $clean;
            }
        }
    }
    return !empty($parts) ? implode(' • ', $parts) : 'Curated Holiday';
}

function formatDestinationStops($val) {
    if (empty($val)) return '';
    if (is_array($val)) {
        return formatStopsArrayHelper($val);
    }
    $val = trim($val);
    if ((str_starts_with($val, '[') && str_ends_with($val, ']')) || (str_starts_with($val, '{') && str_ends_with($val, '}'))) {
        $decoded = json_decode($val, true);
        if (is_array($decoded)) {
            return formatStopsArrayHelper($decoded);
        }
    }
    return $val;
}

function enrichLeads(PDO $pdo, array $leads): array {
    return array_map(function($lead) use ($pdo) {
        if (!empty($lead['destinations'])) {
            $lead['destinations'] = formatDestinationStops($lead['destinations']);
        }
        if (!empty($lead['destination'])) {
            $lead['destination'] = formatDestinationStops($lead['destination']);
        }
        if (empty($lead['agent_name']) || $lead['agent_name'] === 'Unassigned') {
            if (!empty($lead['assigned_to'])) {
                try {
                    $aStmt = $pdo->prepare("SELECT full_name FROM profiles WHERE id = ? OR supabase_uid = ? LIMIT 1");
                    $aStmt->execute([$lead['assigned_to'], $lead['assigned_to']]);
                    $name = $aStmt->fetchColumn();
                    if (!$name) {
                        $uStmt = $pdo->prepare("SELECT full_name FROM users WHERE id = ? OR email = ? LIMIT 1");
                        $uStmt->execute([$lead['assigned_to'], $lead['assigned_to']]);
                        $name = $uStmt->fetchColumn();
                    }
                    $lead['agent_name'] = $name ?: 'Navin Mishra';
                } catch (Exception $ae) {
                    $lead['agent_name'] = 'Navin Mishra';
                }
            } else {
                $lead['agent_name'] = 'Navin Mishra';
            }
        }

        // Sanitize zero/invalid MySQL dates
        if (isset($lead['trip_start_date']) && ($lead['trip_start_date'] === '0000-00-00' || strpos($lead['trip_start_date'], '0000-00-00') === 0)) {
            $lead['trip_start_date'] = null;
        }
        if (isset($lead['trip_end_date']) && ($lead['trip_end_date'] === '0000-00-00' || strpos($lead['trip_end_date'], '0000-00-00') === 0)) {
            $lead['trip_end_date'] = null;
        }

        // Provide standard field aliases for all UI components
        if (empty($lead['email']) && !empty($lead['customer_email'])) {
            $lead['email'] = $lead['customer_email'];
        }
        if (empty($lead['contact_number']) && !empty($lead['customer_phone'])) {
            $lead['contact_number'] = $lead['customer_phone'];
        }

        return $lead;
    }, $leads);
}

try {
    if (($role === 'agent' || $role === 'user') && $userId) {
        $stmt = $pdo->prepare('SELECT * FROM leads WHERE (assigned_to = ? OR created_by = ? OR assigned_to IS NULL OR assigned_to = "") AND (is_deleted = 0 OR is_deleted IS NULL) ORDER BY id DESC');
        $stmt->execute([$userId, $userId]);
        $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($leads)) {
            $stmt = $pdo->query('SELECT * FROM leads WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY id DESC');
            $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    } else {
        $stmt = $pdo->query('SELECT * FROM leads WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY id DESC');
        $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    $enriched = enrichLeads($pdo, $leads ?: []);

    echo json_encode([
        'success' => true,
        'leads'   => $enriched
    ]);

} catch (Throwable $e) {
    try {
        $stmt = $pdo->query('SELECT * FROM leads WHERE (is_deleted = 0 OR is_deleted IS NULL) ORDER BY id DESC');
        $leads = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode([
            'success' => true,
            'leads'   => enrichLeads($pdo, $leads ?: [])
        ]);
    } catch (Exception $dbErr) {
        echo json_encode([
            'success' => false,
            'leads'   => [],
            'error'   => $e->getMessage()
        ]);
    }
}
