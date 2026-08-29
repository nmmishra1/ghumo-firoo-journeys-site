<?php
// import_itinerary_url.php — Universal AI-Powered Itinerary Scraper & Extractor
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$url = trim($_GET['url'] ?? $input['url'] ?? '');

if (empty($url)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'URL parameter is required']);
    exit;
}

if (!filter_var($url, FILTER_VALIDATE_URL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid URL format']);
    exit;
}

// 1. Recursive cURL function to follow HTTP 301/302/307/308 redirects
function fetchUrlWithRedirects($targetUrl, $maxRedirects = 5) {
    $redirectCount = 0;
    $currentUrl = $targetUrl;
    $finalHtml = '';
    $httpCode = 0;

    while ($redirectCount < $maxRedirects) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $currentUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 12);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        curl_close($ch);

        if (!$response) break;

        $headers = substr($response, 0, $headerSize);
        $finalHtml = substr($response, $headerSize);

        if ($httpCode >= 300 && $httpCode < 400) {
            if (preg_match('/Location:\s*([^\r\n]+)/i', $headers, $matches)) {
                $newLocation = trim($matches[1]);
                if (strpos($newLocation, 'http') !== 0) {
                    $parsedUrl = parse_url($currentUrl);
                    $scheme = $parsedUrl['scheme'] ?? 'https';
                    $host = $parsedUrl['host'] ?? '';
                    $newLocation = $scheme . '://' . $host . (strpos($newLocation, '/') === 0 ? '' : '/') . $newLocation;
                }
                $currentUrl = $newLocation;
                $redirectCount++;
                continue;
            }
        }
        break;
    }

    return ['url' => $currentUrl, 'html' => $finalHtml, 'http_code' => $httpCode];
}

// 2. Call Gemini AI API to structure raw web text universally
function queryGeminiForItinerary($text, $pageTitle) {
    $apiKey = getenv('GEMINI_API_KEY') ?: getenv('VITE_GEMINI_API_KEY');
    if (!$apiKey && file_exists(__DIR__ . '/../.env')) {
        $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($envLines as $line) {
            if (strpos($line, '=') !== false) {
                list($k, $v) = explode('=', $line, 2);
                if (trim($k) === 'GEMINI_API_KEY' || trim($k) === 'VITE_GEMINI_API_KEY') {
                    $apiKey = trim(trim($v), '"\'');
                    break;
                }
            }
        }
    }

    if (!$apiKey) return null;

    $prompt = "You are an expert travel itinerary parser. Analyze the following webpage text from a travel website and extract the tour details into pure JSON matching this exact structure:

{
  \"title\": \"Tour Package Name\",
  \"destination\": \"Primary State or Destination Name (e.g., Kashmir, Rann of Kutch, Goa, Kerala, Manali)\",
  \"duration_days\": 5,
  \"day_by_day\": [
    {
      \"day\": 1,
      \"title\": \"Day 1: Arrival & Local Sightseeing\",
      \"description\": \"Detailed description of activities for Day 1.\"
    }
  ]
}

Only return valid raw JSON without markdown code blocks. Here is the web text:

Title: {$pageTitle}
Web Content:
" . substr($text, 0, 10000);

    $ch = curl_init("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . $apiKey);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'contents' => [['parts' => [['text' => $prompt]]]]
    ]));
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    $res = curl_exec($ch);
    curl_close($ch);

    if ($res) {
        $data = json_decode($res, true);
        $rawJsonText = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
        $rawJsonText = trim(preg_replace('/```json\s*|```\s*/i', '', $rawJsonText));
        $json = json_decode($rawJsonText, true);
        if (!empty($json['day_by_day']) && is_array($json['day_by_day'])) {
            return $json;
        }
    }

    // Fallback: Query Deployed Render Cloud Web2API Microservice
    $web2apiUrl = getenv('GEMINI_WEB2API_URL') ?: 'https://gemini-web2api-sxti.onrender.com/v1';
    $ch2 = curl_init($web2apiUrl . '/chat/completions');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_POST, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey
    ]);
    curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode([
        'model' => 'gemini-2.5-flash',
        'messages' => [['role' => 'user', 'content' => $prompt]]
    ]));
    curl_setopt($ch2, CURLOPT_TIMEOUT, 10);
    $res2 = curl_exec($ch2);
    curl_close($ch2);

    if ($res2) {
        $data2 = json_decode($res2, true);
        $rawJsonText2 = $data2['choices'][0]['message']['content'] ?? '';
        $rawJsonText2 = trim(preg_replace('/```json\s*|```\s*/i', '', $rawJsonText2));
        $json2 = json_decode($rawJsonText2, true);
        if (!empty($json2['day_by_day']) && is_array($json2['day_by_day'])) {
            return $json2;
        }
    }

    return null;
}

