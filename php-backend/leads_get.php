<?php
header('Content-Type: application/json');
require_once __DIR__ . '/auth_middleware.php';

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

$leadId = $_GET['id'] ?? '';
if (empty($leadId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Lead ID is required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM leads WHERE id = ?");
    $stmt->execute([$leadId]);
    $lead = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($lead) {
        $cleanDest = function($val) {
            if (empty($val)) return '';
            $v = trim($val);
            if ((str_starts_with($v, '[') && str_ends_with($v, ']')) || (str_starts_with($v, '{') && str_ends_with($v, '}'))) {
                $decoded = json_decode($v, true);
                if (is_array($decoded)) {
                    $parts = [];
                    foreach ($decoded as $item) {
                        if (is_array($item)) {
                            $c = trim($item['city'] ?? $item['destination'] ?? $item['name'] ?? '');
                            $s = trim($item['state'] ?? '');
                            $n = !empty($item['nights']) ? " ({$item['nights']}N)" : '';
                            if ($c && $s && count($decoded) === 1) $parts[] = "{$c}, {$s}{$n}";
                            elseif ($c) $parts[] = "{$c}{$n}";
                            elseif ($s) $parts[] = "{$s}{$n}";
                        } elseif (is_string($item) && !str_starts_with($item, '[') && !str_starts_with($item, '{')) {
                            $parts[] = trim($item);
                        }
                    }
                    return !empty($parts) ? implode(' • ', $parts) : $val;
                }
            }
            return $val;
        };
        if (!empty($lead['destinations'])) $lead['destinations'] = $cleanDest($lead['destinations']);
        if (!empty($lead['destination'])) $lead['destination'] = $cleanDest($lead['destination']);
        echo json_encode(['success' => true, 'lead' => $lead]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Lead not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
