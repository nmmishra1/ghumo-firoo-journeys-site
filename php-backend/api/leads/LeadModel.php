<?php
// php-backend/api/leads/LeadModel.php — Domain Data Model & Sanitizer for Leads
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/../../db.php';

class LeadModel
{
    private static ?array $leadColumns = null;

    /**
     * Retrieve live physical column list for `leads` table to guard against phantom columns
     */
    public static function getColumns(PDO $pdo): array
    {
        if (self::$leadColumns === null) {
            try {
                $q = $pdo->query("DESCRIBE `leads`");
                self::$leadColumns = $q->fetchAll(PDO::FETCH_COLUMN) ?: [];
            } catch (Throwable $e) {
                self::$leadColumns = [];
            }
        }
        return self::$leadColumns;
    }

    /**
     * Parse and format destination stops into user-friendly strings
     */
    public static function formatDestinationStops($val): string
    {
        if (empty($val)) return '';
        $clean = trim((string)$val);
        if (str_starts_with($clean, '[') || str_starts_with($clean, '{')) {
            $decoded = json_decode($clean, true);
            if (is_array($decoded)) {
                $parts = [];
                $count = count($decoded);
                foreach ($decoded as $item) {
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
                        $c = trim($item);
                        if (!empty($c) && !str_starts_with($c, '[') && !str_starts_with($c, '{')) {
                            $parts[] = $c;
                        }
                    }
                }
                return !empty($parts) ? implode(' • ', $parts) : 'Curated Holiday';
            }
        }
        return $val;
    }

    /**
     * Clean phone number format (+91 or 10 digits)
     */
    public static function sanitizePhone(?string $phone): string
    {
        if (!$phone) return '';
        $digits = preg_replace('/\D/', '', $phone);
        if (strlen($digits) === 10) {
            return '+91' . $digits;
        } elseif (strlen($digits) === 12 && str_starts_with($digits, '91')) {
            return '+' . $digits;
        }
        return $phone;
    }

    /**
     * Parse lead row: cast numeric fields and format destinations
     */
    public static function parseRow(array $row): array
    {
        if (isset($row['id'])) $row['id'] = (int)$row['id'];
        if (isset($row['adult_count'])) $row['adult_count'] = (int)$row['adult_count'];
        if (isset($row['child_count'])) $row['child_count'] = (int)$row['child_count'];
        if (isset($row['infant_count'])) $row['infant_count'] = (int)$row['infant_count'];
        if (isset($row['package_cost'])) $row['package_cost'] = (float)$row['package_cost'];
        if (isset($row['expected_booking_value'])) $row['expected_booking_value'] = (float)$row['expected_booking_value'];
        if (isset($row['estimated_booking_value'])) $row['estimated_booking_value'] = (float)$row['estimated_booking_value'];

        if (isset($row['destinations'])) {
            $row['destinations'] = self::formatDestinationStops($row['destinations']);
        }

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
}
