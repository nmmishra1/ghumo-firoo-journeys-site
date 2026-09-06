<?php
// php-backend/itinerary_confirm_leg.php
//
// Allows ops staff to record manual confirmation numbers, driver/cab assignments,
// and activity/sightseeing ticket codes onto the accepted proposal's itinerary_data JSON.
//
// PUT /php-backend/itinerary_confirm_leg.php
// Body: {
//   proposal_id: number,
//   leg_type: 'hotel' | 'transport' | 'activity' | 'sightseeing',
//   leg_id: string,                 // id field inside itinerary_data or block.id
//   confirmation_number?: string,    // hotel or activity confirmation/ticket #
//   hotel_contact?: string,         // hotel contact person/phone
//   driver_name?: string,            // transport legs
//   driver_phone?: string,           // transport legs
//   vehicle_number?: string,         // transport legs
//   operator_name?: string,          // activity operator / vendor
//   guide_contact?: string,          // activity guide contact
//   slot_time?: string               // activity slot timing
// }

header('Content-Type: application/json; charset=UTF-8');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/auth_middleware.php';

// IP rate limit: 120 requests per minute
checkRateLimit(120, 60);

$user = authenticate();
$pdo = getDb();
requireRole($user, $pdo, ['admin', 'manager', 'agent']);

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'PUT') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$proposalId = intval($input['proposal_id'] ?? 0);
$legType = trim(strtolower((string)($input['leg_type'] ?? '')));
$legId = trim((string)($input['leg_id'] ?? ''));

