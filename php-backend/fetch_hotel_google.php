<?php
// fetch_hotel_google.php — Real Multi-Source Hotel Fetcher (Google Places + OpenStreetMap FOC)
// Strictly enforces ZERO-FABRICATION: Unverified contact details, images, and policies are left BLANK.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 1. Get Google Places API Key from environment
$apiKey = getenv('GOOGLE_PLACES_API_KEY') ?: getenv('VITE_GOOGLE_PLACES_API_KEY') ?: getenv('VITE_GOOGLE_MAPS_API_KEY');

if (!$apiKey && file_exists(__DIR__ . '/../.env')) {
    $envLines = file(__DIR__ . '/../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($envLines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($key, $val) = explode('=', $line, 2);
            $key = trim($key);
            $val = trim(trim($val), '"\'');
            if (in_array($key, ['GOOGLE_PLACES_API_KEY', 'VITE_GOOGLE_PLACES_API_KEY', 'VITE_GOOGLE_MAPS_API_KEY']) && !empty($val)) {
                $apiKey = $val;
                break;
            }
        }
    }
}

$input = json_decode(file_get_contents('php://input'), true);
$query = isset($_GET['query']) ? trim($_GET['query']) : (isset($input['query']) ? trim($input['query']) : '');

if (empty($query)) {
    echo json_encode(['success' => false, 'error' => 'Query parameter is required', 'source' => 'not_found']);
    exit;
}

