<?php
// php-backend/api/hotels/HotelModel.php — Domain Data Access & Schema Resolution for Hotels
// Ghumo Firoo Journeys Enterprise Architecture

require_once __DIR__ . '/../../db.php';

class HotelModel
{
    private static ?string $cityNameCol = null;
    private static ?string $stateNameCol = null;
    private static ?string $countryNameCol = null;
    private static ?array $hotelColumns = null;

    /**
     * Resolve the exact name column in `cities` table ('city_name' or 'name')
     */
    public static function getCityNameColumn(PDO $pdo): string
    {
        if (self::$cityNameCol === null) {
            try {
                $stmt = $pdo->prepare(
                    "SELECT COLUMN_NAME FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cities'
                       AND COLUMN_NAME IN ('city_name', 'name')
                     ORDER BY FIELD(COLUMN_NAME, 'city_name', 'name') LIMIT 1"
                );
                $stmt->execute();
                self::$cityNameCol = $stmt->fetchColumn() ?: 'city_name';
            } catch (Throwable $e) {
                self::$cityNameCol = 'city_name';
            }
        }
        return self::$cityNameCol;
    }

    /**
     * Resolve the exact name column in `states` table ('state_name' or 'name')
     */
    public static function getStateNameColumn(PDO $pdo): string
    {
        if (self::$stateNameCol === null) {
            try {
                $stmt = $pdo->prepare(
                    "SELECT COLUMN_NAME FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'states'
                       AND COLUMN_NAME IN ('state_name', 'name')
                     ORDER BY FIELD(COLUMN_NAME, 'state_name', 'name') LIMIT 1"
                );
                $stmt->execute();
                self::$stateNameCol = $stmt->fetchColumn() ?: 'state_name';
            } catch (Throwable $e) {
                self::$stateNameCol = 'state_name';
            }
        }
        return self::$stateNameCol;
    }

    /**
     * Resolve the exact name column in `countries` table ('country_name' or 'name')
     */
    public static function getCountryNameColumn(PDO $pdo): string
    {
        if (self::$countryNameCol === null) {
            try {
                $stmt = $pdo->prepare(
                    "SELECT COLUMN_NAME FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'countries'
                       AND COLUMN_NAME IN ('country_name', 'name')
                     ORDER BY FIELD(COLUMN_NAME, 'country_name', 'name') LIMIT 1"
                );
                $stmt->execute();
                self::$countryNameCol = $stmt->fetchColumn() ?: 'country_name';
            } catch (Throwable $e) {
                self::$countryNameCol = 'country_name';
            }
        }
        return self::$countryNameCol;
    }

    /**
     * Retrieve live physical column list for `hotels` table to guard against phantom columns
     */
    public static function getColumns(PDO $pdo): array
    {
        if (self::$hotelColumns === null) {
            try {
                $q = $pdo->query("DESCRIBE `hotels`");
                self::$hotelColumns = $q->fetchAll(PDO::FETCH_COLUMN) ?: [];
            } catch (Throwable $e) {
                self::$hotelColumns = [];
            }
        }
        return self::$hotelColumns;
    }

    /**
     * Safely resolve or link city_id across cities and india_cities tables
     */
    public static function resolveCityId(PDO $pdo, ?string $cityName, ?string $stateName = null, ?string $countryName = null): ?int
    {
        if (empty($cityName)) return null;

        $cityName = trim($cityName);
        $stateName = $stateName ? trim($stateName) : 'Uttarakhand'; 
        $countryName = $countryName ? trim($countryName) : 'India';
        $cityCol = self::getCityNameColumn($pdo);
        $stateCol = self::getStateNameColumn($pdo);

        // 1. Search in primary cities table
        $stmt = $pdo->prepare("SELECT id FROM cities WHERE LOWER(`$cityCol`) = LOWER(?) OR LOWER(name) = LOWER(?) LIMIT 1");
        $stmt->execute([$cityName, $cityName]);
        $cityRow = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($cityRow) {
            return (int)$cityRow['id'];
        }

        // 2. Search in india_cities table if it exists
        try {
            $stmt = $pdo->prepare("SELECT id FROM india_cities WHERE LOWER(name) = LOWER(?) LIMIT 1");
            $stmt->execute([$cityName]);
            $indiaCityRow = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($indiaCityRow) {
                $id = (int)$indiaCityRow['id'];
                try {
                    $ins = $pdo->prepare("INSERT IGNORE INTO cities (id, name, city_name, state) VALUES (?, ?, ?, ?)");
                    $ins->execute([$id, $cityName, $cityName, $stateName]);
                } catch (Throwable $e) {}
                return $id;
            }
        } catch (Throwable $e) {}

        // 3. Resolve state_id safely
        $stateId = 1; 
        if (!empty($stateName)) {
            try {
                $st = $pdo->prepare("SELECT id FROM states WHERE LOWER(`$stateCol`) LIKE LOWER(?) LIMIT 1");
                $st->execute(["%$stateName%"]);
                $stRow = $st->fetch(PDO::FETCH_ASSOC);
                if ($stRow) {
                    $stateId = (int)$stRow['id'];
                }
            } catch (Throwable $e) {
                try {
                    $st = $pdo->prepare("SELECT id FROM india_states WHERE LOWER(name) LIKE LOWER(?) LIMIT 1");
                    $st->execute(["%$stateName%"]);
                    $stRow = $st->fetch(PDO::FETCH_ASSOC);
                    if ($stRow) {
                        $stateId = (int)$stRow['id'];
                    }
                } catch (Throwable $e2) {}
            }
        }

        // 4. Create new city in india_cities and cities
        try {
            $ins = $pdo->prepare("INSERT INTO india_cities (name, state_id) VALUES (?, ?)");
            $ins->execute([$cityName, $stateId]);
            $newId = (int)$pdo->lastInsertId();

            try {
                $insCities = $pdo->prepare("INSERT IGNORE INTO cities (id, name, city_name, state) VALUES (?, ?, ?, ?)");
                $insCities->execute([$newId, $cityName, $cityName, $stateName]);
            } catch (Throwable $e) {}

            return $newId;
        } catch (Throwable $e) {
            return null;
        }
    }

