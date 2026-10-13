<?php
// php-backend/api/packages/PackageModel.php — Domain Data Model & Sanitizer for Tour Packages
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/../../db.php';

class PackageModel
{
    private static ?array $packageColumns = null;

    /**
     * Retrieve live physical column list for `packages` table
     */
    public static function getColumns(PDO $pdo): array
    {
        if (self::$packageColumns === null) {
            try {
                $q = $pdo->query("DESCRIBE `packages`");
                self::$packageColumns = $q->fetchAll(PDO::FETCH_COLUMN) ?: [];
            } catch (Throwable $e) {
                self::$packageColumns = [];
            }
        }
        return self::$packageColumns;
    }

    /**
     * Generate secure UUIDv4 identifier
     */
    public static function generateUuid(): string
    {
        return sprintf(
            '%04x%04x-%04x-%04x-%04x-%012x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0x4000, 0x4fff),
            mt_rand(0x8000, 0xbfff),
            mt_rand(0, 0xffffffffffff)
        );
    }

    /**
     * Clean Unicode Mojibake artifacts from strings
     */
    public static function cleanMojibakeStr($str)
    {
        if (!is_string($str)) return $str;
        $replacements = [
            'ÔåÆ' => '→',
            'â†’' => '→',
            '&rarr;' => '→',
            '->' => '→',
            'ÔÇö' => '—',
            'â€”' => '—',
            'ÔÇô' => '–',
            'â€“' => '–',
            'ÔÇÖ' => '’',
            'â€™' => '’',
            'ÔÇÿ' => '‘',
            'â€˜' => '‘',
            'ÔÇ£' => '“',
            'â€œ' => '“',
            'ÔÇØ' => '”',
            'â€ ' => '”',
            'ÔÇª' => '…',
            'â€¦' => '…',
            'â€¢' => '•',
            'â‚¹' => '₹',
            'Â₹' => '₹',
            'Â' => ''
        ];
        return str_replace(array_keys($replacements), array_values($replacements), $str);
    }

    /**
     * Recursively clean Mojibake from nested arrays / objects
     */
    public static function cleanMojibakeData($data)
    {
        if (is_string($data)) {
            return self::cleanMojibakeStr($data);
        }
        if (is_array($data)) {
            foreach ($data as $k => $v) {
                $data[$k] = self::cleanMojibakeData($v);
            }
        }
        return $data;
    }

    /**
     * Decode JSON columns and cast types
     */
    public static function parsePackage(array $pkg): array
    {
        $jsonFields = [
            'images', 'category', 'destinations', 'highlights',
            'inclusions', 'exclusions', 'itinerary', 'map_locations',
            'flight_routes', 'virtual_tour', 'faqs', 'quick_facts',
            'attractions_json', 'route_stops_json', 'destinations_json'
        ];

        foreach ($jsonFields as $field) {
            if (isset($pkg[$field]) && is_string($pkg[$field])) {
                $decoded = json_decode($pkg[$field], true);
                $pkg[$field] = (json_last_error() === JSON_ERROR_NONE) ? $decoded : [];
            }
        }

        if (isset($pkg['price'])) {
            $pkg['price'] = (float)$pkg['price'];
        }
        if (isset($pkg['rating'])) {
            $pkg['rating'] = (float)$pkg['rating'];
        }
        if (isset($pkg['reviews'])) {
            $pkg['reviews'] = (int)$pkg['reviews'];
        }
        if (isset($pkg['is_active'])) {
            $pkg['is_active'] = (bool)$pkg['is_active'];
        }
        if (isset($pkg['is_featured'])) {
            $pkg['is_featured'] = (bool)$pkg['is_featured'];
        }

        return self::cleanMojibakeData($pkg);
    }
}