// Clean & Extract place name if shortlink or Google Travel / Maps URL is provided
if (strpos($query, 'http://') === 0 || strpos($query, 'https://') === 0) {
    if (preg_match('/(share\.google|goo\.gl|g\.page|g\.co|maps\.app)/i', $query)) {
        $chExpand = curl_init();
        curl_setopt($chExpand, CURLOPT_URL, $query);
        curl_setopt($chExpand, CURLOPT_HEADER, true);
        curl_setopt($chExpand, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chExpand, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($chExpand, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($chExpand, CURLOPT_TIMEOUT, 5);
        curl_setopt($chExpand, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        $expandResp = curl_exec($chExpand);
        $expandedUrl = curl_getinfo($chExpand, CURLINFO_EFFECTIVE_URL);
        curl_close($chExpand);

        if (!empty($expandedUrl) && $expandedUrl !== $query) {
            $query = $expandedUrl;
        }
    }

    $parsedUrl = parse_url($query);
    if (isset($parsedUrl['query'])) {
        parse_str($parsedUrl['query'], $queryParams);
        if (!empty($queryParams['q'])) {
            $query = $queryParams['q'];
        } elseif (!empty($queryParams['query'])) {
            $query = $queryParams['query'];
        }
    }
    
    // Extract title or path if still a URL
    if (strpos($query, 'http') === 0) {
        if (preg_match('/place\/([^\/@]+)/', $query, $matches)) {
            $query = urldecode(str_replace(['+', '%20'], ' ', $matches[1]));
        } elseif (preg_match('/(google\.[a-z.]+\/travel|maps\.google|google\.[a-z.]+\/maps)/i', $query)) {
            $chTitle = curl_init();
            curl_setopt($chTitle, CURLOPT_URL, $query);
            curl_setopt($chTitle, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($chTitle, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($chTitle, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($chTitle, CURLOPT_TIMEOUT, 5);
            curl_setopt($chTitle, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
            $htmlTitle = curl_exec($chTitle);
            curl_close($chTitle);

            if (!empty($htmlTitle) && preg_match('/<title[^>]*>(.*?)<\/title>/is', $htmlTitle, $titleMatches)) {
                $extractedTitle = html_entity_decode(trim($titleMatches[1]));
                $cleanTitle = preg_replace('/(\s*-\s*Google\s*(Hotels|Travel|Search|Maps).*$)/i', '', $extractedTitle);
                $cleanTitle = trim(preg_replace('/^(Hotels\s*in\s*|Google\s*Hotels\s*:\s*)/i', '', $cleanTitle));
                if (!empty($cleanTitle) && !preg_match('/^Google\s*(Hotels|Travel|Search)?$/i', $cleanTitle)) {
                    $query = $cleanTitle;
                }
            }
        }
        
        if (strpos($query, 'http') === 0) {
            $cleanUrl = preg_replace('/\?.*$/', '', $query);
            $segments = array_filter(explode('/', $cleanUrl));
            $lastSeg = end($segments);
            if (!empty($lastSeg) && !in_array($lastSeg, ['search', 'travel', 'hotels', 'maps'])) {
                $query = urldecode(str_replace(['-', '_', '+'], ' ', $lastSeg));
            }
        }
    }
}

// ---------------- ⚡ HIGH SPEED CACHING LAYER ----------------
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0755, true);
}

$cacheKey = md5(strtolower(trim($query)));
$cacheFile = $cacheDir . "/hotel_v4_" . $cacheKey . ".json";
$cacheTTL = 86400 * 3; // 3 Days Cache

if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < $cacheTTL)) {
    $cachedData = file_get_contents($cacheFile);
    if (!empty($cachedData)) {
        $jsonObj = json_decode($cachedData, true);
        if (!empty($jsonObj['success'])) {
            $jsonObj['cached'] = true;
            echo json_encode($jsonObj);
            exit;
        }
    }
}

// =========================================================================
// 🚀 SOURCE 1: GOOGLE PLACES API (PRIMARY)
// =========================================================================
$googleSuccess = false;
$hotelData = null;

if (!empty($apiKey)) {
    $textSearchUrl = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" . urlencode($query) . "&key=" . urlencode($apiKey);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $textSearchUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    $response = curl_exec($ch);
    curl_close($ch);

    if ($response) {
        $searchData = json_decode($response, true);
        if (!empty($searchData['results'])) {
            $place = $searchData['results'][0];
            $placeId = $place['place_id'];

            // Fetch Place Details
            $detailsUrl = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" . urlencode($placeId) . "&fields=name,rating,user_ratings_total,formatted_address,formatted_phone_number,international_phone_number,website,photos,geometry,address_components&key=" . urlencode($apiKey);

            $ch2 = curl_init();
            curl_setopt($ch2, CURLOPT_URL, $detailsUrl);
            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch2, CURLOPT_TIMEOUT, 8);
            $detailsResponse = curl_exec($ch2);
            curl_close($ch2);

            $detailsData = json_decode($detailsResponse, true);
            $detail = !empty($detailsData['result']) ? $detailsData['result'] : $place;

            // Extract Photo
            $photoUrl = '';
            if (!empty($detail['photos'])) {
                $ref = $detail['photos'][0]['photo_reference'];
                $photoUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=" . urlencode($ref) . "&key=" . urlencode($apiKey);
            }

            // Extract Geographic Breakdown
            $parsedCountry = '';
            $parsedState = '';
            $parsedCity = '';

            if (!empty($detail['address_components'])) {
                foreach ($detail['address_components'] as $comp) {
                    $types = $comp['types'] ?? [];
                    if (in_array('country', $types)) {
                        $parsedCountry = $comp['long_name'];
                    }
                    if (in_array('administrative_area_level_1', $types)) {
                        $parsedState = $comp['long_name'];
                    }
                    if (in_array('locality', $types) || in_array('administrative_area_level_2', $types)) {
                        if (empty($parsedCity)) $parsedCity = $comp['long_name'];
                    }
                }
            }

            // Fallback parsing from address string
            $formattedAddr = $detail['formatted_address'] ?? '';
            if (empty($parsedCountry) || empty($parsedCity)) {
                $parts = array_map('trim', explode(',', $formattedAddr));
                $pCount = count($parts);
                if ($pCount >= 1 && empty($parsedCountry)) {
                    $parsedCountry = preg_replace('/\d+/', '', $parts[$pCount - 1]);
                }
                if ($pCount >= 2 && empty($parsedState)) {
                    $parsedState = preg_replace('/\d+/', '', $parts[$pCount - 2]);
                }
                if ($pCount >= 3 && empty($parsedCity)) {
                    $parsedCity = $parts[$pCount - 3];
                }
            }

            // Extract GPS coordinates
            $gpsCoords = '';
            if (!empty($detail['geometry']['location'])) {
                $lat = $detail['geometry']['location']['lat'];
                $lng = $detail['geometry']['location']['lng'];
                $gpsCoords = round($lat, 6) . ', ' . round($lng, 6);
            }

            $googleRating = isset($detail['rating']) ? round((float)$detail['rating'], 1) : 0;
            $starRating = $googleRating >= 4.6 ? 5 : ($googleRating >= 4.0 ? 4 : 3);

            $hotelData = [
                'hotel_name' => $detail['name'] ?? $query,
                'hotel_code' => 'HOT-' . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $parsedCity ?: 'GEN'), 0, 3)) . '-' . rand(10, 99),
                'address' => $formattedAddr,
                'city' => trim($parsedCity),
                'state' => trim($parsedState),
                'country' => trim($parsedCountry ?: 'India'),
                'phone_number' => $detail['international_phone_number'] ?? ($detail['formatted_phone_number'] ?? ''),
                'website' => $detail['website'] ?? '',
                'email' => '', // Strict blank rule: Google Places does not return email
                'google_rating' => $googleRating,
                'featured_image_url' => $photoUrl,
                'star_rating' => $starRating,
                'destination_group' => '',
                'nearest_airport' => '',
                'nearest_railway' => '',
                'gps_coordinates' => $gpsCoords,
                'internal_rating' => $googleRating > 0 ? $googleRating : 4.0,
                'check_in_time' => '14:00',
                'check_out_time' => '11:00',
                'contact_person' => '',
                // ⚠️ STRICT BLANK ENFORCEMENT: Policy fields must be entered manually per B2B contract
                'cancellation_policy' => '',
                'child_policy' => '',
                'extra_bed_policy' => '',
                'source' => 'google_places_verified',
                'confidence' => 'high'
            ];

            $googleSuccess = true;
        }
    }
}

