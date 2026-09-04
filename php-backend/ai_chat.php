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
$geminiApiKey = getenv('GEMINI_API_KEY') ?: getenv('VITE_GEMINI_API_KEY') ?: 'AQ.Ab8RN6JfZ1MKggR2v9cGl1HX_5SCX-_AZdYQp8Ocv6LN4kHRJw';

$systemPrompt = "You are Sarah, Lead AI Travel Designer for Ghumo Firoo Journeys — India's premier luxury travel agency (Ministry of Tourism Registered Partner, Official Evoke Partner).

YOUR PERSONALITY & RULES:
1. Speak warmly, naturally, and professionally like an expert human luxury travel designer.
2. ALWAYS maintain conversational context across multiple turns. Never forget the destination, dates, or guest count the user previously mentioned.
3. When the user asks for a destination plan (e.g. Coorg, Rann Utsav, Char Dham, Kashmir, Manali, Kerala, Rajasthan, Europe, Thailand, Bali, Dubai):
   - Provide a vibrant, structured day-by-day itinerary with real sightseeing, stays, and pricing estimates.
   - If travel dates or party size are not yet given, warmly ask for them.
4. When the user gives dates (e.g. 'oct 31') or guest count (e.g. 'for 2 people'), acknowledge their destination and dates warmly, confirm seasonal weather recommendations, and offer to send the complete day-by-day PDF proposal to their WhatsApp or Email.
5. NEVER repeat generic template phrases like 'X is a fantastic destination choice' when the user is answering date or passenger count questions.{$liveContextText}";

// 1. TRY OFFICIAL GOOGLE GEMINI API (MULTI-MODEL RESILIENT FALLBACK)
if (!empty($geminiApiKey)) {
    $modelsToTry = [
        'gemini-3.1-flash-lite-preview',
        'gemini-3-flash-preview',
        'gemini-3.1-flash-lite',
        'gemini-3.5-flash',
        'gemini-3.6-flash',
        'gemini-flash-latest'
    ];

    $contents = [
        [
            'role' => 'user',
            'parts' => [['text' => "{$systemPrompt}\n\n[ROLE PLAY INSTRUCTION]: You are Sarah. Respond directly to the user."]]
        ],
        [
            'role' => 'model',
            'parts' => [['text' => "Understood! I'm Sarah, Senior AI Travel Designer at Ghumo Firoo Journeys. I will maintain context and provide bespoke luxury holiday recommendations."]]
        ]
    ];

    foreach ($history as $msg) {
        if (isset($msg['role']) && isset($msg['content'])) {
            $contents[] = [
                'role' => $msg['role'] === 'user' ? 'user' : 'model',
                'parts' => [['text' => $msg['content']]]
            ];
        }
    }

    $contents[] = [
        'role' => 'user',
        'parts' => [['text' => $userMessage]]
    ];

    $googlePayload = ['contents' => $contents];

    foreach ($modelsToTry as $candidateModel) {
        $googleUrl = "https://generativelanguage.googleapis.com/v1beta/models/{$candidateModel}:generateContent?key={$geminiApiKey}";
        $ch2 = curl_init($googleUrl);
        curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch2, CURLOPT_POST, true);
        curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($googlePayload));
        curl_setopt($ch2, CURLOPT_TIMEOUT, 6);
        curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);

        $gResponse = curl_exec($ch2);
        $gHttpCode = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
        curl_close($ch2);

        if ($gHttpCode === 200 && $gResponse) {
            $gData = json_decode($gResponse, true);
            $gReply = $gData['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($gReply && !empty(trim($gReply))) {
                echo json_encode([
                    'success'  => true,
                    'reply'    => trim($gReply),
                    'source'   => "official-google-gemini-{$candidateModel}",
                    'packages' => $livePackages
                ]);
                exit;
            }
        }
    }
}

