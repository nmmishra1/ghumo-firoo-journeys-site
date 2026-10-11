<?php
// php-backend/api/hotels/HotelService.php — Domain Business Logic & Operations for Hotels
// Ghumo Firoo Journeys Enterprise Architecture

require_once __DIR__ . '/HotelModel.php';
require_once __DIR__ . '/../../auth_middleware.php';

class HotelService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get single hotel by ID
     */
    public function getHotelById(string $id): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM hotels WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            return HotelModel::parseRow($row);
        }
        return HotelModel::getFallbackHotel($id);
    }

    /**
     * Search and query hotels with dynamic filters and pagination
     */
    public function getHotels(array $filters): array
    {
        $columns = HotelModel::getColumns($this->pdo);
        $cityCol = HotelModel::getCityNameColumn($this->pdo);
        $stateCol = HotelModel::getStateNameColumn($this->pdo);
        $countryCol = HotelModel::getCountryNameColumn($this->pdo);

        $where = [];
        $params = [];

        if (isset($filters['country_id']) && $filters['country_id'] !== 'all' && $filters['country_id'] !== '') {
            $cVal = trim($filters['country_id']);
            $where[] = "(h.country_id = ? OR LOWER(co.`$countryCol`) LIKE LOWER(?) OR (h.country IS NOT NULL AND LOWER(h.country) LIKE LOWER(?)))";
            $params[] = $cVal;
            $params[] = "%$cVal%";
            $params[] = "%$cVal%";
        }

        if (isset($filters['state_id']) && $filters['state_id'] !== 'all' && $filters['state_id'] !== '') {
            $sVal = trim($filters['state_id']);
            $where[] = "(h.state_id = ? OR LOWER(s.`$stateCol`) LIKE LOWER(?) OR (h.state IS NOT NULL AND LOWER(h.state) LIKE LOWER(?)))";
            $params[] = $sVal;
            $params[] = "%$sVal%";
            $params[] = "%$sVal%";
        }

        if (isset($filters['city_id']) && $filters['city_id'] !== 'all' && $filters['city_id'] !== '') {
            $ctVal = trim($filters['city_id']);
            $where[] = "(h.city_id = ? OR LOWER(c.`$cityCol`) LIKE LOWER(?) OR (h.city IS NOT NULL AND LOWER(h.city) LIKE LOWER(?)))";
            $params[] = $ctVal;
            $params[] = "%$ctVal%";
            $params[] = "%$ctVal%";
        }

        foreach (['destination_group', 'active_status', 'star_rating'] as $f) {
            if (isset($filters[$f]) && $filters[$f] !== 'all' && $filters[$f] !== '' && in_array($f, $columns, true)) {
                $where[] = "h.`$f` = ?";
                $params[] = $filters[$f];
            }
        }

        $search = trim($filters['search'] ?? '');
        if (!empty($search)) {
            $where[] = "(LOWER(h.hotel_name) LIKE LOWER(?) OR LOWER(h.hotel_code) LIKE LOWER(?) OR LOWER(c.`$cityCol`) LIKE LOWER(?) OR LOWER(s.`$stateCol`) LIKE LOWER(?) OR LOWER(h.address) LIKE LOWER(?))";
            $searchTerm = '%' . $search . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $whereSQL = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        $isPaginated = isset($filters['page']) || isset($filters['limit']) || isset($filters['paginated']);

        if ($isPaginated) {
            $page = max(1, (int)($filters['page'] ?? 1));
            $limit = min(5000, max(1, (int)($filters['limit'] ?? 20)));
            $offset = ($page - 1) * $limit;

            $countSql = "SELECT COUNT(*) FROM hotels h 
                         LEFT JOIN cities c ON h.city_id = c.id 
                         LEFT JOIN states s ON h.state_id = s.id 
                         LEFT JOIN countries co ON h.country_id = co.id 
                         $whereSQL";
            $countStmt = $this->pdo->prepare($countSql);
            $countStmt->execute($params);
            $totalRecords = (int)$countStmt->fetchColumn();
            $totalPages = max(1, ceil($totalRecords / $limit));

            $sql = "SELECT h.*, c.`$cityCol` as city, s.`$stateCol` as state, co.`$countryCol` as country 
                    FROM hotels h 
                    LEFT JOIN cities c ON h.city_id = c.id 
                    LEFT JOIN states s ON h.state_id = s.id 
                    LEFT JOIN countries co ON h.country_id = co.id 
                    $whereSQL 
                    ORDER BY h.hotel_name ASC 
                    LIMIT $limit OFFSET $offset";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($totalRecords === 0) {
                $fallback = $this->searchFallbackHotels($filters, $offset, $limit);
                if ($fallback !== null) {
                    return $fallback;
                }
            }

            return [
                'is_paginated' => true,
                'data' => array_map(['HotelModel', 'parseRow'], $rows),
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total_records' => $totalRecords,
                    'total_pages' => $totalPages
                ]
            ];
        } else {
            $sql = "SELECT h.*, c.`$cityCol` as city, s.`$stateCol` as state, co.`$countryCol` as country 
                    FROM hotels h 
                    LEFT JOIN cities c ON h.city_id = c.id 
                    LEFT JOIN states s ON h.state_id = s.id 
                    LEFT JOIN countries co ON h.country_id = co.id 
                    $whereSQL 
                    ORDER BY h.hotel_name ASC";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return [
                'is_paginated' => false,
                'data' => array_map(['HotelModel', 'parseRow'], $rows)
            ];
        }
    }

    /**
     * Create a new hotel record
     */
    public function createHotel(array $input, ?array $user = null): array
    {
        $cityInput = $input['city'] ?? ($input['destination'] ?? null);
        if (!empty($cityInput)) {
            $resolvedId = HotelModel::resolveCityId($this->pdo, $cityInput, $input['state'] ?? null, $input['country'] ?? null);
            if ($resolvedId !== null) {
                $input['city_id'] = $resolvedId;
            }
        }

        // Check duplicate hotel name in the same city
        $hotelName = trim($input['hotel_name'] ?? '');
        $cityId = $input['city_id'] ?? null;
        if (!empty($hotelName)) {
            $dupSql = "SELECT id, hotel_name, hotel_code FROM hotels WHERE LOWER(TRIM(hotel_name)) = LOWER(TRIM(:hname))";
            $dupParams = [':hname' => $hotelName];
            if ($cityId) {
                $dupSql .= " AND city_id = :city_id";
                $dupParams[':city_id'] = $cityId;
            }
            $dupStmt = $this->pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                return [
                    'success' => false,
                    'error' => "Duplicate Record: A hotel named '{$dup['hotel_name']}' is already registered in this destination (Code: {$dup['hotel_code']}). Duplicate records cannot be saved.",
                    'duplicate' => true,
                    'status_code' => 409
                ];
            }
        }

        $columns = HotelModel::getColumns($this->pdo);
        $newId = $input['id'] ?? ('hotel-' . uniqid('', true));
        $data = HotelModel::buildData($input, $columns);

        if (empty($data)) {
            return ['success' => false, 'error' => 'No valid fields provided', 'status_code' => 400];
        }

        $cols = array_keys($data);
        $placeholders = array_map(fn($c) => ":$c", $cols);
        $sql = "INSERT INTO `hotels` (`id`, `" . implode("`, `", $cols) . "`) "
             . "VALUES (:id, " . implode(", ", $placeholders) . ")";

        $params = array_merge([':id' => $newId], array_combine($placeholders, array_values($data)));
        $this->pdo->prepare($sql)->execute($params);

        writeAuditLog($this->pdo, 'hotels', $newId, 'CREATE_HOTEL', null, "Created hotel: {$hotelName}", $user);

        return ['success' => true, 'id' => $newId, 'hotel_name' => $hotelName];
    }

    /**
     * Update an existing hotel record
     */
    public function updateHotel(string $id, array $input, ?string $action = null, ?array $user = null): array
    {
        if (empty($id)) {
            return ['success' => false, 'error' => 'Missing id parameter', 'status_code' => 400];
        }

        if (empty($input['city_id']) && !empty($input['city'])) {
            try {
                $resolvedId = HotelModel::resolveCityId($this->pdo, $input['city'], $input['state'] ?? null, $input['country'] ?? null);
                if ($resolvedId !== null) {
                    $input['city_id'] = $resolvedId;
                }
            } catch (Throwable $e) {}
        }

        $hotelName = trim($input['hotel_name'] ?? '');
        $cityId = $input['city_id'] ?? null;
        if (!empty($hotelName)) {
            $dupSql = "SELECT id, hotel_name, hotel_code FROM hotels WHERE LOWER(TRIM(hotel_name)) = LOWER(TRIM(:hname)) AND id != :current_id";
            $dupParams = [':hname' => $hotelName, ':current_id' => $id];
            if ($cityId) {
                $dupSql .= " AND city_id = :city_id";
                $dupParams[':city_id'] = $cityId;
            }
            $dupStmt = $this->pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                return [
                    'success' => false,
                    'error' => "Duplicate Record: Another hotel named '{$dup['hotel_name']}' is already registered in this destination (Code: {$dup['hotel_code']}).",
                    'duplicate' => true,
                    'status_code' => 409
                ];
            }
        }

        $columns = HotelModel::getColumns($this->pdo);
        $data = HotelModel::buildData($input, $columns);

        if (empty($data)) {
            return ['success' => true, 'message' => 'No columns to update', 'id' => $id];
        }

        $stmtCheck = $this->pdo->prepare("SELECT id FROM hotels WHERE id = ?");
        $stmtCheck->execute([$id]);
        $exists = $stmtCheck->fetchColumn();

        if ($exists) {
            $setParts = [];
            $params = [':id' => $id];
            foreach ($data as $key => $val) {
                $setParts[] = "`$key` = :$key";
                $params[":$key"] = $val;
            }
            $sql = "UPDATE `hotels` SET " . implode(", ", $setParts) . " WHERE id = :id";
            $this->pdo->prepare($sql)->execute($params);
        } else {
            $cols = array_keys($data);
            $placeholders = array_map(fn($c) => ":$c", $cols);
            $sql = "INSERT INTO `hotels` (`id`, `" . implode("`, `", $cols) . "`) "
                 . "VALUES (:id, " . implode(", ", $placeholders) . ")";
            $params = array_merge([':id' => $id], array_combine($placeholders, array_values($data)));
            $this->pdo->prepare($sql)->execute($params);
        }

        $realAction = $action ?: ($id ? 'update_hotel' : 'create_hotel');
        $saveName = $data['hotel_name'] ?? $id;
        writeAuditLog($this->pdo, 'hotels', $id, strtoupper($realAction), null, "Saved hotel: {$saveName}", $user);

        return [
            'success' => true,
            'action' => $realAction,
            'table' => 'hotels',
            'id' => $id,
            'item_name' => $saveName,
            'status' => 'SAVED_INTO_DATABASE',
            'audit_logged' => true,
            'message' => "Hotel '{$saveName}' (ID: {$id}) successfully saved in MySQL database."
        ];
    }

    /**
     * Delete a hotel by ID
     */
    public function deleteHotel(string $id, ?string $action = null, ?array $user = null): array
    {
        if (empty($id)) {
            return ['success' => false, 'error' => 'Missing id parameter', 'status_code' => 400];
        }

        $deletedHotelName = $id;
        try {
            $lookup = $this->pdo->prepare("SELECT hotel_name FROM hotels WHERE id = ?");
            $lookup->execute([$id]);
            $found = $lookup->fetchColumn();
            if ($found) $deletedHotelName = $found;
        } catch (Throwable $ignore) {}

        $stmt = $this->pdo->prepare("DELETE FROM hotels WHERE id = ?");
        $stmt->execute([$id]);
        $affected = $stmt->rowCount();

        $realAction = $action ?: 'delete_hotel';
        writeAuditLog($this->pdo, 'hotels', $id, strtoupper($realAction), $deletedHotelName, "Deleted from database", $user);

        return [
            'success' => true,
            'action' => $realAction,
            'table' => 'hotels',
            'id' => $id,
            'item_name' => $deletedHotelName,
            'affected_rows' => $affected,
            'status' => 'DELETED_FROM_DATABASE',
            'audit_logged' => true,
            'message' => "Successfully deleted hotel '{$deletedHotelName}' (ID: {$id}) from database."
        ];
    }

    /**
     * Bootstrap hotel metadata for contracting workspace
     */
    public function getBootstrapData(): array
    {
        $cityCol = HotelModel::getCityNameColumn($this->pdo);
        $stateCol = HotelModel::getStateNameColumn($this->pdo);
        $countryCol = HotelModel::getCountryNameColumn($this->pdo);

        // 1. Countries
        $cStmt = $this->pdo->query("SELECT *, `$countryCol` as country_name FROM countries WHERE active_status = 1 ORDER BY `$countryCol` ASC");
        $countries = $cStmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. States
        $sStmt = $this->pdo->query("SELECT *, `$stateCol` as state_name FROM states WHERE active_status = 1 ORDER BY `$stateCol` ASC");
        $states = $sStmt->fetchAll(PDO::FETCH_ASSOC);

        // 3. Cities
        $cityStmt = $this->pdo->query("SELECT *, `$cityCol` as city_name FROM cities ORDER BY `$cityCol` ASC");
        $cities = $cityStmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Meal Plans
        $mpStmt = $this->pdo->query("SELECT * FROM meal_plans ORDER BY id ASC");
        $mealPlans = $mpStmt->fetchAll(PDO::FETCH_ASSOC);

        // 5. Hotel Suppliers
        $supStmt = $this->pdo->query("SELECT * FROM hotel_suppliers WHERE active_status = 1 ORDER BY supplier_name ASC");
        $suppliers = $supStmt->fetchAll(PDO::FETCH_ASSOC);

        // 6. Hotels
        $hStmt = $this->pdo->query("
            SELECT h.*, c.`$cityCol` as city, s.`$stateCol` as state, co.`$countryCol` as country
            FROM hotels h
            LEFT JOIN cities c ON h.city_id = c.id
            LEFT JOIN states s ON h.state_id = s.id
            LEFT JOIN countries co ON h.country_id = co.id
            ORDER BY h.hotel_name ASC
        ");
        $hotels = $hStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($hotels as &$h) {
            $h = HotelModel::parseRow($h);
        }

        return [
            'success' => true,
            'countries' => $countries ?: [],
            'states' => $states ?: [],
            'cities' => $cities ?: [],
            'meal_plans' => $mealPlans ?: [],
            'suppliers' => $suppliers ?: [],
            'hotels' => $hotels ?: []
        ];
    }

    /**
     * Get rates for a hotel (reading hotel_contract_rates first, then fallback to hotel_rates)
     */
    public function getHotelRates(string $hotelId): array
    {
        $rates = [];
        try {
            $stmt = $this->pdo->prepare("
                SELECT cr.*, rc.room_category_name as room_type 
                FROM hotel_contract_rates cr
                JOIN hotel_contracts hc ON hc.id = cr.contract_id
                LEFT JOIN room_categories rc ON rc.id = cr.room_category_id
                WHERE hc.hotel_id = ?
                ORDER BY cr.id ASC
            ");
            $stmt->execute([$hotelId]);
            $rates = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable $e) {}

        if (empty($rates)) {
            try {
                $stmt2 = $this->pdo->prepare("SELECT * FROM hotel_rates WHERE hotel_id = ? ORDER BY season_start ASC, room_type ASC");
                $stmt2->execute([$hotelId]);
                $rates = $stmt2->fetchAll(PDO::FETCH_ASSOC);
            } catch (Throwable $e) {}
        }

        return $rates;
    }

    /**
     * Fallback search for contractedHotels.json
     */
    private function searchFallbackHotels(array $filters, int $offset, int $limit): ?array
    {
        $jsonPath = __DIR__ . '/../../contractedHotels.json';
        if (!file_exists($jsonPath)) {
            $jsonPath = __DIR__ . '/../../../src/data/contractedHotels.json';
        }
        if (!file_exists($jsonPath)) {
            return null;
        }

        $rawJson = json_decode(file_get_contents($jsonPath), true) ?: [];
        $qSearch = strtolower(trim($filters['search'] ?? ''));
        $qCountry = strtolower(trim($filters['country_id'] ?? ''));
        $qState = strtolower(trim($filters['state_id'] ?? ''));
        $qCity = strtolower(trim($filters['city_id'] ?? ''));
        $qStar = isset($filters['star_rating']) && $filters['star_rating'] !== 'all' && $filters['star_rating'] !== '' ? (int)$filters['star_rating'] : null;

        $fallbackMatches = [];
        foreach ($rawJson as $idx => $h) {
            $name = trim($h['name'] ?? 'Contracted Hotel');
            $hCity = trim($h['city'] ?? 'Uttarakhand');
            $hState = trim($h['state'] ?? 'Uttarakhand');
            $hCountry = trim($h['country'] ?? 'India');
            $cat = strtolower($h['cat_or_room'] ?? '');
            $stars = 3;
            if (strpos($cat, 'luxury') !== false || strpos($cat, 'premium') !== false) {
                $stars = 5;
            } elseif (strpos($cat, 'standard') !== false || strpos($cat, 'deluxe') !== false) {
                $stars = 4;
            }

            if (!empty($qSearch)) {
                if (stripos($name, $qSearch) === false && stripos($hCity, $qSearch) === false && stripos($hState, $qSearch) === false) {
                    continue;
                }
            }
            if (!empty($qCountry) && $qCountry !== 'all') {
                if (stripos($hCountry, $qCountry) === false && stripos($qCountry, $hCountry) === false) {
                    continue;
                }
            }
            if (!empty($qState) && $qState !== 'all') {
                if (stripos($hState, $qState) === false && stripos($qState, $hState) === false) {
                    continue;
                }
            }
            if (!empty($qCity) && $qCity !== 'all') {
                if (stripos($hCity, $qCity) === false && stripos($qCity, $hCity) === false) {
                    continue;
                }
            }
            if ($qStar !== null && $stars !== $qStar) {
                continue;
            }

            $codePrefix = strtoupper(preg_replace('/[^A-Z]/', 'H', substr($name, 0, 4)));
            $codeCity = strtoupper(preg_replace('/[^A-Z]/', 'CT', substr($hCity, 0, 3)));
            $hotelCode = "{$codePrefix}-{$codeCity}-" . ($idx + 101);

            $fallbackMatches[] = [
                'id' => 'contracted-hotel-' . ($idx + 1),
                'hotel_name' => $name,
                'hotel_code' => $hotelCode,
                'star_rating' => $stars,
                'city' => $hCity,
                'state' => $hState,
                'country' => $hCountry,
                'city_id' => $hCity,
                'state_id' => $hState,
                'country_id' => $hCountry,
                'google_rating' => round(4.2 + ($idx % 7) * 0.1, 1),
                'internal_rating' => round(4.3 + ($idx % 5) * 0.1, 1),
                'contact_number' => '+91 98765 ' . (10000 + $idx),
                'email' => 'reservations@' . preg_replace('/[^a-z0-9]/', '', strtolower($name)) . '.com',
                'meal_plan_supported' => ['EP', 'CP', 'MAP', 'AP'],
                'featured_image_url' => null,
                'cat_or_room' => $h['cat_or_room'] ?? 'Standard',
                'b2b_cost' => $h['b2b_cost'] ?? 3000,
                'address' => "{$name}, {$hCity}, {$hState}, {$hCountry}",
                'active_status' => true,
                'active' => true
            ];
        }

        $totalRecords = count($fallbackMatches);
        $totalPages = max(1, ceil($totalRecords / $limit));
        $rows = array_slice($fallbackMatches, $offset, $limit);

        return [
            'is_paginated' => true,
            'data' => array_map(['HotelModel', 'parseRow'], $rows),
            'pagination' => [
                'page' => max(1, (int)($filters['page'] ?? 1)),
                'limit' => $limit,
                'total_records' => $totalRecords,
                'total_pages' => $totalPages
            ]
        ];
    }
}
