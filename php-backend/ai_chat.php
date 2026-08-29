<?php
// ai_chat.php — Dynamic AI Travel Designer for Ghumo Firoo Journeys
header('Content-Type: application/json');
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
$userMessage = $input['message'] ?? $input['prompt'] ?? '';
$history = $input['history'] ?? [];
$context = $input['context'] ?? [];

if (empty($userMessage)) {
    http_response_code(400);
    echo json_encode(['error' => 'User message is required']);
    exit;
}

$pdo = null;
try {
    $pdo = getDb();
} catch (Exception $e) {
    // Database connection fallback
}

$destKey = getTargetDestinationKey(strtolower(trim($userMessage)), $history);
$livePackages = $pdo ? fetchDynamicPackageContext($pdo, $destKey ?: $userMessage) : [];

// Construct Dynamic Live Database Knowledge Context
$liveContextText = "";
if (!empty($livePackages)) {
    $liveContextText .= "\n\nLIVE DATABASE INVENTORY FOR MATCHED DESTINATION:\n";
    foreach ($livePackages as $pkg) {
        $name = $pkg['name'] ?? 'Package';
        $price = !empty($pkg['price']) ? "₹" . number_format((float)$pkg['price']) . "/person" : 'On Request';
        $duration = $pkg['duration'] ?? '';
        $slug = $pkg['slug'] ?? '';
        $liveContextText .= "- Package: {$name} | Duration: {$duration} | Price: {$price} | Link: /packages/{$slug}\n";
    }
}

$geminiApiUrl = getenv('GEMINI_WEB2API_URL') ?: getenv('VITE_GEMINI_WEB2API_URL') ?: 'https://gemini-web2api-sxti.onrender.com/v1';
$geminiApiKey = getenv('GEMINI_API_KEY') ?: getenv('VITE_GEMINI_API_KEY') ?: '';

$systemPrompt = "You are Sarah, Lead AI Travel Designer for Ghumo Firoo Journeys — a luxury travel agency specializing in bespoke holiday experiences across India (Rann Utsav Kutch, Char Dham Yatra, Kashmir, Goa, Rajasthan, Kerala, Himachal) and internationally (Thailand, Europe, Singapore, Bali, Dubai, Maldives).

YOUR PERSONALITY & RULES:
1. Speak warmly, naturally, and professionally like an expert human travel designer.
2. NEVER use technical labels or treat simple greetings like 'hi' or 'hello' as destination names!
3. If user says 'hi' or 'hello', welcome them warmly and ask which destination they'd like to explore.
4. When answering questions about destinations or packages, use the LIVE DATABASE INVENTORY below to quote real prices, package names, and direct links.
5. Offer to send complete day-by-day PDF brochures to their WhatsApp or Email and capture their contact number.{$liveContextText}";

$formattedMessages = [
    ['role' => 'system', 'content' => $systemPrompt]
];

foreach ($history as $msg) {
    if (isset($msg['role']) && isset($msg['content'])) {
        $formattedMessages[] = [
            'role' => $msg['role'] === 'user' ? 'user' : 'assistant',
            'content' => $msg['content']
        ];
    }
}

$formattedMessages[] = ['role' => 'user', 'content' => $userMessage];

// 1. TRY RENDER GEMINI WEB2API SERVICE
$model = getenv('GEMINI_MODEL') ?: 'gemini-3.6-flash';
$payload = [
    'model' => $model,
    'messages' => $formattedMessages,
    'temperature' => 0.7,
    'max_tokens' => 800
];

$ch = curl_init("{$geminiApiUrl}/chat/completions");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer sk-gemini'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_TIMEOUT, 12);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && $response) {
    $data = json_decode($response, true);
    $reply = $data['choices'][0]['message']['content'] ?? null;
    if ($reply && !empty(trim($reply))) {
        echo json_encode([
            'success'  => true,
            'reply'    => trim($reply),
            'source'   => 'gemini-web2api-render',
            'packages' => $livePackages
        ]);
        exit;
    }
}

// 2. TRY OFFICIAL GOOGLE GEMINI API (IF KEY PRESENT)
if (!empty($geminiApiKey)) {
    $googleUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={$geminiApiKey}";
    $googlePayload = [
        'contents' => [
            [
                'parts' => [
                    ['text' => "{$systemPrompt}\n\nUser Question: {$userMessage}"]
                ]
            ]
        ]
    ];

    $ch2 = curl_init($googleUrl);
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_POST, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($googlePayload));
    curl_setopt($ch2, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);

    $gResponse = curl_exec($ch2);
    $gHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
    curl_close($ch2);

    if ($gHttpCode === 200 && $gResponse) {
        $gData = json_decode($gResponse, true);
        $gReply = $gData['candidates'][0]['content']['parts'][0]['text'] ?? null;
        if ($gReply) {
            echo json_encode([
                'success'  => true,
                'reply'    => trim($gReply),
                'source'   => 'official-google-gemini-api',
                'packages' => $livePackages
            ]);
            exit;
        }
    }
}

// 3. DYNAMIC DATABASE-DRIVEN FALLBACK ENGINE
$reply = generateDynamicDatabaseReply($userMessage, $history, $livePackages);
echo json_encode([
    'success'  => true,
    'reply'    => $reply,
    'source'   => 'dynamic-database-engine',
    'packages' => $livePackages
]);

