<?php
// php-backend/api/cabs/CabModel.php — Domain Data Model & Schema Accessor for Cab Contracting
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/../../db.php';

class CabModel
{
    private static array $cachedColumns = [];

    /**
     * Get actual columns of a cab-related table to guard against phantom columns
     */
    public static function getTableColumns(PDO $pdo, string $tableName): array
    {
        if (!isset(self::$cachedColumns[$tableName])) {
            try {
                $q = $pdo->query("DESCRIBE `$tableName`");
                self::$cachedColumns[$tableName] = $q->fetchAll(PDO::FETCH_COLUMN) ?: [];
            } catch (Throwable $e) {
                self::$cachedColumns[$tableName] = [];
            }
        }
        return self::$cachedColumns[$tableName];
    }

    /**
     * Parse row values according to table types
     */
    public static function parseRow(array $row, string $table): array
    {
        if (empty($row)) return $row;

        if ($table === 'cab_vehicles') {
            if (isset($row['vehicle_images']) && is_string($row['vehicle_images'])) {
                $decoded = json_decode($row['vehicle_images'], true);
                $row['vehicle_images'] = $decoded !== null ? $decoded : [];
            }
            if (isset($row['seating_capacity'])) $row['seating_capacity'] = (int)$row['seating_capacity'];
            if (isset($row['luggage_capacity'])) $row['luggage_capacity'] = (int)$row['luggage_capacity'];
            if (isset($row['active_status'])) $row['active_status'] = (bool)$row['active_status'];
        } elseif ($table === 'cab_routes') {
            if (isset($row['distance_km'])) $row['distance_km'] = (float)$row['distance_km'];
            if (isset($row['estimated_duration_hours'])) $row['estimated_duration_hours'] = (float)$row['estimated_duration_hours'];
            if (isset($row['active_status'])) $row['active_status'] = (bool)$row['active_status'];
        } elseif ($table === 'cab_contract_rates') {
            $numericFields = [
                'rate_per_km', 'daily_rate', 'base_cost', 'vehicle_cost',
                'extra_km_charge', 'extra_hour_cost', 'driver_allowance_per_day',
                'night_halt_charge', 'toll_charges', 'parking_charges',
                'permit_charges', 'state_tax', 'gst_percentage'
            ];
            foreach ($numericFields as $numCol) {
                if (isset($row[$numCol])) $row[$numCol] = (float)$row[$numCol];
            }
            if (isset($row['tax_audit_logs']) && is_string($row['tax_audit_logs'])) {
                $decoded = json_decode($row['tax_audit_logs'], true);
                $row['tax_audit_logs'] = $decoded !== null ? $decoded : [];
            }
            if (isset($row['active_status'])) $row['active_status'] = (bool)$row['active_status'];
        } elseif ($table === 'cab_suppliers' || $table === 'cab_contracts') {
            if (isset($row['active_status'])) $row['active_status'] = (bool)$row['active_status'];
        }

        return $row;
    }

    /**
     * Filter input map to actual physical columns
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