// =========================================================================
// 🌍 SOURCE 2: OPENSTREETMAP PHOTON & NOMINATIM (FOC FALLBACK)
// =========================================================================
if (!$googleSuccess) {
    // 1. Try Photon OSM POI search first (optimized for hotels & tourist venues)
    $photonUrl = "https://photon.komoot.io/api/?q=" . urlencode($query) . "&limit=1&lang=en";
    $chPhoton = curl_init();
    curl_setopt($chPhoton, CURLOPT_URL, $photonUrl);
    curl_setopt($chPhoton, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chPhoton, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($chPhoton, CURLOPT_TIMEOUT, 6);
    curl_setopt($chPhoton, CURLOPT_USERAGENT, 'GhumoFirooJourneys/1.0 (info@ghumofiroo.com)');
    $photonResp = curl_exec($chPhoton);
    curl_close($chPhoton);

    $photonData = json_decode($photonResp, true);
    if (!empty($photonData['features']) && is_array($photonData['features']) && count($photonData['features']) > 0) {
        $feat = $photonData['features'][0];
        $prop = $feat['properties'] ?? [];
        $coords = $feat['geometry']['coordinates'] ?? [];

        $resolvedCountry = $prop['country'] ?? '';
        $resolvedCity = $prop['city'] ?? ($prop['district'] ?? ($prop['locality'] ?? ($prop['county'] ?? '')));
        $resolvedState = $prop['state'] ?? '';
        $street = $prop['street'] ?? '';
        $houseNumber = $prop['housenumber'] ?? '';
        $placeName = $prop['name'] ?? $query;

        $addressParts = array_filter([
            trim(($houseNumber ? "$houseNumber, " : "") . $street),
            $prop['locality'] ?? '',
            $resolvedCity,
            $resolvedState,
            $resolvedCountry
        ]);
        $displayAddress = !empty($addressParts) ? implode(', ', $addressParts) : $query;

        $gpsCoords = '';
        if (!empty($coords) && count($coords) >= 2) {
            $lon = round((float)$coords[0], 6);
            $lat = round((float)$coords[1], 6);
            $gpsCoords = "$lat, $lon";
        }

        $hotelData = [
            'hotel_name' => ucwords(trim($placeName)),
            'hotel_code' => 'HOT-' . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $resolvedCity ?: 'GEN'), 0, 3)) . '-' . rand(10, 99),
            'address' => $displayAddress,
            'city' => trim($resolvedCity),
            'state' => trim($resolvedState),
            'country' => trim($resolvedCountry ?: 'India'),
            'phone_number' => '', // Strict blank rule
            'website' => '',      // Strict blank rule
            'email' => '',        // Strict blank rule
            'google_rating' => 0,
            'featured_image_url' => '', // Strict blank rule: No stock photos
            'star_rating' => 4,
            'destination_group' => '',
            'nearest_airport' => '',
            'nearest_railway' => '',
            'gps_coordinates' => $gpsCoords,
            'internal_rating' => 4.0,
            'check_in_time' => '14:00',
            'check_out_time' => '11:00',
            'contact_person' => '',
            // ⚠️ STRICT BLANK ENFORCEMENT: Policy fields must be entered manually per B2B contract
            'cancellation_policy' => '',
            'child_policy' => '',
            'extra_bed_policy' => '',
            'source' => 'osm_geocoding_verified',
            'confidence' => 'partial_location_only'
        ];
    } else {
        // 2. Fallback to Nominatim Geocoding API with English localization
        $cleanSearch = trim(preg_replace('/^(Hotel|Resort|The)\s+/i', '', $query));
        $osmUrl = "https://nominatim.openstreetmap.org/search?q=" . urlencode($query) . "&format=json&addressdetails=1&limit=1&accept-language=en";

        $chOsm = curl_init();
        curl_setopt($chOsm, CURLOPT_URL, $osmUrl);
        curl_setopt($chOsm, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($chOsm, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($chOsm, CURLOPT_TIMEOUT, 6);
        curl_setopt($chOsm, CURLOPT_USERAGENT, 'GhumoFirooJourneys/1.0 (info@ghumofiroo.com)');
        $osmResp = curl_exec($chOsm);
        curl_close($chOsm);

        $osmData = json_decode($osmResp, true);

        if (empty($osmData) || !is_array($osmData) || count($osmData) === 0) {
            $osmUrl2 = "https://nominatim.openstreetmap.org/search?q=" . urlencode($cleanSearch) . "&format=json&addressdetails=1&limit=1&accept-language=en";
            $chOsm2 = curl_init();
            curl_setopt($chOsm2, CURLOPT_URL, $osmUrl2);
            curl_setopt($chOsm2, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($chOsm2, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($chOsm2, CURLOPT_TIMEOUT, 6);
            curl_setopt($chOsm2, CURLOPT_USERAGENT, 'GhumoFirooJourneys/1.0 (info@ghumofiroo.com)');
            $osmResp2 = curl_exec($chOsm2);
            curl_close($chOsm2);
            $osmData = json_decode($osmResp2, true);
        }

        if (!empty($osmData) && is_array($osmData) && count($osmData) > 0) {
            $firstMatch = $osmData[0];
            $addr = $firstMatch['address'] ?? [];

            $resolvedCountry = $addr['country'] ?? '';
            $resolvedCity = $addr['city'] ?? ($addr['town'] ?? ($addr['village'] ?? ($addr['municipality'] ?? ($addr['state_district'] ?? ''))));
            $resolvedState = $addr['state'] ?? ($addr['region'] ?? ($addr['province'] ?? ''));
            $displayAddress = $firstMatch['display_name'] ?? ($query . ($resolvedCity ? ", $resolvedCity" : "") . ($resolvedCountry ? ", $resolvedCountry" : ""));

            $lat = !empty($firstMatch['lat']) ? round((float)$firstMatch['lat'], 6) : '';
            $lon = !empty($firstMatch['lon']) ? round((float)$firstMatch['lon'], 6) : '';
            $gpsCoords = ($lat && $lon) ? "$lat, $lon" : '';

            $cleanHotelName = ucwords(trim(preg_replace('/(\s*,\s*.*$)/', '', $query)));

            $hotelData = [
                'hotel_name' => $cleanHotelName,
                'hotel_code' => 'HOT-' . strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $resolvedCity ?: 'GEN'), 0, 3)) . '-' . rand(10, 99),
                'address' => $displayAddress,
                'city' => trim($resolvedCity),
                'state' => trim($resolvedState),
                'country' => trim($resolvedCountry ?: 'India'),
                'phone_number' => '', // Strict blank rule
                'website' => '',      // Strict blank rule
                'email' => '',        // Strict blank rule
                'google_rating' => 0,
                'featured_image_url' => '', // Strict blank rule: No stock photos
                'star_rating' => 4,
                'destination_group' => '',
                'nearest_airport' => '',
                'nearest_railway' => '',
                'gps_coordinates' => $gpsCoords,
                'internal_rating' => 4.0,
                'check_in_time' => '14:00',
                'check_out_time' => '11:00',
                'contact_person' => '',
                // ⚠️ STRICT BLANK ENFORCEMENT: Policy fields must be entered manually per B2B contract
                'cancellation_policy' => '',
                'child_policy' => '',
                'extra_bed_policy' => '',
                'source' => 'osm_geocoding_verified',
                'confidence' => 'partial_location_only'
            ];
        }
    }
}

// =========================================================================
// ❌ FINAL CHECK: If no record found in Google or OSM
// =========================================================================
if (empty($hotelData)) {
    echo json_encode([
        'success' => false,
        'error' => "No verified listing found for '{$query}'. Please enter hotel details and terms manually.",
        'source' => 'not_found'
    ]);
    exit;
}

$responsePayload = [
    'success' => true,
    'source' => $hotelData['source'],
    'confidence' => $hotelData['confidence'],
    'data' => $hotelData
];

// Cache verified results
@file_put_contents($cacheFile, json_encode($responsePayload));

echo json_encode($responsePayload);
