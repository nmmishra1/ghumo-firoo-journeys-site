<?php
// generate_ai_itinerary.php — 1-Click Database-Prioritized Gemini Itinerary & Quote Generator for Ghumo Firoo CRM
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';
if (function_exists('loadEnvFile')) {
    loadEnvFile();
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$destination = trim($input['destination'] ?? $input['dest'] ?? '');
$durationDays = max(1, min(30, intval($input['duration_days'] ?? $input['days'] ?? 5)));
$durationNights = max(1, $durationDays - 1);
$travelStyle = trim($input['travel_style'] ?? 'Deluxe Holiday');
$budgetTier = trim($input['budget_tier'] ?? '4-Star Premium');
$passengerCount = max(1, intval($input['passenger_count'] ?? $input['pax'] ?? 2));
$customNotes = trim($input['custom_notes'] ?? $input['notes'] ?? '');
$customerName = trim($input['customer_name'] ?? '');

if (empty($destination)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Destination name is required']);
    exit;
}

// 1. CONNECT TO DATABASE & FETCH REAL INVENTORY
$pdo = null;
try {
    $pdo = getDb();
} catch (Exception $e) {
    // Graceful database fallback
}

$dbSightseeings = [];
$dbHotels = [];
$dbPackages = [];
$matchedCity = null;

if ($pdo) {
    try {
        // A. Match City / Destination
        $stmt = $pdo->prepare("
            SELECT id, name, city_name, state_name, destination_type, description 
            FROM cities 
            WHERE (name LIKE :d1 OR city_name LIKE :d2 OR state_name LIKE :d3)
            AND name IS NOT NULL AND name != ''
            LIMIT 5
        ");
        $term = "%{$destination}%";
        $stmt->execute([':d1' => $term, ':d2' => $term, ':d3' => $term]);
        $cities = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (!empty($cities)) {
            $matchedCity = $cities[0];
        }

        $cityIds = !empty($cities) ? array_filter(array_column($cities, 'id')) : [];

        // B. Fetch Database Sightseeing Spots
        if (!empty($cityIds)) {
            $inClause = implode(',', array_map('intval', $cityIds));
            $sStmt = $pdo->query("
                SELECT name, sightseeing_name, category, recommended_duration_hours, entry_fee_estimate, description 
                FROM sightseeing 
                WHERE city_id IN ($inClause)
                LIMIT 20
            ");
            $dbSightseeings = $sStmt ? $sStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        }

        if (empty($dbSightseeings)) {
            $sStmt2 = $pdo->prepare("
                SELECT name, sightseeing_name, category, recommended_duration_hours, entry_fee_estimate, description 
                FROM sightseeing 
                WHERE (name LIKE :q1 OR description LIKE :q2)
                LIMIT 15
            ");
            $sStmt2->execute([':q1' => $term, ':q2' => $term]);
            $dbSightseeings = $sStmt2->fetchAll(PDO::FETCH_ASSOC);
        }

        // C. Fetch Contracted Hotels & Rates
        if (!empty($cityIds)) {
            $inClause = implode(',', array_map('intval', $cityIds));
            $hStmt = $pdo->query("
                SELECT hotel_name, city_name, star_rating, standard_rate, deluxe_rate, luxury_rate, amenities, address 
                FROM hotels 
                WHERE city_id IN ($inClause) OR is_active = 1
                ORDER BY star_rating DESC 
                LIMIT 12
            ");
            $dbHotels = $hStmt ? $hStmt->fetchAll(PDO::FETCH_ASSOC) : [];
        } else {
            $hStmt2 = $pdo->prepare("
                SELECT hotel_name, city_name, star_rating, standard_rate, deluxe_rate, luxury_rate, amenities, address 
                FROM hotels 
                WHERE city_name LIKE :c1 OR state_name LIKE :c2 OR hotel_name LIKE :c3
                ORDER BY star_rating DESC 
                LIMIT 10
            ");
            $hStmt2->execute([':c1' => $term, ':c2' => $term, ':c3' => $term]);
            $dbHotels = $hStmt2->fetchAll(PDO::FETCH_ASSOC);
        }

        // D. Fetch Existing Packages
        $pStmt = $pdo->prepare("
            SELECT name, slug, duration, price, inclusions, highlights 
            FROM packages 
            WHERE (name LIKE :p1 OR destination LIKE :p2 OR slug LIKE :p3)
            LIMIT 3
        ");
        $pStmt->execute([':p1' => $term, ':p2' => $term, ':p3' => $term]);
        $dbPackages = $pStmt->fetchAll(PDO::FETCH_ASSOC);

    } catch (Exception $e) {
        // Query error fallback
    }
}

// 2. CONSTRUCT RAG CONTEXT (Real database records for Gemini prompt)
$sightseeingContextText = "";
if (!empty($dbSightseeings)) {
    $sightseeingContextText = "VERIFIED SIGHTSEEING SPOTS IN DATABASE:\n";
    foreach ($dbSightseeings as $s) {
        $sName = $s['name'] ?? $s['sightseeing_name'] ?? '';
        $sCat = $s['category'] ?? 'Sightseeing';
        $sDur = $s['recommended_duration_hours'] ?? '2';
        $sFee = $s['entry_fee_estimate'] ?? 'Free';
        $sDesc = $s['description'] ?? '';
        $sightseeingContextText .= "- {$sName} ({$sCat}, ~{$sDur} hrs, Entry: {$sFee}): {$sDesc}\n";
    }
}

$hotelsContextText = "";
if (!empty($dbHotels)) {
    $hotelsContextText = "CONTRACTED HOTELS IN DATABASE:\n";
    foreach ($dbHotels as $h) {
        $hName = $h['hotel_name'] ?? '';
        $hCity = $h['city_name'] ?? $destination;
        $hStar = $h['star_rating'] ?? 4;
        $hRate = $h['deluxe_rate'] ?? $h['standard_rate'] ?? 3500;
        $hotelsContextText .= "- {$hName} [{$hCity}] ({$hStar}★, Base Rate: ₹{$hRate}/night)\n";
    }
}

$packageContextText = "";
if (!empty($dbPackages)) {
    $packageContextText = "EXISTING STANDARD PACKAGES IN DATABASE:\n";
    foreach ($dbPackages as $p) {
        $packageContextText .= "- {$p['name']} ({$p['duration']}, Base: ₹{$p['price']})\n";
    }
}

// 3. BUILD AI SYSTEM & GENERATION PROMPTS
$systemPrompt = "You are Sarah, Chief Travel Designer & Senior Destination Architect at Ghumo Firoo Journeys — India's premier luxury & experiential travel company.
Your role is to assemble hyper-detailed, practical, and breathtaking day-by-day travel itineraries and quote cost proposals for private travelers.

STRICT OPERATIONAL RULES:
1. DATA PRIORITY: You MUST prioritize the verified sightseeings, contracted hotel inventory, and pricing provided in the context. Do NOT invent unrealistic travel times.
2. LOGICAL PACING: Account for real transit times, scenic photo stops, and meal breaks. Do not pack 10 far-apart attractions into one afternoon.
3. CHAUFFEUR TRANSPORT: Calculate accurate daily private cab usage (Sedan / Innova Crysta / Tempo Traveller) with estimated daily kilometer ranges.
4. TARGETED VIBE: Tailor the tone, romantic/family elements, and activities to the traveler style ('{$travelStyle}') and notes ('{$customNotes}').
5. STRICT OUTPUT FORMAT: Respond ONLY with a valid raw JSON object matching the schema below. Do not wrap in ```json markdown code blocks. Do not add conversational intro/outro text.";

$userPrompt = "Generate a comprehensive {$durationDays} Days / {$durationNights} Nights custom private tour proposal for '{$destination}'.

CLIENT & TRIP SPECIFICATIONS:
- Destination: {$destination}
- Duration: {$durationDays} Days / {$durationNights} Nights
- Client Name: " . ($customerName ?: 'Valued Traveler') . "
- Passenger Count: {$passengerCount} Adults
- Travel Style / Vibe: {$travelStyle}
- Budget Tier: {$budgetTier}
- Special Requests & Notes: " . ($customNotes ?: 'None specified') . "

{$sightseeingContextText}
{$hotelsContextText}
{$packageContextText}

REQUIRED JSON OUTPUT SCHEMA:
{
  \"package_title\": \"(e.g., Majestic Kashmir 5N/6D: Srinagar Houseboats, Gulmarg Gondola & Pahalgam Valleys)\",
  \"overview\": \"(2-3 compelling paragraphs highlighting the journey narrative, landscapes, and signature luxury experiences)\",
  \"total_days\": {$durationDays},
  \"total_nights\": {$durationNights},
  \"destination\": \"{$destination}\",
  \"travel_style\": \"{$travelStyle}\",
  \"suggested_hotels\": [
    {
      \"hotel_name\": \"Hotel Name\",
      \"city\": \"City Name\",
      \"star_rating\": 4,
      \"nights\": 2,
      \"room_type\": \"Deluxe Room • CP Plan (Breakfast Included)\",
      \"est_rate_per_night\": 4500,
      \"total_cost\": 9000
    }
  ],
  \"day_by_day\": [
    {
      \"day_number\": 1,
      \"title\": \"Day 1: Arrival in [City] → Scenic Transfer → Evening Sightseeing\",
      \"morning_highlight\": \"Pickup & check-in\",
      \"afternoon_highlight\": \"Explore landmark\",
      \"evening_highlight\": \"Sunset view & cultural walk\",
      \"overnight_stay\": \"[City Name] Hotel / Houseboat\",
      \"drive_distance_km\": 45,
      \"description\": \"Full detailed narrative of the day's experiences, meal suggestions, and route details.\",
      \"activities\": [\"Private Chauffeur Pickup\", \"Hotel Check-in\", \"Key Sightseeing 1\", \"Sunset Point\"]
    }
  ],
  \"inclusions\": [
    \"Accommodation in handpicked 4-star boutique hotels with daily breakfast\",
    \"Private AC Sedan / Innova for all airport transfers, sightseeing, and intercity travel\",
    \"Driver allowances, toll taxes, fuel, parking charges, and state interstate permits\",
    \"24x7 Dedicated Ghumo Firoo on-trip concierge assistance\"
  ],
  \"exclusions\": [
    \"Airfare / Train tickets to and from arrival hub\",
    \"Monument entry tickets, guide fees, and camera permits unless specified\",
    \"Personal expenses such as laundry, room service, alcoholic beverages, and tips\",
    \"Optional adventure sports (e.g. Paragliding, Shikara ride, Gondola Phase 2)\"
  ],
  \"quote_items\": [
    {
      \"type\": \"hotel\",
      \"name\": \"[City] Selected Boutique Hotel Stay (4★)\",
      \"detail\": \"Deluxe Room with Breakfast • {$durationNights} Nights Stay\",
      \"qty\": {$durationNights},
      \"rate\": 4500,
      \"total\": " . ($durationNights * 4500) . "
    },
    {
      \"type\": \"transport\",
      \"name\": \"Dedicated Private Chauffeur Vehicle ({$durationDays} Days)\",
      \"detail\": \"AC Sedan / Innova for full-circuit transfers, local sightseeing & tolls\",
      \"qty\": {$durationDays},
      \"rate\": 3200,
      \"total\": " . ($durationDays * 3200) . "
    },
    {
      \"type\": \"activity\",
      \"name\": \"Curated Sightseeing & Heritage Experiences\",
      \"detail\": \"Included entry arrangements & cultural experiences\",
      \"qty\": 1,
      \"rate\": 2500,
      \"total\": 2500
    }
  ]
}";

// 4. CALL GEMINI API (Primary: Gemini 2.0 Flash -> Secondary: Render Web2API -> Fallback: Deterministic DB Builder)
$aiResult = null;
$geminiApiKey = getenv('GEMINI_API_KEY') ?: getenv('VITE_GEMINI_API_KEY') ?: '';
$geminiApiUrl = getenv('GEMINI_WEB2API_URL') ?: getenv('VITE_GEMINI_WEB2API_URL') ?: 'https://gemini-web2api-sxti.onrender.com/v1';

// Method 1: Official Google Gemini API with multi-model fallback
if (!empty($geminiApiKey)) {
    $modelsToTry = [
        'gemini-3.1-flash-lite-preview',
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.6-flash'
    ];

    $fullPrompt = "{$systemPrompt}\n\n{$userPrompt}";
    $payload = [
        'contents' => [
            [
                'role' => 'user',
                'parts' => [['text' => $fullPrompt]]
            ]
        ],
        'generationConfig' => [
            'temperature' => 0.4,
            'maxOutputTokens' => 4096,
            'responseMimeType' => 'application/json'
        ]
    ];

    foreach ($modelsToTry as $candidateModel) {
        try {
            $googleUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$candidateModel}:generateContent?key={$geminiApiKey}";
            $ch = curl_init($googleUrl);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_TIMEOUT, 12);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

            $res = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $res) {
                $gData = json_decode($res, true);
                $rawText = $gData['candidates'][0]['content']['parts'][0]['text'] ?? '';
                $rawText = trim(preg_replace('/^```json\s*|```\s*$/im', '', $rawText));
                $parsed = json_decode($rawText, true);
                if (!empty($parsed['day_by_day']) && is_array($parsed['day_by_day'])) {
                    $aiResult = $parsed;
                    $aiResult['source'] = "official-gemini-{$candidateModel}";
                    break;
                }
            }
        } catch (Exception $e) {
            // Try next model
        }
    }
}

// Method 2: Render Cloud Gemini Web2API Proxy
if (!$aiResult) {
    try {
        $ch2 = curl_init("{$geminiApiUrl}/chat/completions");
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer sk-gemini'
        ]);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode([
            'model' => 'gemini-2.5-flash',
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt]
            ],
            'temperature' => 0.4,
            'max_tokens' => 4000
        ]));
        curl_setopt($ch2, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);

        $res2 = curl_exec($ch2);
        $httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);

        if ($httpCode2 === 200 && $res2) {
            $rData = json_decode($res2, true);
            $rawText2 = $rData['choices'][0]['message']['content'] ?? '';
            $rawText2 = trim(preg_replace('/^```json\s*|```\s*$/im', '', $rawText2));
            $parsed2 = json_decode($rawText2, true);
            if (!empty($parsed2['day_by_day']) && is_array($parsed2['day_by_day'])) {
                $aiResult = $parsed2;
                $aiResult['source'] = 'gemini-web2api-proxy';
            }
        }
    } catch (Exception $e) {
        // Fall through to deterministic DB builder
    }
}

// Method 3: Deterministic Database Fallback Builder (Ensures 100% uptime even if all external AI is down)
if (!$aiResult) {
    $aiResult = buildDeterministicDbItinerary($destination, $durationDays, $durationNights, $travelStyle, $budgetTier, $passengerCount, $dbSightseeings, $dbHotels);
    $aiResult['source'] = 'database-deterministic-fallback';
}

echo json_encode([
    'success' => true,
    'data' => $aiResult,
    'inventory_matched' => [
        'sightseeing_count' => count($dbSightseeings),
        'hotel_count' => count($dbHotels),
        'packages_count' => count($dbPackages),
        'city_id' => $matchedCity['id'] ?? null
    ]
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
exit;

// Deterministic Database Itinerary Builder Fallback
function buildDeterministicDbItinerary($dest, $days, $nights, $style, $tier, $pax, $sightseeings, $hotels) {
    $hotelsList = [];
    $hotelCostTotal = 0;
    
    // Choose hotel from DB or default
    $selectedHotel = !empty($hotels) ? $hotels[0] : null;
    $hName = $selectedHotel ? $selectedHotel['hotel_name'] : "{$dest} Heritage Boutique Resort";
    $hCity = $selectedHotel ? ($selectedHotel['city_name'] ?: $dest) : $dest;
    $hRate = $selectedHotel ? intval($selectedHotel['deluxe_rate'] ?: $selectedHotel['standard_rate'] ?: 4500) : 4500;
    $hTotal = $nights * $hRate;
    $hotelCostTotal += $hTotal;

    $hotelsList[] = [
        'hotel_name' => $hName,
        'city' => $hCity,
        'star_rating' => $selectedHotel['star_rating'] ?? 4,
        'nights' => $nights,
        'room_type' => 'Deluxe Room • CP Plan (Breakfast Included)',
        'est_rate_per_night' => $hRate,
        'total_cost' => $hTotal
    ];

    $dayByDay = [];
    $sightChunk = !empty($sightseeings) ? array_chunk($sightseeings, 2) : [];

    for ($d = 1; $d <= $days; $d++) {
        $chunk = $sightChunk[($d - 1) % max(1, count($sightChunk))] ?? [];
        $s1 = !empty($chunk[0]) ? ($chunk[0]['name'] ?? $chunk[0]['sightseeing_name']) : "{$dest} Heritage Center";
        $s2 = !empty($chunk[1]) ? ($chunk[1]['name'] ?? $chunk[1]['sightseeing_name']) : "{$dest} Sunset Vantage Point";

        if ($d === 1) {
            $dayTitle = "Day 1: Arrival & Welcome to {$dest}";
            $desc = "Arrive at {$dest}. Meet our dedicated chauffeur at the airport/station. Transfer to your luxury stay, check-in, and relax. In the evening, visit {$s1} and enjoy a serene cultural walk with traditional dinner.";
        } elseif ($d === $days) {
            $dayTitle = "Day {$d}: Souvenir Shopping & Departure";
            $desc = "Enjoy a leisurely breakfast at the hotel. Visit local handicraft markets and spice bazaars. Later, our chauffeur will transfer you to the airport/station for your onward journey home with unforgettable memories.";
        } else {
            $dayTitle = "Day {$d}: Exploring {$s1} & {$s2}";
            $desc = "Morning excursion to {$s1}, admiring ancient architecture and scenic viewpoints. In the afternoon, explore {$s2} followed by local authentic cuisine and evening leisure.";
        }

        $dayByDay[] = [
            'day_number' => $d,
            'title' => $dayTitle,
            'morning_highlight' => $d === 1 ? 'Chauffeur Pickup & Check-in' : "Visit {$s1}",
            'afternoon_highlight' => "Explore {$s2}",
            'evening_highlight' => 'Local Food Trail & Leisure',
            'overnight_stay' => "{$hName}, {$hCity}",
            'drive_distance_km' => rand(30, 80),
            'description' => $desc,
            'activities' => ["Visit {$s1}", "Visit {$s2}", 'Chauffeur Transfers', 'Photo Stops']
        ];
    }

    $transportDailyRate = ($pax > 4) ? 4500 : 3200;
    $transportTotal = $days * $transportDailyRate;

    return [
        'package_title' => "Signature {$dest} Experience ({$nights}N/{$days}D): Handpicked Stays & Private Chauffeur",
        'overview' => "Embark on a customized private journey through {$dest}. Designed for discerning travelers seeking seamless chauffeur transfers, boutique stays, and curated sightseeing highlights across {$dest}.",
        'total_days' => $days,
        'total_nights' => $nights,
        'destination' => $dest,
        'travel_style' => $style,
        'suggested_hotels' => $hotelsList,
        'day_by_day' => $dayByDay,
        'inclusions' => [
            "Accommodation in handpicked 4-star boutique stays ({$nights} Nights) with daily breakfast",
            "Dedicated private AC vehicle for all transfers, excursions, and intercity travel ({$days} Days)",
            "Chauffeur charges, driver allowance, fuel, toll taxes, and all state parking permits",
            "24x7 Dedicated Ghumo Firoo on-trip travel designer concierge"
        ],
        'exclusions' => [
            "Airfare / Train tickets to/from arrival city",
            "Monument entrance fees, guide charges, and optional adventure activities",
            "Personal expenses, room service, laundry, and tips"
        ],
        'quote_items' => [
            [
                'type' => 'hotel',
                'name' => "{$hName} ({$hCity})",
                'detail' => "Deluxe Room • CP Plan (Breakfast Included) • {$nights} Nights",
                'qty' => $nights,
                'rate' => $hRate,
                'total' => $hTotal
            ],
            [
                'type' => 'transport',
                'name' => "Dedicated Private AC Vehicle ({$days} Days)",
                'detail' => "Full-circuit sightseeing, airport transfers & all highway tolls",
                'qty' => $days,
                'rate' => $transportDailyRate,
                'total' => $transportTotal
            ],
            [
                'type' => 'activity',
                'name' => "Curated Sightseeing & Permit Assistance",
                'detail' => "Assisted entry & local cultural highlights",
                'qty' => 1,
                'rate' => 2000,
                'total' => 2000
            ]
        ]
    ];
}