function fetchDynamicPackageContext(PDO $pdo, string $destKey): array {
    try {
        $stmt = $pdo->prepare("
            SELECT p.id, p.name, p.slug, p.price, p.duration, p.image, p.highlights, p.inclusions, p.destinations
            FROM packages p
            WHERE (p.is_active = 1 OR p.is_active IS NULL)
              AND (LOWER(p.name) LIKE ? OR LOWER(p.slug) LIKE ? OR LOWER(p.destinations) LIKE ?)
            ORDER BY p.rating DESC, p.reviews DESC
            LIMIT 3
        ");
        $like = "%" . strtolower($destKey) . "%";
        $stmt->execute([$like, $like, $like]);
        $pkgs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (!$pkgs && (strpos($destKey, 'rann') !== false || strpos($destKey, 'kutch') !== false)) {
            $stmt2 = $pdo->query("SELECT id, name, slug, price, duration, image, highlights, inclusions, destinations FROM packages WHERE slug LIKE '%rann%' OR slug LIKE '%kutch%' LIMIT 3");
            $pkgs = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        }

        return $pkgs ?: [];
    } catch (Exception $e) {
        return [];
    }
}

function generateDynamicDatabaseReply(string $msg, array $history, array $livePackages): string {
    $query = strtolower(trim($msg));
    
    // GREETINGS FILTER
    $greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'hola', 'start', 'help', 'menu', 'hi there', 'hello there'];
    if (in_array($query, $greetings)) {
        return "Hello! 👋 I'm **Sarah**, Senior AI Travel Designer at Ghumo Firoo Journeys.\n\nWhich dream destination are you looking to explore next (Rann Utsav Kutch, Char Dham Yatra, Kashmir, Europe, Singapore, Thailand, Bali, Goa, or Dubai)? Tell me a bit about your travel plans!";
    }

    if (!empty($livePackages)) {
        $topPkg = $livePackages[0];
        $pkgName = $topPkg['name'] ?? 'Bespoke Package';
        $pkgPrice = !empty($topPkg['price']) ? "₹" . number_format((float)$topPkg['price']) . " / person" : "On Request";
        $pkgDuration = $topPkg['duration'] ?? 'Custom Duration';
        $pkgSlug = $topPkg['slug'] ?? '';

        return "Fantastic choice! ✈️✨ Here is our live database option for **{$pkgName}**:\n\n• **Package**: {$pkgName}\n• **Duration**: {$pkgDuration}\n• **Starting Price**: {$pkgPrice}\n• **Stays & Inclusions**: Verified 4-Star Accommodations, Daily Meals, Private Chauffeured Transfers & Sightseeing Passes\n\nWould you like me to send the complete day-by-day PDF brochure directly to your WhatsApp or Email?";
    }

    $destName = ucfirst($query);
    return "{$destName} is a fantastic destination choice! ✈️✨ We can curate a completely personalized holiday package with luxury stays, private transfers, and handpicked experiences.\n\nWhen are you planning to travel, and how many guests will be joining you?";
}

function getTargetDestinationKey(string $q, array $history): string {
    if (strpos($q, 'rann') !== false || strpos($q, 'kutch') !== false || strpos($q, 'utsav') !== false) return 'rann';
    if (strpos($q, 'singapore') !== false) return 'singapore';
    if (strpos($q, 'thailand') !== false || strpos($q, 'phuket') !== false || strpos($q, 'krabi') !== false) return 'thailand';
    if (strpos($q, 'europe') !== false || strpos($q, 'switzerland') !== false || strpos($q, 'paris') !== false) return 'europe';
    if (strpos($q, 'kashmir') !== false || strpos($q, 'srinagar') !== false || strpos($q, 'gulmarg') !== false) return 'kashmir';
    if (strpos($q, 'chardham') !== false || strpos($q, 'char dham') !== false || strpos($q, 'kedarnath') !== false) return 'chardham';
    if (strpos($q, 'bali') !== false || strpos($q, 'ubud') !== false) return 'bali';
    if (strpos($q, 'dubai') !== false) return 'dubai';
    if (strpos($q, 'goa') !== false) return 'goa';
    if (strpos($q, 'rajasthan') !== false || strpos($q, 'jaipur') !== false || strpos($q, 'udaipur') !== false) return 'rajasthan';

    // Scan history backwards
    for ($i = count($history) - 1; $i >= 0; $i--) {
        $hText = strtolower($history[$i]['content'] ?? '');
        if (strpos($hText, 'rann') !== false || strpos($hText, 'kutch') !== false) return 'rann';
        if (strpos($hText, 'singapore') !== false) return 'singapore';
        if (strpos($hText, 'thailand') !== false || strpos($hText, 'phuket') !== false) return 'thailand';
        if (strpos($hText, 'europe') !== false || strpos($hText, 'switzerland') !== false) return 'europe';
        if (strpos($hText, 'kashmir') !== false || strpos($hText, 'srinagar') !== false) return 'kashmir';
        if (strpos($hText, 'chardham') !== false || strpos($hText, 'char dham') !== false) return 'chardham';
        if (strpos($hText, 'bali') !== false) return 'bali';
        if (strpos($hText, 'dubai') !== false) return 'dubai';
        if (strpos($hText, 'goa') !== false) return 'goa';
        if (strpos($hText, 'rajasthan') !== false) return 'rajasthan';
    }

    return '';
}