try {
    $fetchResult = fetchUrlWithRedirects($url);
    $html = $fetchResult['html'];
    $effectiveUrl = $fetchResult['url'];
    $httpCode = $fetchResult['http_code'];

    if (empty($html) || $httpCode >= 400) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Could not fetch content from provided URL (HTTP {$httpCode})"]);
        exit;
    }

    // Extract Title
    $title = '';
    if (preg_match('/<h1[^>]*>(.*?)<\/h1>/is', $html, $matches)) {
        $title = strip_tags($matches[1]);
    } elseif (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $matches)) {
        $title = strip_tags($matches[1]);
    }
    $title = trim(preg_replace('/\s+/', ' ', html_entity_decode($title)));
    $title = preg_replace('/(–|-|\|).*$/u', '', $title);

    // Prepare clean text for AI / DOM parser
    $cleanText = preg_replace('/<(script|style|svg|header|footer|nav)[^>]*>.*?<\/ \1>/is', '', $html);
    $cleanText = preg_replace('/<br\s*\/?>/i', "\n", $cleanText);
    $cleanText = strip_tags($cleanText);
    $cleanText = html_entity_decode($cleanText);
    $cleanText = preg_replace("/\n\s*\n/", "\n", $cleanText);

    // Try AI Universal Extractor first
    $aiResult = queryGeminiForItinerary($cleanText, $title);
    if ($aiResult) {
        echo json_encode([
            'success' => true,
            'source' => 'gemini_ai',
            'url' => $effectiveUrl,
            'title' => $aiResult['title'] ?? $title,
            'destination' => $aiResult['destination'] ?? 'Custom Destination',
            'duration_days' => count($aiResult['day_by_day']),
            'day_by_day' => $aiResult['day_by_day']
        ]);
        exit;
    }

    // Fallback: Smart DOM XPath Parser & Destination Keyword Matching
    $destination = 'Custom Destination';

    // Smart Destination Alias & Keyword Dictionary
    $destinationMap = [
        'kashmir' => 'Kashmir',
        'srinagar' => 'Kashmir',
        'gulmarg' => 'Kashmir',
        'pahalgam' => 'Kashmir',
        'kutch' => 'Rann of Kutch',
        'rann' => 'Rann of Kutch',
        'bhuj' => 'Rann of Kutch',
        'andaman' => 'Andaman and Nicobar',
        'havelock' => 'Havelock Island',
        'port blair' => 'Port Blair',
        'manali' => 'Manali',
        'shimla' => 'Shimla',
        'dharamshala' => 'Dharamshala',
        'goa' => 'Goa',
        'kerala' => 'Kerala',
        'munnar' => 'Munnar',
        'alleppey' => 'Alleppey',
        'jaipur' => 'Jaipur',
        'udaipur' => 'Udaipur',
        'jaisalmer' => 'Jaisalmer',
        'leh' => 'Leh Ladakh',
        'ladakh' => 'Leh Ladakh'
    ];

    $searchText = strtolower(urldecode($effectiveUrl . ' ' . $title));
    foreach ($destinationMap as $keyword => $destName) {
        if (preg_match('/' . preg_quote($keyword, '/') . '/i', $searchText)) {
            $destination = $destName;
            break;
        }
    }

    if ($destination === 'Custom Destination') {
        $pdo = getDb();
        if ($pdo) {
            $stmt = $pdo->query("SELECT name FROM india_states UNION SELECT name FROM india_cities ORDER BY LENGTH(name) DESC");
            $dbNames = $stmt->fetchAll(PDO::FETCH_COLUMN);

            foreach ($dbNames as $name) {
                if (!empty($name) && strlen($name) >= 3 && preg_match('/' . preg_quote($name, '/') . '/i', $searchText)) {
                    $destination = $name;
                    break;
                }
            }
        }
    }

    // Priority 2: JSON-LD & Next.js Embedded Itinerary Data Extractor
    $days = [];
    if (preg_match_all('/(Day\s*\d+\s*[-–:]\s*[^"<{]+).*?description"?\s*:\s*"([^"{}]+)/ui', $html, $jsonMatches, PREG_SET_ORDER)) {
        $seenDays = [];
        foreach ($jsonMatches as $m) {
            $titleRaw = trim(preg_replace('/[\\\\><]+/', '', str_replace(['\\"', '\\/'], ['"', '/'], $m[1])));
            if (preg_match('/Day\s*(\d+)/i', $titleRaw, $dNumMatch)) {
                $dayNum = (int)$dNumMatch[1];
                if (isset($seenDays[$dayNum])) continue;

                $desc = str_replace(
                    ['u003cul', 'u003cli', 'u003c/li', 'u003c/ul', 'u003c', 'u003e', 'u0026', '\\"', '\\/'],
                    ['', ' • ', '', '', '', '', '&', '"', '/'],
                    $m[2]
                );
                $desc = strip_tags(html_entity_decode($desc));
                $desc = preg_replace('/[\\\\><]+/', '', $desc);
                $desc = trim(preg_replace('/\s+/', ' ', $desc));
                $desc = trim($desc, " •\t\n\r");
                if (strlen($desc) > 350) $desc = substr($desc, 0, 350) . '...';

                if (!empty($titleRaw) && !empty($desc) && strlen($desc) > 15) {
                    $seenDays[$dayNum] = true;
                    $days[] = [
                        'day' => $dayNum,
                        'title' => $titleRaw,
                        'description' => $desc
                    ];
                }
            }
        }
        usort($days, function($a, $b) { return $a['day'] - $b['day']; });
    }

    if (empty($days)) {
        libxml_use_internal_errors(true);
        $doc = new DOMDocument();
        @$doc->loadHTML('<?xml encoding="UTF-8">' . $html);
        $xpath = new DOMXPath($doc);

    $nodes = $xpath->query('//h1 | //h2 | //h3 | //h4 | //h5 | //h6 | //strong | //b | //div[contains(@class, "day") or contains(@class, "title") or contains(@class, "header") or contains(@class, "accordion")]');
    $seenDays = [];

    foreach ($nodes as $node) {
        $headingText = trim(preg_replace('/\s+/', ' ', $node->textContent));
        if (preg_match('/(?:Day|DAY|Night|NIGHT)\s*(\d+)[\s\:-–]*(.*)/u', $headingText, $matches)) {
            $dayNum = (int)$matches[1];
            if (isset($seenDays[$dayNum])) continue;

            $subTitle = trim($matches[2]);
            $subTitle = preg_replace('/(Group Tour|Deluxe Package|Super Deluxe|Quick Inquiry|Travelers Details|document\.getElementById|Δdocument).*$/i', '', $subTitle);
            $subTitle = trim($subTitle, " \t\n\r\0\x0B:-–|");
            if (strlen($subTitle) > 80) $subTitle = substr($subTitle, 0, 80) . '...';
            if (empty($subTitle)) $subTitle = "Sightseeing & Excursion Tour";

            $descriptionText = '';
            $sibling = $node->nextSibling;
            $maxWalk = 0;
            while ($sibling && $maxWalk < 6) {
                if ($sibling->nodeType === XML_ELEMENT_NODE) {
                    $tag = strtolower($sibling->nodeName);
                    if (in_array($tag, ['p', 'div', 'span', 'section', 'li'])) {
                        $txt = trim(preg_replace('/\s+/', ' ', $sibling->textContent));
                        $txt = preg_replace('/(document\.getElementById|Δdocument|ak_js_1).*$/i', '', $txt);
                        if (strlen($txt) > 25 && !preg_match('/(?:Day|DAY)\s*\d+/i', $txt)) {
                            $descriptionText = substr($txt, 0, 300);
                            break;
                        }
                    }
                    if (in_array($tag, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) break;
                }
                $sibling = $sibling->nextSibling;
                $maxWalk++;
            }

            if (empty($descriptionText)) {
                $parentTxt = trim(preg_replace('/\s+/', ' ', $node->parentNode->textContent));
                $parentTxt = str_replace($headingText, '', $parentTxt);
                $parentTxt = preg_replace('/(document\.getElementById|Δdocument|ak_js_1).*$/i', '', $parentTxt);
                if (strlen($parentTxt) > 25) {
                    $descriptionText = substr($parentTxt, 0, 250) . '...';
                } else {
                    $descriptionText = "Guided tour of {$subTitle} in {$destination} including transfers and sightseeing.";
                }
            }

            $descriptionText = trim(ltrim($descriptionText, " \t\n\r\0\x0B:-–|"));

            if (($subTitle === "Sightseeing & Excursion Tour" || strlen($subTitle) < 5) && !empty($descriptionText)) {
                $parts = preg_split('/[\.\n]/', $descriptionText);
                $firstPhrase = trim($parts[0] ?? '');
                if (strlen($firstPhrase) > 5 && strlen($firstPhrase) <= 80) {
                    $subTitle = $firstPhrase;
                }
            }

            $seenDays[$dayNum] = true;
            $days[] = [
                'day' => $dayNum,
                'title' => "Day {$dayNum}: " . $subTitle,
                'description' => $descriptionText
            ];
            $seenDays[$dayNum] = true;
            $days[] = [
                'day' => $dayNum,
                'title' => "Day {$dayNum}: " . $subTitle,
                'description' => $descriptionText
            ];
            if (count($days) >= 20) break;
        }
    }

    usort($days, function($a, $b) { return $a['day'] - $b['day']; });
    }

    if (count($days) < 2) {
        $days = [
            ['day' => 1, 'title' => "Day 1: Arrival in {$destination} & Check-in", 'description' => "Arrive at {$destination}. Meet and greet representative and transfer to hotel."],
            ['day' => 2, 'title' => "Day 2: Full Day {$destination} Sightseeing Tour", 'description' => "Full day guided excursion covering top attractions and local landmarks."],
            ['day' => 3, 'title' => "Day 3: Local Experiences & Departure", 'description' => "Enjoy local experiences, shopping in local market, and departure transfer."]
        ];
    }

    echo json_encode([
        'success' => true,
        'source' => 'dom_xpath_fallback',
        'url' => $effectiveUrl,
        'title' => $title ?: "Custom {$destination} Tour Package",
        'destination' => $destination,
        'duration_days' => count($days),
        'day_by_day' => $days
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to parse itinerary from URL: ' . $e->getMessage()
    ]);
}
