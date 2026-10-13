<?php
// php-backend/api/packages/PackageService.php — Domain Business Logic for Packages & Variants
// Ghumo Firoo Travels Enterprise Architecture

require_once __DIR__ . '/PackageModel.php';
require_once __DIR__ . '/../../auth_middleware.php';

class PackageService
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get single package by ID or Slug
     */
    public function getPackageByIdOrSlug(string $identifier): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM packages WHERE id = ? OR slug = ?");
        $stmt->execute([$identifier, $identifier]);
        $pkg = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pkg && (strpos($identifier, 'rann-utsav') !== false || strpos($identifier, 'kutch') !== false)) {
            $stmt = $this->pdo->prepare("SELECT * FROM packages WHERE slug = 'kutch-rann-utsav' OR slug LIKE '%kutch%' OR slug LIKE '%rann-utsav%' LIMIT 1");
            $stmt->execute();
            $pkg = $stmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$pkg) return null;

        $packageId = $pkg['id'];
        $pkg = PackageModel::parsePackage($pkg);

        $pkg['variants'] = $this->fetchPackageVariants($packageId);
        $pkg['hotels'] = $this->fetchPackageHotels($packageId);
        $pkg['attractions'] = $this->fetchPackageAttractions($packageId);

        return [
            'package' => $pkg,
            'id' => $pkg['id'],
            'name' => $pkg['name'],
            'slug' => $pkg['slug'],
            'duration' => $pkg['duration'] ?? '',
            'price' => $pkg['price'] ?? 0,
            'rating' => $pkg['rating'] ?? 5.0,
            'reviews' => $pkg['reviews'] ?? 0,
            'image' => $pkg['image'] ?? '',
            'images' => $pkg['images'] ?? [],
            'destinations' => $pkg['destinations'] ?? [],
            'highlights' => $pkg['highlights'] ?? [],
            'inclusions' => $pkg['inclusions'] ?? [],
            'exclusions' => $pkg['exclusions'] ?? [],
            'itinerary' => $pkg['itinerary'] ?? [],
            'hotels' => $pkg['hotels'] ?? [],
            'attractions' => $pkg['attractions'] ?? [],
            'variants' => $pkg['variants'] ?? [],
            'is_active' => $pkg['is_active'] ?? true
        ];
    }

    /**
     * List packages with optional variant inclusion
     */
    public function listPackages(bool $includeVariants = false): array
    {
        $stmt = $this->pdo->query("SELECT * FROM packages ORDER BY name ASC");
        $packages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $result = [];
        foreach ($packages as $pkg) {
            $parsed = PackageModel::parsePackage($pkg);
            if ($includeVariants) {
                $parsed['variants'] = $this->fetchPackageVariants($pkg['id']);
            }
            $result[] = $parsed;
        }

        return $result;
    }

    /**
     * Create a new tour package
     */
    public function createPackage(array $p, ?array $user = null): array
    {
        $pkgName = trim($p['name'] ?? ($p['package_name'] ?? ($p['title'] ?? '')));
        $pkgSlug = trim($p['slug'] ?? '');

        if (!empty($pkgSlug) || !empty($pkgName)) {
            $dupSql = "SELECT id, name, slug FROM packages WHERE 1=0";
            $dupParams = [];
            if (!empty($pkgSlug)) {
                $dupSql .= " OR LOWER(TRIM(slug)) = LOWER(TRIM(:slug))";
                $dupParams[':slug'] = $pkgSlug;
            }
            if (!empty($pkgName)) {
                $dupSql .= " OR LOWER(TRIM(name)) = LOWER(TRIM(:name))";
                $dupParams[':name'] = $pkgName;
            }
            $dupStmt = $this->pdo->prepare($dupSql);
            $dupStmt->execute($dupParams);
            $dup = $dupStmt->fetch(PDO::FETCH_ASSOC);
            if ($dup) {
                return [
                    'success' => false,
                    'error' => "Duplicate Package: A tour package named '{$dup['name']}' (slug: '{$dup['slug']}') already exists in MySQL database.",
                    'duplicate' => true,
                    'status_code' => 409
                ];
            }
        }

        $newId = $p['id'] ?? PackageModel::generateUuid();

        $stmt = $this->pdo->prepare("INSERT INTO packages (
            id, name, price, slug, duration, image, images, category, rating, reviews,
            destinations, highlights, inclusions, exclusions, itinerary, map_locations,
            flight_routes, virtual_tour, faqs, seo_title, seo_description, seo_keywords,
            best_time, group_size, difficulty, quick_facts, package_type, is_active,
            tagline, hero_image, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $stmt->execute([
            $newId, $p['name'] ?? '', floatval($p['price'] ?? 0), $p['slug'] ?? '', $p['duration'] ?? '', $p['image'] ?? '',
            json_encode($p['images'] ?? []), json_encode($p['category'] ?? []), floatval($p['rating'] ?? 5.0), intval($p['reviews'] ?? 0),
            json_encode($p['destinations'] ?? []), json_encode($p['highlights'] ?? []),
            json_encode($p['inclusions'] ?? []), json_encode($p['exclusions'] ?? []),
            json_encode($p['itinerary'] ?? new stdClass()), json_encode($p['map_locations'] ?? []),
            json_encode($p['flight_routes'] ?? []), json_encode($p['virtual_tour'] ?? new stdClass()),
            json_encode($p['faqs'] ?? []), $p['seo_title'] ?? '', $p['seo_description'] ?? '', $p['seo_keywords'] ?? '',
            $p['best_time'] ?? '', $p['group_size'] ?? '', $p['difficulty'] ?? '', json_encode($p['quick_facts'] ?? new stdClass()),
            $p['package_type'] ?? '', isset($p['is_active']) ? ($p['is_active'] ? 1 : 0) : 1,
            $p['tagline'] ?? null, $p['hero_image'] ?? null, isset($p['is_featured']) ? ($p['is_featured'] ? 1 : 0) : 0
        ]);

        writeAuditLog($this->pdo, 'packages', $newId, 'CREATE_PACKAGE', null, "Created package: {$pkgName}", $user);

        return ['success' => true, 'id' => $newId, 'name' => $pkgName];
    }

    /**
     * Update an existing tour package
     */
    public function updatePackage(string $id, array $p, ?array $user = null): array
    {
        if (empty($id)) {
            return ['success' => false, 'error' => 'Missing package id', 'status_code' => 400];
        }

        $stmt = $this->pdo->prepare("UPDATE packages SET
            name = ?, price = ?, slug = ?, duration = ?, image = ?, images = ?, category = ?,
            rating = ?, reviews = ?, destinations = ?, highlights = ?, inclusions = ?, exclusions = ?,
            itinerary = ?, map_locations = ?, flight_routes = ?, virtual_tour = ?, faqs = ?,
            seo_title = ?, seo_description = ?, seo_keywords = ?, best_time = ?, group_size = ?,
            difficulty = ?, quick_facts = ?, package_type = ?, is_active = ?,
            tagline = ?, hero_image = ?, is_featured = ?
        WHERE id = ?");

        $stmt->execute([
            $p['name'] ?? '', floatval($p['price'] ?? 0), $p['slug'] ?? '', $p['duration'] ?? '', $p['image'] ?? '',
            json_encode($p['images'] ?? []), json_encode($p['category'] ?? []), floatval($p['rating'] ?? 5.0), intval($p['reviews'] ?? 0),
            json_encode($p['destinations'] ?? []), json_encode($p['highlights'] ?? []),
            json_encode($p['inclusions'] ?? []), json_encode($p['exclusions'] ?? []),
            json_encode($p['itinerary'] ?? new stdClass()), json_encode($p['map_locations'] ?? []),
            json_encode($p['flight_routes'] ?? []), json_encode($p['virtual_tour'] ?? new stdClass()),
            json_encode($p['faqs'] ?? []), $p['seo_title'] ?? '', $p['seo_description'] ?? '', $p['seo_keywords'] ?? '',
            $p['best_time'] ?? '', $p['group_size'] ?? '', $p['difficulty'] ?? '', json_encode($p['quick_facts'] ?? new stdClass()),
            $p['package_type'] ?? '', isset($p['is_active']) ? ($p['is_active'] ? 1 : 0) : 1,
            $p['tagline'] ?? null, $p['hero_image'] ?? null, isset($p['is_featured']) ? ($p['is_featured'] ? 1 : 0) : 0,
            $id
        ]);

        $pkgName = $p['name'] ?? $id;
        writeAuditLog($this->pdo, 'packages', $id, 'UPDATE_PACKAGE', null, "Updated package: {$pkgName}", $user);

        return ['success' => true, 'id' => $id];
    }

    /**
     * Delete a tour package
     */
    public function deletePackage(string $id, ?array $user = null): array
    {
        if (empty($id)) {
            return ['success' => false, 'error' => 'Missing package id', 'status_code' => 400];
        }

        $stmt = $this->pdo->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$id]);

        writeAuditLog($this->pdo, 'packages', $id, 'DELETE_PACKAGE', null, "Deleted package", $user);

        return ['success' => true, 'id' => $id];
    }

    /**
     * Save or update a package variant with child tables
     */
    public function saveVariant(array $data, ?array $user = null): array
    {
        $packageId = $data['package_id'] ?? null;
        $variantKey = $data['variant_key'] ?? ($data['id_key'] ?? null);

        if (!$packageId || !$variantKey) {
            return ['success' => false, 'error' => 'package_id and variant_key are required', 'status_code' => 400];
        }

        $this->pdo->beginTransaction();
        try {
            $variantId = $data['id'] ?? null;

            if ($variantId) {
                $check = $this->pdo->prepare("SELECT id FROM package_variants WHERE id = ?");
                $check->execute([$variantId]);
                if (!$check->fetch()) {
                    $variantId = null;
                }
            }

            if (!$variantId) {
                $checkKey = $this->pdo->prepare("SELECT id FROM package_variants WHERE package_id = ? AND variant_key = ?");
                $checkKey->execute([$packageId, $variantKey]);
                $existing = $checkKey->fetch();
                if ($existing) {
                    $variantId = $existing['id'];
                }
            }

            $inclusionsJson = json_encode($data['inclusions'] ?? []);
            $exclusionsJson = json_encode($data['exclusions'] ?? []);

            if ($variantId) {
                $stmt = $this->pdo->prepare("UPDATE package_variants SET
                    variant_key = ?, label = ?, nights = ?, days = ?, tag = ?,
                    price_per_person = ?, hotel_category = ?, group_size = ?, pickup_from = ?,
                    inclusions = ?, exclusions = ?, sort_order = ?, is_active = ?
                    WHERE id = ?");
                $stmt->execute([
                    $variantKey,
                    $data['label'] ?? '',
                    intval($data['nights'] ?? 0),
                    intval($data['days'] ?? 1),
                    $data['tag'] ?? null,
                    floatval($data['price_per_person'] ?? 0),
                    $data['hotel_category'] ?? null,
                    $data['group_size'] ?? null,
                    $data['pickup_from'] ?? null,
                    $inclusionsJson,
                    $exclusionsJson,
                    intval($data['sort_order'] ?? 0),
                    isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1,
                    $variantId
                ]);
            } else {
                $stmt = $this->pdo->prepare("INSERT INTO package_variants (
                    package_id, variant_key, label, nights, days, tag, price_per_person,
                    hotel_category, group_size, pickup_from, inclusions, exclusions, sort_order, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $packageId,
                    $variantKey,
                    $data['label'] ?? '',
                    intval($data['nights'] ?? 0),
                    intval($data['days'] ?? 1),
                    $data['tag'] ?? null,
                    floatval($data['price_per_person'] ?? 0),
                    $data['hotel_category'] ?? null,
                    $data['group_size'] ?? null,
                    $data['pickup_from'] ?? null,
                    $inclusionsJson,
                    $exclusionsJson,
                    intval($data['sort_order'] ?? 0),
                    isset($data['is_active']) ? ($data['is_active'] ? 1 : 0) : 1
                ]);
                $variantId = $this->pdo->lastInsertId();
            }

            // Save Child Tables
            // 1. Itinerary Days
            if (isset($data['itinerary']) && is_array($data['itinerary'])) {
                $this->pdo->prepare("DELETE FROM variant_itinerary_days WHERE variant_id = ?")->execute([$variantId]);
                $insDay = $this->pdo->prepare("INSERT INTO variant_itinerary_days (variant_id, day_number, timing, title, description, activities, meals, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['itinerary'] as $idx => $day) {
                    $insDay->execute([
                        $variantId,
                        intval($day['day_number'] ?? $day['day'] ?? ($idx + 1)),
                        $day['timing'] ?? null,
                        $day['title'] ?? '',
                        $day['description'] ?? null,
                        json_encode($day['activities'] ?? []),
                        $day['meals'] ?? null,
                        intval($day['sort_order'] ?? $idx)
                    ]);
                }
            }

            // 2. Hotels
            if (isset($data['hotels']) && is_array($data['hotels'])) {
                $this->pdo->prepare("DELETE FROM variant_hotels WHERE variant_id = ?")->execute([$variantId]);
                $insHotel = $this->pdo->prepare("INSERT INTO variant_hotels (variant_id, hotel_name, location, stars, highlight, sort_order) VALUES (?, ?, ?, ?, ?, ?)");
                foreach ($data['hotels'] as $idx => $h) {
                    $insHotel->execute([
                        $variantId,
                        $h['hotel_name'] ?? $h['name'] ?? '',
                        $h['location'] ?? null,
                        intval($h['stars'] ?? 3),
                        $h['highlight'] ?? null,
                        intval($h['sort_order'] ?? $idx)
                    ]);
                }
            }

            // 3. Excursions
            if (isset($data['excursions']) && is_array($data['excursions'])) {
                $this->pdo->prepare("DELETE FROM variant_excursions WHERE variant_id = ?")->execute([$variantId]);
                $insExc = $this->pdo->prepare("INSERT INTO variant_excursions (variant_id, excursion_name, description, duration, price, is_included, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
                foreach ($data['excursions'] as $idx => $e) {
                    $insExc->execute([
                        $variantId,
                        $e['excursion_name'] ?? $e['name'] ?? '',
                        $e['description'] ?? null,
                        $e['duration'] ?? null,
                        $e['price'] ?? null,
                        (isset($e['is_included']) ? ($e['is_included'] ? 1 : 0) : (isset($e['included']) ? ($e['included'] ? 1 : 0) : 1)),
                        intval($e['sort_order'] ?? $idx)
                    ]);
                }
            }

            // 4. Price Table
            if (isset($data['price_table']) && is_array($data['price_table'])) {
                $this->pdo->prepare("DELETE FROM variant_price_rows WHERE variant_id = ?")->execute([$variantId]);
                $insPrice = $this->pdo->prepare("INSERT INTO variant_price_rows (variant_id, room_type, price, sort_order) VALUES (?, ?, ?, ?)");
                foreach ($data['price_table'] as $idx => $pr) {
                    $insPrice->execute([
                        $variantId,
                        $pr['room_type'] ?? $pr['roomType'] ?? '',
                        $pr['price'] ?? '',
                        intval($pr['sort_order'] ?? $idx)
                    ]);
                }
            }

            // 5. Cancellation Policy
            if (isset($data['cancellation_policy']) && is_array($data['cancellation_policy'])) {
                $this->pdo->prepare("DELETE FROM variant_cancellation WHERE variant_id = ?")->execute([$variantId]);
                $insCancel = $this->pdo->prepare("INSERT INTO variant_cancellation (variant_id, days_before, charge, sort_order) VALUES (?, ?, ?, ?)");
                foreach ($data['cancellation_policy'] as $idx => $c) {
                    $insCancel->execute([
                        $variantId,
                        $c['days_before'] ?? $c['daysBefore'] ?? $c['days'] ?? '',
                        $c['charge'] ?? '',
                        intval($c['sort_order'] ?? $idx)
                    ]);
                }
            }

            $this->pdo->commit();
            return ['success' => true, 'variant_id' => intval($variantId)];
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }

    /**
     * Delete a package variant
     */
    public function deleteVariant(string $variantId): array
    {
        $stmt = $this->pdo->prepare("DELETE FROM package_variants WHERE id = ?");
        $stmt->execute([$variantId]);
        return ['success' => true];
    }

    /**
     * Clone a package template into an ItineraryBuilder workspace payload
     */
    public function cloneToItinerary(string $pkgId): ?array
    {
        $stmt = $this->pdo->prepare("SELECT * FROM packages WHERE id = ? OR slug = ? LIMIT 1");
        $stmt->execute([$pkgId, $pkgId]);
        $pkg = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$pkg) return null;

        $varStmt = $this->pdo->prepare("SELECT * FROM package_variants WHERE package_id = ?");
        $varStmt->execute([$pkg['id']]);
        $variants = $varStmt->fetchAll(PDO::FETCH_ASSOC);

        $parsedPkg = PackageModel::parsePackage($pkg);

        $dayPlans = $parsedPkg['day_plans'] ?? $parsedPkg['itinerary'] ?? [];
        if (!is_array($dayPlans)) $dayPlans = [];

        $formattedDays = [];
        foreach ($dayPlans as $idx => $dp) {
            $dayNum = $idx + 1;
            $formattedDays[] = [
                'day_number' => $dayNum,
                'title' => $dp['title'] ?? ($dp['day_title'] ?? "Day $dayNum"),
                'description' => $dp['description'] ?? ($dp['activities'] ?? ''),
                'sightseeing_ids' => $dp['sightseeing_ids'] ?? [],
                'activity_ids' => $dp['activity_ids'] ?? [],
                'hotel_id' => $dp['hotel_id'] ?? null,
                'meals' => $dp['meals'] ?? ['Breakfast']
            ];
        }

        return [
            'success' => true,
            'source_package_id' => $pkg['id'],
            'package_title' => $pkg['title'] ?? $pkg['name'],
            'destination' => $pkg['destination'] ?? '',
            'duration' => $pkg['duration'] ?? '',
            'nights' => (int)($pkg['nights'] ?? 0),
            'days' => (int)($pkg['days'] ?? 0),
            'day_by_day' => $formattedDays,
            'inclusions' => $parsedPkg['inclusions'] ?? [],
            'exclusions' => $parsedPkg['exclusions'] ?? [],
            'highlights' => $parsedPkg['highlights'] ?? [],
            'base_price' => (float)($pkg['price'] ?? $pkg['base_price'] ?? 0),
            'variants' => $variants
        ];
    }

    /**
     * Fetch hotel cards for package
     */
    public function fetchPackageHotels($packageId): array
    {
        try {
            $vStmt = $this->pdo->prepare("SELECT DISTINCT vh.hotel_name AS name, vh.location, vh.stars, vh.highlight FROM variant_hotels vh JOIN package_variants pv ON vh.variant_id = pv.id WHERE pv.package_id = ? ORDER BY pv.sort_order ASC, vh.sort_order ASC");
            $vStmt->execute([$packageId]);
            $hotels = $vStmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            if (empty($hotels)) {
                $stmt = $this->pdo->prepare("SELECT hotel_name AS name, location, stars, room_type, meal_plan, image, price_from FROM package_hotels WHERE package_id = ?");
                $stmt->execute([$packageId]);
                $hotels = $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
            }
            return $hotels;
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * Fetch attraction cards for package
     */
    public function fetchPackageAttractions($packageId): array
    {
        try {
            $stmt = $this->pdo->prepare("SELECT name, description, image FROM package_attractions WHERE package_id = ? ORDER BY sort_order ASC, id ASC");
            $stmt->execute([$packageId]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC) ?: [];
        } catch (Throwable $e) {
            return [];
        }
    }

    /**
     * Fetch all variants and child tables for package
     */
    public function fetchPackageVariants($packageId): array
    {
        $vars = $this->pdo->prepare("SELECT * FROM package_variants WHERE package_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC");
        $vars->execute([$packageId]);
        $variants = $vars->fetchAll(PDO::FETCH_ASSOC);

        foreach ($variants as &$v) {
            $vid = $v['id'];

            $v['price_per_person'] = floatval($v['price_per_person']);
            $v['pricePerPerson'] = $v['price_per_person'];
            $v['hotelCategory'] = $v['hotel_category'];
            $v['groupSize'] = $v['group_size'];
            $v['pickupFrom'] = $v['pickup_from'];
            $v['variantKey'] = $v['variant_key'];

            $v['inclusions'] = json_decode($v['inclusions'] ?? '[]', true) ?: [];
            $v['exclusions'] = json_decode($v['exclusions'] ?? '[]', true) ?: [];

            // Itinerary
            $days = $this->pdo->prepare("SELECT * FROM variant_itinerary_days WHERE variant_id = ? ORDER BY sort_order ASC, day_number ASC");
            $days->execute([$vid]);
            $daysData = $days->fetchAll(PDO::FETCH_ASSOC);
            foreach ($daysData as &$d) {
                $d['activities'] = json_decode($d['activities'] ?? '[]', true) ?: [];
                $d['day'] = intval($d['day_number']);
            }
            $v['itinerary'] = $daysData;

            // Hotels
            $hotels = $this->pdo->prepare("SELECT * FROM variant_hotels WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
            $hotels->execute([$vid]);
            $hotelList = $hotels->fetchAll(PDO::FETCH_ASSOC);
            foreach ($hotelList as &$h) {
                $h['name'] = $h['hotel_name'];
                $h['stars'] = intval($h['stars']);
            }
            $v['hotels'] = $hotelList;

            // Excursions
            $exc = $this->pdo->prepare("SELECT * FROM variant_excursions WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
            $exc->execute([$vid]);
            $excList = $exc->fetchAll(PDO::FETCH_ASSOC);
            foreach ($excList as &$e) {
                $e['name'] = $e['excursion_name'];
                $e['included'] = (bool)$e['is_included'];
            }
            $v['excursions'] = $excList;

            // Price table
            $prices = $this->pdo->prepare("SELECT * FROM variant_price_rows WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
            $prices->execute([$vid]);
            $priceList = $prices->fetchAll(PDO::FETCH_ASSOC);
            foreach ($priceList as &$pr) {
                $pr['roomType'] = $pr['room_type'];
            }
            $v['price_table'] = $priceList;
            $v['priceTable'] = $priceList;

            // Cancellation policy
            $cancel = $this->pdo->prepare("SELECT * FROM variant_cancellation WHERE variant_id = ? ORDER BY sort_order ASC, id ASC");
            $cancel->execute([$vid]);
            $cancelList = $cancel->fetchAll(PDO::FETCH_ASSOC);
            foreach ($cancelList as &$c) {
                $c['daysBefore'] = $c['days_before'];
            }
            $v['cancellation_policy'] = $cancelList;
            $v['cancellationPolicy'] = $cancelList;
        }

        return PackageModel::cleanMojibakeData($variants);
    }
}