    /**
     * Decode JSON attributes, cast numeric and boolean values
     */
    public static function parseRow(array $row): array
    {
        $jsonCols = ['photos', 'meal_plan_supported', 'gallery_urls', 'video_urls'];
        foreach ($jsonCols as $field) {
            if (isset($row[$field]) && is_string($row[$field])) {
                $decoded = json_decode($row[$field], true);
                if ($decoded === null && !empty($row[$field])) {
                    // Try comma-separated fallback for meal_plan_supported
                    $parts = array_map('trim', explode(',', $row[$field]));
                    $row[$field] = array_values(array_filter($parts));
                } else {
                    $row[$field] = $decoded !== null ? $decoded : [];
                }
            } elseif (!isset($row[$field]) || $row[$field] === null) {
                if ($field === 'meal_plan_supported') {
                    $row[$field] = ['EP', 'CP', 'MAP'];
                } else {
                    $row[$field] = [];
                }
            }
        }

        if (isset($row['star_rating']))    $row['star_rating']    = (int)$row['star_rating'];
        if (isset($row['google_rating']))  $row['google_rating']  = (float)$row['google_rating'];
        if (isset($row['internal_rating'])) $row['internal_rating'] = (float)$row['internal_rating'];
        if (isset($row['active']))         $row['active']         = (bool)$row['active'];
        if (isset($row['active_status']))  $row['active_status']  = (bool)$row['active_status'];
        return $row;
    }

    /**
     * Build clean key-value pair map filtered to existing DB columns
     */
    public static function buildData(array $input, array $columns): array
    {
        $data = [];
        foreach ($input as $key => $val) {
            if ($key === 'id') continue;
            if (!in_array($key, $columns, true)) continue;
            if (is_array($val) || is_object($val)) {
                $data[$key] = json_encode($val);
            } else {
                $data[$key] = $val;
            }
        }
        return $data;
    }

    /**
     * Master contracted hotels fallback for registry lookup
     */
    public static function getFallbackHotel(string $id): ?array
    {
        static $masterHotels = null;

        if ($masterHotels === null) {
            $jsonPath = __DIR__ . '/../../contractedHotels.json';
            if (!file_exists($jsonPath)) {
                $jsonPath = __DIR__ . '/../../../src/data/contractedHotels.json';
            }
            if (file_exists($jsonPath)) {
                $content = file_get_contents($jsonPath);
                $masterHotels = json_decode($content, true) ?: [];
            } else {
                $masterHotels = [];
            }
        }

        $idx = -1;
        if (preg_match('/^contracted-hotel-(\d+)$/', $id, $matches)) {
            $idx = (int)$matches[1] - 1;
        }

        if ($idx >= 0 && isset($masterHotels[$idx])) {
            $h = $masterHotels[$idx];
            $cityName = trim($h['city'] ?? 'Uttarakhand');
            $cleanName = trim($h['name'] ?? 'Contracted Hotel');
            $cat = strtolower($h['cat_or_room'] ?? '');
            $stars = 3;
            if (strpos($cat, 'luxury') !== false || strpos($cat, 'premium') !== false) {
                $stars = 5;
            } elseif (strpos($cat, 'standard') !== false || strpos($cat, 'deluxe') !== false) {
                $stars = 4;
            }

            $codePrefix = strtoupper(preg_replace('/[^A-Z]/', 'H', substr($cleanName, 0, 4)));
            $codeCity = strtoupper(preg_replace('/[^A-Z]/', 'CT', substr($cityName, 0, 3)));
            $hotelCode = "{$codePrefix}-{$codeCity}-" . ($idx + 101);

            $images = [
                'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
            ];

            return [
                'id' => $id,
                'hotel_name' => $cleanName,
                'hotel_code' => $hotelCode,
                'star_rating' => $stars,
                'city' => $cityName,
                'state' => $h['state'] ?? 'Uttarakhand',
                'country' => $h['country'] ?? 'India',
                'google_rating' => round(4.1 + ($idx % 8) * 0.1, 1),
                'internal_rating' => round(4.3 + ($idx % 6) * 0.1, 1),
                'contact_number' => '+91 98765 ' . (10000 + $idx),
                'email' => 'reservations@' . preg_replace('/[^a-z0-9]/', '', strtolower($cleanName)) . '.com',
                'meal_plan_supported' => ['EP', 'CP', 'MAP', 'AP'],
                'featured_image_url' => $images[$idx % count($images)],
                'cat_or_room' => $h['cat_or_room'] ?? 'Standard',
                'b2b_cost' => $h['b2b_cost'] ?? 3000,
                'address' => "{$cleanName}, {$cityName}, " . ($h['state'] ?? 'Uttarakhand') . ", " . ($h['country'] ?? 'India'),
                'active_status' => true,
                'active' => true
            ];
        }

        if (strpos($id, 'contracted-hotel-') === 0) {
            $num = str_replace('contracted-hotel-', '', $id);
            return [
                'id' => $id,
                'hotel_name' => 'Contracted Hotel ' . $num,
                'hotel_code' => 'CONT-HOTEL-' . $num,
                'star_rating' => 3,
                'city' => 'Uttarakhand',
                'state' => 'Uttarakhand',
                'country' => 'India',
                'meal_plan_supported' => ['EP', 'CP', 'MAP'],
                'active_status' => true,
                'active' => true
            ];
        }

        return null;
    }
}