// 2. TRY RENDER GEMINI WEB2API SERVICE
try {
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

    $payload = [
        'model' => 'gemini-3.6-flash',
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
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
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
} catch (Exception $e) {}

// 3. DYNAMIC DATABASE-DRIVEN FALLBACK ENGINE
$reply = generateDynamicDatabaseReply($userMessage, $history, $livePackages, $destKey);
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

function generateDynamicDatabaseReply(string $msg, array $history, array $livePackages, string $destKey): string {
    $query = strtolower(trim($msg));
    
    // GREETINGS FILTER
    $greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'hola', 'start', 'help', 'menu', 'hi there'];
    if (in_array($query, $greetings)) {
        return "Hello! 👋 I'm **Sarah**, Senior AI Travel Designer at Ghumo Firoo Journeys (Official Evoke Partner).\n\nWhich dream destination are you looking to explore next (Rann Utsav Kutch, Coorg, Char Dham Yatra, Kashmir, Kerala, Rajasthan, Europe, Thailand, Bali, or Dubai)? Tell me a bit about your travel plans!";
    }

    if (!empty($livePackages)) {
        $topPkg = $livePackages[0];
        $pkgName = $topPkg['name'] ?? 'Bespoke Package';
        $pkgPrice = !empty($topPkg['price']) ? "₹" . number_format((float)$topPkg['price']) . " / person" : "On Request";
        $pkgDuration = $topPkg['duration'] ?? 'Custom Duration';

        return "Fantastic choice! ✈️✨ Here is our curated package for **{$pkgName}**:\n\n• **Package**: {$pkgName}\n• **Duration**: {$pkgDuration}\n• **Starting Price**: {$pkgPrice}\n• **Stays & Inclusions**: Verified 4-Star Accommodations, Daily Meals, Private Chauffeured Transfers & Sightseeing Passes\n\nWould you like me to send the complete day-by-day PDF brochure directly to your WhatsApp or Email?";
    }

    // Check if dates or pax are in query
    $hasDatesOrPax = preg_match('/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|2026|dates|month|people|person|pax|guests|couple)\b/i', $query);
    if ($destKey && $hasDatesOrPax) {
        $cleanDest = ucfirst($destKey);
        return "Wonderful! ✈️✨ For your journey to **{$cleanDest}**, we will craft a private customized itinerary with 4-star boutique stays and dedicated chauffeur transfers.\n\nPlease share your phone number or WhatsApp, and I will have our senior destination specialist send the complete day-wise PDF quote right away!";
    }

    if ($destKey) {
        $cleanDest = ucfirst($destKey);
        return "**{$cleanDest}** is a fantastic destination choice! ✈️✨ We can curate a completely personalized holiday package with luxury stays, private transfers, and handpicked sightseeing.\n\nWhen are you planning to travel, and how many guests will be joining you?";
    }

    return "I'd love to help craft your perfect holiday! ✈️✨ Which dream destination are you planning next (Rann Utsav Kutch, Coorg, Char Dham Yatra, Kashmir, Kerala, Rajasthan, Europe, Thailand, Bali, or Dubai)? Tell me where you'd like to go!";
}

function getTargetDestinationKey(string $q, array $history): string {
    $known = [
        'coorg' => ['coorg', 'corrong', 'kodagu', 'madikeri'],
        'rann' => ['rann', 'kutch', 'utsav', 'dhordo', 'tent city'],
        'kashmir' => ['kashmir', 'srinagar', 'gulmarg', 'pahalgam'],
        'chardham' => ['chardham', 'char dham', 'kedarnath', 'badrinath'],
        'thailand' => ['thailand', 'phuket', 'krabi', 'bangkok'],
        'europe' => ['europe', 'switzerland', 'paris'],
        'bali' => ['bali', 'ubud', 'seminyak'],
        'dubai' => ['dubai', 'burj'],
        'goa' => ['goa'],
        'rajasthan' => ['rajasthan', 'jaipur', 'udaipur', 'jaisalmer'],
        'kerala' => ['kerala', 'munnar', 'alleppey'],
        'manali' => ['manali', 'shimla']
    ];

    foreach ($known as $k => $aliases) {
        foreach ($aliases as $alias) {
            if (strpos($q, $alias) !== false) return $k;
        }
    }

    // Scan history backwards
    for ($i = count($history) - 1; $i >= 0; $i--) {
        $hText = strtolower($history[$i]['content'] ?? '');
        foreach ($known as $k => $aliases) {
            foreach ($aliases as $alias) {
                if (strpos($hText, $alias) !== false) return $k;
            }
        }
    }

    return '';
}