$validTypes = ['hotel', 'transport', 'activity', 'sightseeing'];
if ($proposalId <= 0 || !in_array($legType, $validTypes, true) || $legId === '') {
    http_response_code(400);
    echo json_encode(['error' => 'proposal_id, valid leg_type (hotel, transport, activity, sightseeing), and leg_id are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, lead_id, itinerary_data FROM proposals WHERE id = ?");
    $stmt->execute([$proposalId]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(404);
        echo json_encode(['error' => 'Proposal not found']);
        exit;
    }

    $leadId = (int)$row['lead_id'];
    $itineraryData = is_string($row['itinerary_data']) ? json_decode($row['itinerary_data'], true) : ($row['itinerary_data'] ?? []);
    if (!is_array($itineraryData)) {
        $itineraryData = [];
    }

    $found = false;
    $currentUserIdentifier = $user['email'] ?? ($user['user_id'] ?? ($user['sub'] ?? 'agent'));
    $nowIso = date('c');

    // 1. Check flat collections (hotels, transport, activities, sightseeings)
    $collectionKey = match($legType) {
        'hotel' => 'hotels',
        'transport' => 'transport',
        'activity', 'sightseeing' => 'activities',
        default => 'hotels'
    };

    if (isset($itineraryData[$collectionKey]) && is_array($itineraryData[$collectionKey])) {
        foreach ($itineraryData[$collectionKey] as &$leg) {
            if ((string)($leg['id'] ?? '') === $legId) {
                $found = true;
                if ($legType === 'hotel') {
                    if (isset($input['confirmation_number'])) $leg['confirmation_number'] = trim((string)$input['confirmation_number']);
                    if (isset($input['hotel_contact'])) $leg['hotel_contact'] = trim((string)$input['hotel_contact']);
                    $leg['confirmation_status'] = !empty($leg['confirmation_number']) ? 'Confirmed' : 'Pending';
                } elseif ($legType === 'transport') {
                    if (isset($input['driver_name'])) $leg['driver_name'] = trim((string)$input['driver_name']);
                    if (isset($input['driver_phone'])) $leg['driver_phone'] = trim((string)$input['driver_phone']);
                    if (isset($input['vehicle_number'])) $leg['vehicle_number'] = trim((string)$input['vehicle_number']);
                    $leg['confirmation_status'] = !empty($leg['driver_name']) ? 'Confirmed' : 'Pending';
                } else {
                    // activity / sightseeing
                    if (isset($input['confirmation_number'])) $leg['confirmation_number'] = trim((string)$input['confirmation_number']);
                    if (isset($input['operator_name'])) $leg['operator_name'] = trim((string)$input['operator_name']);
                    if (isset($input['guide_contact'])) $leg['guide_contact'] = trim((string)$input['guide_contact']);
                    if (isset($input['slot_time'])) $leg['slot_time'] = trim((string)$input['slot_time']);
                    $leg['confirmation_status'] = !empty($leg['confirmation_number']) ? 'Confirmed' : 'Pending';
                }
                $leg['confirmed_by'] = $currentUserIdentifier;
                $leg['confirmed_at'] = $nowIso;
            }
        }
        unset($leg);
    }

    // 2. Also check day blocks: itineraryData['days'][].metadata.blocks[]
    if (isset($itineraryData['days']) && is_array($itineraryData['days'])) {
        foreach ($itineraryData['days'] as &$day) {
            if (isset($day['metadata']['blocks']) && is_array($day['metadata']['blocks'])) {
                foreach ($day['metadata']['blocks'] as &$block) {
                    if ((string)($block['id'] ?? '') === $legId) {
                        $found = true;
                        if (!isset($block['properties']) || !is_array($block['properties'])) {
                            $block['properties'] = [];
                        }

                        if ($legType === 'hotel') {
                            if (isset($input['confirmation_number'])) {
                                $block['properties']['hotel_conf_no'] = trim((string)$input['confirmation_number']);
                                $block['properties']['confirmation_number'] = trim((string)$input['confirmation_number']);
                            }
                            if (isset($input['hotel_contact'])) {
                                $block['properties']['hotel_contact'] = trim((string)$input['hotel_contact']);
                            }
                            $block['properties']['confirmation_status'] = !empty($block['properties']['confirmation_number']) ? 'Confirmed' : 'Pending';
                        } elseif ($legType === 'transport') {
                            if (isset($input['driver_name'])) $block['properties']['driver_name'] = trim((string)$input['driver_name']);
                            if (isset($input['driver_phone'])) $block['properties']['driver_phone'] = trim((string)$input['driver_phone']);
                            if (isset($input['vehicle_number'])) $block['properties']['vehicle_number'] = trim((string)$input['vehicle_number']);
                            $block['properties']['confirmation_status'] = !empty($block['properties']['driver_name']) ? 'Confirmed' : 'Pending';
                        } else {
                            // activity / sightseeing
                            if (isset($input['confirmation_number'])) {
                                $block['properties']['confirmation_number'] = trim((string)$input['confirmation_number']);
                                $block['properties']['ticket_number'] = trim((string)$input['confirmation_number']);
                            }
                            if (isset($input['operator_name'])) $block['properties']['operator_name'] = trim((string)$input['operator_name']);
                            if (isset($input['guide_contact'])) $block['properties']['guide_contact'] = trim((string)$input['guide_contact']);
                            if (isset($input['slot_time'])) $block['properties']['slot_time'] = trim((string)$input['slot_time']);
                            $block['properties']['confirmation_status'] = !empty($block['properties']['confirmation_number']) ? 'Confirmed' : 'Pending';
                        }
                        $block['properties']['confirmed_by'] = $currentUserIdentifier;
                        $block['properties']['confirmed_at'] = $nowIso;
                    }
                }
                unset($block);
            }
        }
        unset($day);
    }

    // Save back to proposals
    $updateStmt = $pdo->prepare("UPDATE proposals SET itinerary_data = ? WHERE id = ?");
    $updateStmt->execute([json_encode($itineraryData), $proposalId]);

    // Also sync to itineraries table if exists for this lead
    try {
        $syncStmt = $pdo->prepare("UPDATE itineraries SET days = ? WHERE lead_id = ?");
        if (isset($itineraryData['days'])) {
            $syncStmt->execute([json_encode($itineraryData['days']), $leadId]);
        }
    } catch (Exception $syncErr) {
        // non-blocking
    }

    echo json_encode([
        'success' => true,
        'proposal_id' => $proposalId,
        'leg_type' => $legType,
        'leg_id' => $legId,
        'found' => $found,
        'confirmed_by' => $currentUserIdentifier,
        'confirmed_at' => $nowIso
    ]);
} catch (Exception $e) {
    error_log('itinerary_confirm_leg error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update confirmation details: ' . $e->getMessage()]);
}
