<?php
// ItineraryModel.php — Canonical Itineraries Domain Data Access Layer
// Ghumo Firoo Travels Enterprise Architecture
declare(strict_types=1);

class ItineraryModel {
    private PDO $pdo;
    private array $tableCache = [];
    private array $columnCache = [];

    const PRICING_VARIANCE_TOLERANCE_PCT = 2.0;
    const PRICING_VARIANCE_TOLERANCE_ABS = 5.0;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function tableExists(string $table): bool {
        if (!isset($this->tableCache[$table])) {
            try {
                $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
                $stmt->execute([$table]);
                $this->tableCache[$table] = (int)$stmt->fetchColumn() > 0;
            } catch (Exception $e) {
                $this->tableCache[$table] = false;
            }
        }
        return $this->tableCache[$table];
    }

    public function getColumn(string $table, array $candidates, ?string $fallback = null): ?string {
        if (!isset($this->columnCache[$table])) {
            try {
                $this->columnCache[$table] = $this->pdo->query("DESCRIBE `$table`")->fetchAll(PDO::FETCH_COLUMN);
            } catch (Exception $e) {
                $this->columnCache[$table] = [];
            }
        }
        foreach ($candidates as $cand) {
            if (in_array($cand, $this->columnCache[$table], true)) return $cand;
        }
        return $fallback;
    }

    public function hasPricingColumns(): bool {
        static $cached = null;
        if ($cached === null) {
            try {
                $stmt = $this->pdo->prepare(
                    "SELECT COUNT(*) FROM information_schema.COLUMNS
                     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'itineraries' AND COLUMN_NAME = 'pricing_flagged'"
                );
                $stmt->execute();
                $cached = (int)$stmt->fetchColumn() > 0;
            } catch (Exception $e) {
                $cached = false;
            }
        }
        return (bool)$cached;
    }

    public function withinTolerance(float $expected, float $actual): bool {
        $diff = abs($expected - $actual);
        $pctTolerance = abs($expected) * (self::PRICING_VARIANCE_TOLERANCE_PCT / 100);
        return $diff <= max($pctTolerance, self::PRICING_VARIANCE_TOLERANCE_ABS);
    }

    public function computeHotelFloor($hotelRateId, int $nights, int $rooms, $hotelId = null, $hotelName = null): ?float {
        if (!empty($hotelRateId)) {
            if ($this->tableExists('hotel_contract_rates')) {
                $stmt = $this->pdo->prepare("SELECT * FROM hotel_contract_rates WHERE id = ?");
                $stmt->execute([$hotelRateId]);
                if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $nightly = (float)($row['selling_cost'] ?? 0) ?: (float)($row['double_rate'] ?? 0) ?: (float)($row['net_cost'] ?? 0);
                    $base = $nightly * max(1, $nights) * max(1, $rooms);
                    $isInclusive = ($row['rate_type'] ?? '') === 'inclusive';
                    $gstPct = (float)($row['gst_percentage'] ?? 0);
                    if (!$isInclusive && $gstPct > 0) {
                        $base *= (1 + ($gstPct / 100));
                    }
                    return $base;
                }
            }

            if ($this->tableExists('hotel_rates')) {
                $rateCol = $this->getColumn('hotel_rates', ['rate_per_night', 'rate', 'nightly_rate']);
                $gstPctCol = $this->getColumn('hotel_rates', ['gst_percentage']);
                $gstIncludedCol = $this->getColumn('hotel_rates', ['gst_included']);
                if ($rateCol) {
                    $stmt = $this->pdo->prepare("SELECT * FROM hotel_rates WHERE id = ?");
                    $stmt->execute([$hotelRateId]);
                    if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        $base = (float)$row[$rateCol] * max(1, $nights) * max(1, $rooms);
                        $gstIncluded = $gstIncludedCol ? (bool)$row[$gstIncludedCol] : true;
                        if (!$gstIncluded && $gstPctCol && (float)$row[$gstPctCol] > 0) {
                            $base *= (1 + ((float)$row[$gstPctCol] / 100));
                        }
                        return $base;
                    }
                }
            }
        }

        if (!empty($hotelId) || !empty($hotelName)) {
            if ($this->tableExists('hotel_rates')) {
                $rateCol = $this->getColumn('hotel_rates', ['rate_per_night', 'rate', 'nightly_rate']);
                if ($rateCol) {
                    if (!empty($hotelId)) {
                        $stmt = $this->pdo->prepare("SELECT * FROM hotel_rates WHERE hotel_id = ? AND is_active = 1 ORDER BY $rateCol ASC LIMIT 1");
                        $stmt->execute([$hotelId]);
                        if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                            return (float)$row[$rateCol] * max(1, $nights) * max(1, $rooms);
                        }
                    }
                    if (!empty($hotelName) && $this->tableExists('hotels')) {
                        $nameCol = $this->getColumn('hotels', ['hotel_name', 'name']);
                        if ($nameCol) {
                            $stmt = $this->pdo->prepare("SELECT r.* FROM hotel_rates r JOIN hotels h ON r.hotel_id = h.id WHERE LOWER(h.`$nameCol`) LIKE LOWER(?) AND r.is_active = 1 ORDER BY r.$rateCol ASC LIMIT 1");
                            $stmt->execute(['%' . trim($hotelName) . '%']);
                            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                return (float)$row[$rateCol] * max(1, $nights) * max(1, $rooms);
                            }
                        }
                    }
                }
            }
        }

        return null;
    }

    public function computeCabFloor($cabRateId): ?float {
        if (empty($cabRateId)) return null;

        if ($this->tableExists('cab_contract_rates')) {
            $stmt = $this->pdo->prepare("SELECT * FROM cab_contract_rates WHERE id = ?");
            $stmt->execute([$cabRateId]);
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $base = (float)($row['daily_rate'] ?? 0) ?: (float)($row['base_cost'] ?? 0) ?: (float)($row['vehicle_cost'] ?? 0);
                $base += (float)($row['toll_charges'] ?? 0) + (float)($row['parking_charges'] ?? 0)
                       + (float)($row['permit_charges'] ?? 0) + (float)($row['state_tax'] ?? 0);
                if (empty($row['gst_included']) && (float)($row['gst_percentage'] ?? 0) > 0) {
                    $base *= (1 + ((float)$row['gst_percentage'] / 100));
                }
                return $base;
            }
        }

        if (!$this->tableExists('cab_rates')) return null;

        $rateCol = $this->getColumn('cab_rates', ['rate']);
        if (!$rateCol) return null;

        $stmt = $this->pdo->prepare("SELECT * FROM cab_rates WHERE id = ?");
        $stmt->execute([$cabRateId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return null;

        return (float)$row[$rateCol];
    }

    public function computeExcursionExpected($excursionId, int $adultCount, int $childCount): ?float {
        if (empty($excursionId)) return null;

        if ($this->tableExists('activity_rates')) {
            $stmt = $this->pdo->prepare("SELECT adult_rate, child_rate FROM activity_rates WHERE activity_id = ? AND is_active = 1 LIMIT 1");
            $stmt->execute([$excursionId]);
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $adultRate = (float)($row['adult_rate'] ?? 0);
                $childRate = (float)($row['child_rate'] ?? 0);
                return ($adultCount * $adultRate) + ($childCount * $childRate);
            }
        }
        if ($this->tableExists('activities')) {
            $adultCol = $this->getColumn('activities', ['adult_cost', 'selling_cost']);
            $childCol = $this->getColumn('activities', ['child_cost']);
            if ($adultCol) {
                $stmt = $this->pdo->prepare("SELECT * FROM activities WHERE id = ?");
                $stmt->execute([$excursionId]);
                if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    $adultRate = (float)($row[$adultCol] ?? 0);
                    $childRate = $childCol ? (float)($row[$childCol] ?? 0) : 0;
                    return ($adultCount * $adultRate) + ($childCount * $childRate);
                }
            }
        }
        if ($this->tableExists('sightseeings')) {
            $stmt = $this->pdo->prepare("SELECT adult_cost, child_cost FROM sightseeings WHERE id = ?");
            $stmt->execute([$excursionId]);
            if ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $adultRate = (float)($row['adult_cost'] ?? 0);
                $childRate = (float)($row['child_cost'] ?? 0);
                return ($adultCount * $adultRate) + ($childCount * $childRate);
            }
        }
        return null;
    }

    public function validateAndAnnotatePricing(array $days): array {
        $variances = [];

        foreach ($days as $dIdx => $d) {
            $dayLabel = 'Day ' . ((int)($d['day_number'] ?? ($dIdx + 1)));

            foreach (($d['hotels'] ?? []) as $h) {
                $submitted = (float)($h['total_cost'] ?? 0);
                $floor = $this->computeHotelFloor(
                    $h['hotel_rate_id'] ?? null, 
                    (int)($h['nights'] ?? 1), 
                    (int)($h['rooms'] ?? 1),
                    $h['hotel_id'] ?? null,
                    $h['hotel_name'] ?? null
                );
                if ($floor === null) {
                    if ($submitted <= 0) {
                        $variances[] = ['day' => $dayLabel, 'type' => 'hotel', 'id' => $h['hotel_rate_id'] ?? null, 'issue' => 'no_matching_rate', 'submitted' => $submitted];
                    }
                } elseif ($submitted < $floor && !$this->withinTolerance($floor, $submitted)) {
                    $variances[] = ['day' => $dayLabel, 'type' => 'hotel', 'id' => $h['hotel_rate_id'] ?? null, 'issue' => 'below_rate_card', 'submitted' => $submitted, 'expected_floor' => round($floor, 2)];
                }
            }

            foreach (($d['transport'] ?? []) as $t) {
                $submitted = (float)($t['base_cost'] ?? $t['rate'] ?? 0);
                $floor = $this->computeCabFloor($t['cab_rate_id'] ?? null);
                if ($floor === null) {
                    if (!empty($t['cab_rate_id'])) {
                        $variances[] = ['day' => $dayLabel, 'type' => 'transport', 'id' => $t['cab_rate_id'], 'issue' => 'no_matching_rate', 'submitted' => $submitted];
                    }
                } elseif ($submitted < $floor && !$this->withinTolerance($floor, $submitted)) {
                    $variances[] = ['day' => $dayLabel, 'type' => 'transport', 'id' => $t['cab_rate_id'], 'issue' => 'below_rate_card', 'submitted' => $submitted, 'expected_floor' => round($floor, 2)];
                }
            }

            foreach (($d['excursions'] ?? []) as $e) {
                $submitted = (float)($e['total_cost'] ?? 0);
                $expected = $this->computeExcursionExpected($e['excursion_id'] ?? null, (int)($e['adult_count'] ?? 0), (int)($e['child_count'] ?? 0));
                if ($expected === null) {
                    $variances[] = ['day' => $dayLabel, 'type' => 'excursion', 'id' => $e['excursion_id'] ?? null, 'issue' => 'no_matching_rate', 'submitted' => $submitted];
                } elseif (!$this->withinTolerance($expected, $submitted)) {
                    $variances[] = ['day' => $dayLabel, 'type' => 'excursion', 'id' => $e['excursion_id'] ?? null, 'issue' => 'mismatch', 'submitted' => $submitted, 'expected' => round($expected, 2)];
                }
            }
        }

        return ['flagged' => count($variances) > 0, 'variances' => $variances];
    }

    public static function normalizeStatus(?string $st): string {
        $s = trim($st ?? '');
        if (strcasecmp($s, 'Booking Confirmed') === 0 || strcasecmp($s, 'Confirmed') === 0 || strcasecmp($s, 'Accepted') === 0 || strcasecmp($s, 'Converted') === 0) {
            return 'Booking Confirmed';
        }
        if (strcasecmp($s, 'Quote Sent') === 0 || strcasecmp($s, 'Quoted') === 0 || strcasecmp($s, 'Sent') === 0) {
            return 'Quote Sent';
        }
        if (strcasecmp($s, 'Saved') === 0) return 'Saved';
        if (strcasecmp($s, 'Cancelled') === 0 || strcasecmp($s, 'Rejected') === 0 || strcasecmp($s, 'Dropped') === 0) return 'Cancelled';
        if (strcasecmp($s, 'Revised') === 0) return 'Revised';
        return 'Draft';
    }

    public static function cleanDestinationString(?string $val): string {
        if (empty($val)) return '';
        $v = trim($val);
        if ((str_starts_with($v, '[') && str_ends_with($v, ']')) || (str_starts_with($v, '{') && str_ends_with($v, '}'))) {
            $decoded = json_decode($v, true);
            if (is_array($decoded)) {
                $parts = [];
                foreach ($decoded as $item) {
                    if (is_array($item)) {
                        $c = trim($item['city'] ?? $item['destination'] ?? $item['name'] ?? '');
                        $s = trim($item['state'] ?? '');
                        $n = !empty($item['nights']) ? " ({$item['nights']}N)" : '';
                        if ($c && $s && count($decoded) === 1) $parts[] = "{$c}, {$s}{$n}";
                        elseif ($c) $parts[] = "{$c}{$n}";
                        elseif ($s) $parts[] = "{$s}{$n}";
                    } elseif (is_string($item) && !str_starts_with($item, '[') && !str_starts_with($item, '{')) {
                        $parts[] = trim($item);
                    }
                }
                return !empty($parts) ? implode(' • ', $parts) : $val;
            }
        }
        return $val;
    }

    public function save(array $data, array $user): array {
        $leadId = $data['lead_id'] ?? null;
        if (empty($leadId)) {
            throw new InvalidArgumentException('lead_id is required');
        }

        $itineraryId = $data['id'] ?? '';
        if (empty($itineraryId)) {
            $itineraryId = sprintf(
                '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(16384, 20479),
                mt_rand(32768, 49151),
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
        }

        $itineraryName = $data['itinerary_name'] ?? 'Custom Itinerary';
        $destinations = isset($data['destinations']) ? (is_array($data['destinations']) ? json_encode($data['destinations']) : $data['destinations']) : '[]';
        $adultCount = (int)($data['adult_count'] ?? 2);
        $childCount = (int)($data['child_count'] ?? 0);
        $infantCount = (int)($data['infant_count'] ?? 0);
        $totalNights = (int)($data['total_nights'] ?? 1);
        $travelStartDate = !empty($data['travel_start_date']) ? $data['travel_start_date'] : null;
        $travelEndDate = !empty($data['travel_end_date']) ? $data['travel_end_date'] : null;

        $hotelCost = (float)($data['hotel_cost'] ?? 0);
        $transportCost = (float)($data['transport_cost'] ?? 0);
        $excursionCost = (float)($data['excursion_cost'] ?? 0);
        $totalCost = $hotelCost + $transportCost + $excursionCost;
        $visaCost = (float)($data['visa_cost'] ?? 0);
        $markupPercentage = (float)($data['markup_percentage'] ?? 0);
        $finalCost = (float)($data['final_cost'] ?? 0);
        $costPerPerson = (float)($data['cost_per_person'] ?? 0);
        $notes = $data['notes'] ?? null;
        
        $rawStatus = trim($data['status'] ?? '');
        $status = self::normalizeStatus($rawStatus);
        if ($status === 'Draft') {
            // Check if this lead or itinerary is already confirmed in DB so we never accidentally overwrite it to Draft
            if ($leadId) {
                try {
                    $lCheck = $this->pdo->prepare("SELECT status FROM leads WHERE id = ? LIMIT 1");
                    $lCheck->execute([$leadId]);
                    $lSt = $lCheck->fetchColumn();
                    if ($lSt && (strcasecmp($lSt, 'Booking Confirmed') === 0 || strcasecmp($lSt, 'Confirmed') === 0)) {
                        $status = 'Booking Confirmed';
                    }
                } catch (Exception $lcEx) {}
            }
        }

        $days = $data['days'] ?? [];
        $overrideReason = trim($data['override_reason'] ?? '');

        $customerName = trim($data['customer_name'] ?? '');
        $customerEmail = trim($data['customer_email'] ?? '');
        $customerPhone = trim($data['customer_phone'] ?? '');

        if ($leadId && (empty($customerName) || empty($customerEmail))) {
            try {
                $lStmt = $this->pdo->prepare("SELECT customer_name, customer_email, customer_phone, email, contact_number FROM leads WHERE id = ? LIMIT 1");
                $lStmt->execute([$leadId]);
                $lRow = $lStmt->fetch(PDO::FETCH_ASSOC);
                if ($lRow) {
                    if (empty($customerName)) $customerName = $lRow['customer_name'] ?: '';
                    if (empty($customerEmail)) $customerEmail = $lRow['customer_email'] ?: ($lRow['email'] ?: '');
                    if (empty($customerPhone)) $customerPhone = $lRow['customer_phone'] ?: ($lRow['contact_number'] ?: '');
                }
            } catch (Exception $le) {}
        }

        if (empty($customerName) || strcasecmp($customerName, 'Valued Client') === 0 || strcasecmp($customerName, 'Guest') === 0) {
            if (!empty($itineraryName) && preg_match('/^Itinerary for\s+([^–—\-|]+)/i', $itineraryName, $m)) {
                $extracted = trim($m[1]);
                if ($extracted && strcasecmp($extracted, 'Valued Client') !== 0 && strcasecmp($extracted, 'Guest') !== 0) {
                    $customerName = $extracted;
                }
            }
        }

        $pricingCheck = $this->validateAndAnnotatePricing($days);
        if ($pricingCheck['flagged']) {
            error_log('[ItineraryModel] pricing variance for lead ' . $leadId . ': ' . json_encode($pricingCheck['variances']));
        }

        $hasPricingColumns = $this->hasPricingColumns();
        $hasCustName = $this->getColumn('itineraries', ['customer_name']);
        $hasCustEmail = $this->getColumn('itineraries', ['customer_email']);
        $hasCustPhone = $this->getColumn('itineraries', ['customer_phone']);

        $extraCols = [];
        $extraVals = [];
        $extraUpdates = [];
        if ($hasCustName) {
            $extraCols[] = 'customer_name';
            $extraVals[] = ':customer_name';
            $extraUpdates[] = 'customer_name = VALUES(customer_name)';
        }
        if ($hasCustEmail) {
            $extraCols[] = 'customer_email';
            $extraVals[] = ':customer_email';
            $extraUpdates[] = 'customer_email = VALUES(customer_email)';
        }
        if ($hasCustPhone) {
            $extraCols[] = 'customer_phone';
            $extraVals[] = ':customer_phone';
            $extraUpdates[] = 'customer_phone = VALUES(customer_phone)';
        }

        $custColSql = !empty($extraCols) ? ', ' . implode(', ', $extraCols) : '';
        $custValSql = !empty($extraVals) ? ', ' . implode(', ', $extraVals) : '';
        $custUpdateSql = !empty($extraUpdates) ? ', ' . implode(', ', $extraUpdates) : '';

        try {
            $this->pdo->beginTransaction();

            $pricingCols = $hasPricingColumns ? ", pricing_flagged, pricing_variance" : "";
            $pricingVals = $hasPricingColumns ? ", :pricing_flagged, :pricing_variance" : "";
            $pricingUpdate = $hasPricingColumns ? ", pricing_flagged = VALUES(pricing_flagged), pricing_variance = VALUES(pricing_variance)" : "";

            $stmtItin = $this->pdo->prepare("
                INSERT INTO itineraries (
                    id, lead_id, itinerary_name, destinations, adult_count, child_count, infant_count,
                    total_nights, travel_start_date, travel_end_date, hotel_cost, transport_cost,
                    excursion_cost, total_cost, visa_cost, markup_percentage, final_cost, cost_per_person, notes, status
                    $pricingCols
                    $custColSql
                ) VALUES (
                    :id, :lead_id, :itinerary_name, :destinations, :adult_count, :child_count, :infant_count,
                    :total_nights, :travel_start_date, :travel_end_date, :hotel_cost, :transport_cost,
                    :excursion_cost, :total_cost, :visa_cost, :markup_percentage, :final_cost, :cost_per_person, :notes, :status
                    $pricingVals
                    $custValSql
                ) ON DUPLICATE KEY UPDATE
                    lead_id = VALUES(lead_id),
                    itinerary_name = VALUES(itinerary_name),
                    destinations = VALUES(destinations),
                    adult_count = VALUES(adult_count),
                    child_count = VALUES(child_count),
                    infant_count = VALUES(infant_count),
                    total_nights = VALUES(total_nights),
                    travel_start_date = VALUES(travel_start_date),
                    travel_end_date = VALUES(travel_end_date),
                    hotel_cost = VALUES(hotel_cost),
                    transport_cost = VALUES(transport_cost),
                    excursion_cost = VALUES(excursion_cost),
                    total_cost = VALUES(total_cost),
                    visa_cost = VALUES(visa_cost),
                    markup_percentage = VALUES(markup_percentage),
                    final_cost = VALUES(final_cost),
                    cost_per_person = VALUES(cost_per_person),
                    notes = VALUES(notes),
                    status = VALUES(status)
                    $pricingUpdate
                    $custUpdateSql
            ");

            $itinParams = [
                ':id' => $itineraryId,
                ':lead_id' => $leadId,
                ':itinerary_name' => $itineraryName,
                ':destinations' => $destinations,
                ':adult_count' => $adultCount,
                ':child_count' => $childCount,
                ':infant_count' => $infantCount,
                ':total_nights' => $totalNights,
                ':travel_start_date' => $travelStartDate,
                ':travel_end_date' => $travelEndDate,
                ':hotel_cost' => $hotelCost,
                ':transport_cost' => $transportCost,
                ':excursion_cost' => $excursionCost,
                ':total_cost' => $totalCost,
                ':visa_cost' => $visaCost,
                ':markup_percentage' => $markupPercentage,
                ':final_cost' => $finalCost,
                ':cost_per_person' => $costPerPerson,
                ':notes' => $notes,
                ':status' => $status
            ];
            if ($hasCustName) $itinParams[':customer_name'] = $customerName;
            if ($hasCustEmail) $itinParams[':customer_email'] = $customerEmail;
            if ($hasCustPhone) $itinParams[':customer_phone'] = $customerPhone;

            if ($hasPricingColumns) {
                $varianceData = ['variances' => $pricingCheck['variances']];
                if (!empty($overrideReason)) {
                    $varianceData['override_reason'] = $overrideReason;
                    $varianceData['override_by'] = $user['email'] ?? $user['id'] ?? 'unknown';
                    $varianceData['override_at'] = date('Y-m-d H:i:s');
                }
                $itinParams[':pricing_flagged'] = $pricingCheck['flagged'] ? 1 : 0;
                $itinParams[':pricing_variance'] = json_encode($varianceData);
            }
            $stmtItin->execute($itinParams);

            // Clear existing child tables for this itinerary
            $this->pdo->prepare("DELETE FROM itinerary_hotels WHERE itinerary_id = ?")->execute([$itineraryId]);
            $this->pdo->prepare("DELETE FROM itinerary_transport WHERE itinerary_id = ?")->execute([$itineraryId]);
            $this->pdo->prepare("DELETE FROM itinerary_excursions WHERE itinerary_id = ?")->execute([$itineraryId]);
            $this->pdo->prepare("DELETE FROM itinerary_days WHERE itinerary_id = ?")->execute([$itineraryId]);

            // Prepared statements for child records
            $stmtDay = $this->pdo->prepare("
                INSERT INTO itinerary_days (
                    itinerary_id, day_number, title, description, accommodation_city, city, meals, metadata, date
                ) VALUES (
                    :itinerary_id, :day_number, :title, :description, :accommodation_city, :city, :meals, :metadata, :date
                )
            ");

            $stmtHotel = $this->pdo->prepare("
                INSERT INTO itinerary_hotels (
                    id, itinerary_id, itinerary_day_id, hotel_id, hotel_rate_id, check_in_date, check_out_date,
                    nights, rooms, total_cost, meal_plan, room_category, room_configuration, rate_per_night,
                    room_cost, gst_cost, special_requests
                ) VALUES (
                    :id, :itinerary_id, :itinerary_day_id, :hotel_id, :hotel_rate_id, :check_in_date, :check_out_date,
                    :nights, :rooms, :total_cost, :meal_plan, :room_category, :room_configuration, :rate_per_night,
                    :room_cost, :gst_cost, :special_requests
                )
            ");

            $stmtTrans = $this->pdo->prepare("
                INSERT INTO itinerary_transport (
                    id, itinerary_id, itinerary_day_id, cab_rate_id, pickup_location, drop_location, pickup_time,
                    distance_km, total_cost, transport_type, vehicle_type, route_from, route_to, pickup_date,
                    rate, base_cost, gst_cost, driver_cost, toll_charges, parking_charges, state_tax, permit_charges,
                    gst_percentage, gst_included, markup_amount, markup_percentage, profit_margin, selling_cost, supplier_cost
                ) VALUES (
                    :id, :itinerary_id, :itinerary_day_id, :cab_rate_id, :pickup_location, :drop_location, :pickup_time,
                    :distance_km, :total_cost, :transport_type, :vehicle_type, :route_from, :route_to, :pickup_date,
                    :rate, :base_cost, :gst_cost, :driver_cost, :toll_charges, :parking_charges, :state_tax, :permit_charges,
                    :gst_percentage, :gst_included, :markup_amount, :markup_percentage, :profit_margin, :selling_cost, :supplier_cost
                )
            ");

            $stmtExc = $this->pdo->prepare("
                INSERT INTO itinerary_excursions (
                    id, itinerary_id, itinerary_day_id, excursion_id, total_cost, excursion_date, excursion_time,
                    adult_count, child_count, adult_rate, child_rate
                ) VALUES (
                    :id, :itinerary_id, :itinerary_day_id, :excursion_id, :total_cost, :excursion_date, :excursion_time,
                    :adult_count, :child_count, :adult_rate, :child_rate
                )
            ");

            foreach ($days as $d) {
                $mealsJson = isset($d['meals']) ? json_encode($d['meals']) : '[]';
                $metaJson = isset($d['metadata']) ? json_encode($d['metadata']) : '{"blocks":[]}';
                $dayDate = !empty($d['date']) ? $d['date'] : null;

                $stmtDay->execute([
                    ':itinerary_id' => $itineraryId,
                    ':day_number' => (int)($d['day_number'] ?? 1),
                    ':title' => $d['title'] ?? 'Day Title',
                    ':description' => $d['description'] ?? null,
                    ':accommodation_city' => $d['accommodation_city'] ?? null,
                    ':city' => $d['city'] ?? null,
                    ':meals' => $mealsJson,
                    ':metadata' => $metaJson,
                    ':date' => $dayDate
                ]);

                $dayInsertId = $this->pdo->lastInsertId();

                if (isset($d['hotels']) && is_array($d['hotels'])) {
                    foreach ($d['hotels'] as $h) {
                        $hUuid = $h['id'] ?? sprintf(
                            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                            mt_rand(16384, 20479), mt_rand(32768, 49151),
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                        );
                        $roomConfigJson = isset($h['room_configuration']) ? json_encode($h['room_configuration']) : '{"doubleRooms":1}';
                        $stmtHotel->execute([
                            ':id' => $hUuid,
                            ':itinerary_id' => $itineraryId,
                            ':itinerary_day_id' => $dayInsertId,
                            ':hotel_id' => $h['hotel_id'],
                            ':hotel_rate_id' => $h['hotel_rate_id'] ?? null,
                            ':check_in_date' => $h['check_in_date'] ?? $dayDate,
                            ':check_out_date' => $h['check_out_date'] ?? $dayDate,
                            ':nights' => (int)($h['nights'] ?? 1),
                            ':rooms' => (int)($h['rooms'] ?? 1),
                            ':total_cost' => (float)($h['total_cost'] ?? 0),
                            ':meal_plan' => $h['meal_plan'] ?? 'CP',
                            ':room_category' => $h['room_category'] ?? 'Standard',
                            ':room_configuration' => $roomConfigJson,
                            ':rate_per_night' => (float)($h['rate_per_night'] ?? 0),
                            ':room_cost' => (float)($h['room_cost'] ?? 0),
                            ':gst_cost' => (float)($h['gst_cost'] ?? 0),
                            ':special_requests' => $h['special_requests'] ?? null
                        ]);
                    }
                }

                if (isset($d['transport']) && is_array($d['transport'])) {
                    foreach ($d['transport'] as $t) {
                        $tUuid = $t['id'] ?? sprintf(
                            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                            mt_rand(16384, 20479), mt_rand(32768, 49151),
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                        );
                        $stmtTrans->execute([
                            ':id' => $tUuid,
                            ':itinerary_id' => $itineraryId,
                            ':itinerary_day_id' => $dayInsertId,
                            ':cab_rate_id' => $t['cab_rate_id'] ?? null,
                            ':pickup_location' => $t['pickup_location'] ?? $t['route_from'] ?? '',
                            ':drop_location' => $t['drop_location'] ?? $t['route_to'] ?? '',
                            ':pickup_time' => !empty($t['pickup_time']) ? $t['pickup_time'] : '09:00:00',
                            ':distance_km' => (float)($t['distance_km'] ?? 0),
                            ':total_cost' => (float)($t['total_cost'] ?? 0),
                            ':transport_type' => $t['transport_type'] ?? 'Per Day',
                            ':vehicle_type' => $t['vehicle_type'] ?? '',
                            ':route_from' => $t['route_from'] ?? '',
                            ':route_to' => $t['route_to'] ?? '',
                            ':pickup_date' => $t['pickup_date'] ?? $dayDate,
                            ':rate' => (float)($t['rate'] ?? 0),
                            ':base_cost' => (float)($t['base_cost'] ?? 0),
                            ':gst_cost' => (float)($t['gst_cost'] ?? 0),
                            ':driver_cost' => (float)($t['driver_cost'] ?? 0),
                            ':toll_charges' => (float)($t['toll_charges'] ?? 0),
                            ':parking_charges' => (float)($t['parking_charges'] ?? 0),
                            ':state_tax' => (float)($t['state_tax'] ?? 0),
                            ':permit_charges' => (float)($t['permit_charges'] ?? 0),
                            ':gst_percentage' => (float)($t['gst_percentage'] ?? 5.00),
                            ':gst_included' => isset($t['gst_included']) && $t['gst_included'] ? 1 : 0,
                            ':markup_amount' => (float)($t['markup_amount'] ?? 0),
                            ':markup_percentage' => (float)($t['markup_percentage'] ?? 0),
                            ':profit_margin' => (float)($t['profit_margin'] ?? 0),
                            ':selling_cost' => (float)($t['selling_cost'] ?? 0),
                            ':supplier_cost' => (float)($t['supplier_cost'] ?? 0)
                        ]);
                    }
                }

                if (isset($d['excursions']) && is_array($d['excursions'])) {
                    foreach ($d['excursions'] as $e) {
                        $eUuid = $e['id'] ?? sprintf(
                            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                            mt_rand(16384, 20479), mt_rand(32768, 49151),
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                        );
                        $stmtExc->execute([
                            ':id' => $eUuid,
                            ':itinerary_id' => $itineraryId,
                            ':itinerary_day_id' => $dayInsertId,
                            ':excursion_id' => $e['excursion_id'],
                            ':total_cost' => (float)($e['total_cost'] ?? 0),
                            ':excursion_date' => $e['excursion_date'] ?? $dayDate,
                            ':excursion_time' => $e['excursion_time'] ?? null,
                            ':adult_count' => (int)($e['adult_count'] ?? 1),
                            ':child_count' => (int)($e['child_count'] ?? 0),
                            ':adult_rate' => (float)($e['adult_rate'] ?? 0),
                            ':child_rate' => (float)($e['child_rate'] ?? 0)
                        ]);
                    }
                }
            }

            // Sync to leads table
            $leadUpdates = [
                'package_name = :itinerary_name',
                'package_cost = :package_cost',
                'package_price = :final_cost'
            ];
            $leadParams = [
                ':itinerary_name' => $itineraryName,
                ':package_cost' => $totalCost,
                ':final_cost' => $finalCost,
                ':lead_id' => $leadId
            ];

            if ($status === 'Booking Confirmed' || $status === 'Quote Sent' || $status === 'Saved') {
                $leadUpdates[] = 'status = :lead_status';
                $leadParams[':lead_status'] = $status;
            }

            if (!empty($travelStartDate)) {
                $leadUpdates[] = 'trip_start_date = :travel_start_date';
                $leadParams[':travel_start_date'] = $travelStartDate;
            }
            if (!empty($travelEndDate)) {
                $leadUpdates[] = 'trip_end_date = :travel_end_date';
                $leadParams[':travel_end_date'] = $travelEndDate;
            }
            if (!empty($customerName) && strcasecmp($customerName, 'Valued Client') !== 0 && strcasecmp($customerName, 'Guest') !== 0) {
                $leadUpdates[] = "customer_name = COALESCE(NULLIF(customer_name, ''), NULLIF(customer_name, 'Valued Client'), :cust_name)";
                $leadParams[':cust_name'] = $customerName;
            }
            if (!empty($customerEmail)) {
                $leadUpdates[] = "customer_email = COALESCE(NULLIF(customer_email, ''), :cust_email)";
                $leadParams[':cust_email'] = $customerEmail;
            }
            if (!empty($customerPhone)) {
                $leadUpdates[] = "customer_phone = COALESCE(NULLIF(customer_phone, ''), :cust_phone)";
                $leadParams[':cust_phone'] = $customerPhone;
            }

            $stmtLead = $this->pdo->prepare("UPDATE leads SET " . implode(', ', $leadUpdates) . " WHERE id = :lead_id");
            $stmtLead->execute($leadParams);

            // Sync to quotes table so newly saved itinerary immediately appears in /crm/quotes workspace
            try {
                if ($this->tableExists('quotes')) {
                    $checkQuote = $this->pdo->prepare("SELECT id, version_number FROM quotes WHERE lead_id = ? AND (itinerary_id = ? OR itinerary_id IS NULL) ORDER BY version_number DESC LIMIT 1");
                    $checkQuote->execute([$leadId, $itineraryId]);
                    $existingQuote = $checkQuote->fetch(PDO::FETCH_ASSOC);

                    $breakdownData = json_encode([
                        'hotels' => (float)$hotelCost,
                        'transport' => (float)$transportCost,
                        'sightseeing' => (float)$excursionCost,
                        'margin' => (float)$markupPercentage,
                        'sellingPrice' => (float)$finalCost,
                        'totalCost' => (float)$totalCost
                    ]);

                    if ($existingQuote) {
                        $upQuote = $this->pdo->prepare("
                            UPDATE quotes SET 
                                itinerary_id = :itin_id,
                                total_amount = :amt,
                                package_name = :pkg,
                                cost_breakdown = :breakdown,
                                status = 'Draft',
                                updated_at = NOW()
                            WHERE id = :qid
                        ");
                        $upQuote->execute([
                            ':itin_id' => $itineraryId,
                            ':amt' => $finalCost,
                            ':pkg' => $itineraryName,
                            ':breakdown' => $breakdownData,
                            ':qid' => $existingQuote['id']
                        ]);
                    } else {
                        $quoteUuid = sprintf(
                            '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                            mt_rand(0, 0xffff),
                            mt_rand(0, 0x0fff) | 0x4000,
                            mt_rand(0, 0x3fff) | 0x8000,
                            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
                        );

                        $vStmt = $this->pdo->prepare("SELECT MAX(version_number) FROM quotes WHERE lead_id = ?");
                        $vStmt->execute([$leadId]);
                        $maxVer = (int)$vStmt->fetchColumn();
                        $newVer = $maxVer > 0 ? $maxVer + 1 : 1;

                        $insQuote = $this->pdo->prepare("
                            INSERT INTO quotes (
                                id, lead_id, itinerary_id, version_number, status,
                                total_amount, package_name, cost_breakdown, created_by
                            ) VALUES (
                                :id, :lead_id, :itinerary_id, :ver, 'Draft',
                                :amt, :pkg, :breakdown, :created_by
                            )
                        ");
                        $insQuote->execute([
                            ':id' => $quoteUuid,
                            ':lead_id' => $leadId,
                            ':itinerary_id' => $itineraryId,
                            ':ver' => $newVer,
                            ':amt' => $finalCost,
                            ':pkg' => $itineraryName,
                            ':breakdown' => $breakdownData,
                            ':created_by' => $user['id'] ?? null
                        ]);
                    }
                }
            } catch (Exception $qSyncErr) {
                error_log("Itinerary quote sync error: " . $qSyncErr->getMessage());
            }

            $this->pdo->commit();
            return [
                'success' => true,
                'itinerary_id' => $itineraryId,
                'pricing_flagged' => $pricingCheck['flagged'],
                'pricing_variances' => $pricingCheck['flagged'] ? $pricingCheck['variances'] : []
            ];

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }

    public function getById(string $id, ?string $leadId = null): ?array {
        if (!empty($id)) {
            $stmt = $this->pdo->prepare("SELECT * FROM itineraries WHERE id = ?");
            $stmt->execute([$id]);
        } else {
            $stmt = $this->pdo->prepare("SELECT * FROM itineraries WHERE lead_id = ? ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$leadId]);
        }
        
        $itinerary = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$itinerary) {
            return null;
        }

        $itineraryId = $itinerary['id'];

        $itinerary['hotel_cost'] = (float)$itinerary['hotel_cost'];
        $itinerary['transport_cost'] = (float)$itinerary['transport_cost'];
        $itinerary['excursion_cost'] = (float)$itinerary['excursion_cost'];
        $itinerary['total_cost'] = (float)$itinerary['total_cost'];
        $itinerary['visa_cost'] = (float)($itinerary['visa_cost'] ?? 0);
        $itinerary['markup_percentage'] = (float)$itinerary['markup_percentage'];
        $itinerary['final_cost'] = (float)$itinerary['final_cost'];
        $itinerary['cost_per_person'] = (float)$itinerary['cost_per_person'];
        $itinerary['adult_count'] = (int)$itinerary['adult_count'];
        $itinerary['child_count'] = (int)$itinerary['child_count'];
        $itinerary['infant_count'] = (int)$itinerary['infant_count'];
        $itinerary['total_guests'] = (int)($itinerary['total_guests'] ?? ($itinerary['adult_count'] + $itinerary['child_count'] + $itinerary['infant_count']));
        $itinerary['total_nights'] = (int)$itinerary['total_nights'];
        
        if (!empty($itinerary['destinations'])) {
            $itinerary['destinations'] = json_decode($itinerary['destinations'], true) ?: explode(',', $itinerary['destinations']);
        } else {
            $itinerary['destinations'] = [];
        }

        if (!empty($itinerary['version_history'])) {
            $itinerary['version_history'] = json_decode($itinerary['version_history'], true) ?: [];
        }

        $linkedLead = null;
        $targetLeadId = !empty($itinerary['lead_id']) ? $itinerary['lead_id'] : $leadId;
        if (!empty($targetLeadId)) {
            try {
                $leadStmt = $this->pdo->prepare("SELECT id, customer_name, customer_email, customer_phone, email, contact_number, destination, destinations, trip_start_date, trip_end_date, adult_count, child_count, infant_count, status FROM leads WHERE id = ? LIMIT 1");
                $leadStmt->execute([$targetLeadId]);
                $linkedLead = $leadStmt->fetch(PDO::FETCH_ASSOC);
                if ($linkedLead) {
                    if (empty($itinerary['customer_name']) || strcasecmp(trim($itinerary['customer_name']), 'Valued Client') === 0) {
                        $itinerary['customer_name'] = $linkedLead['customer_name'] ?: '';
                    }
                    if (empty($itinerary['customer_email']) || strcasecmp(trim($itinerary['customer_email']), 'No email registered') === 0) {
                        $itinerary['customer_email'] = $linkedLead['customer_email'] ?: ($linkedLead['email'] ?: '');
                    }
                    if (empty($itinerary['customer_phone'])) {
                        $itinerary['customer_phone'] = $linkedLead['customer_phone'] ?: ($linkedLead['contact_number'] ?: '');
                    }
                }
            } catch (Exception $le) {}
        }

        $normItinStatus = self::normalizeStatus($itinerary['status'] ?? '');
        $normLeadStatus = self::normalizeStatus($linkedLead['status'] ?? '');

        if ($normItinStatus === 'Booking Confirmed' || $normLeadStatus === 'Booking Confirmed') {
            $itinerary['status'] = 'Booking Confirmed';
        } elseif ($normItinStatus !== 'Draft') {
            $itinerary['status'] = $normItinStatus;
        } elseif ($normLeadStatus !== 'Draft') {
            $itinerary['status'] = $normLeadStatus;
        } else {
            $itinerary['status'] = 'Draft';
        }

        // Fetch days
        $stmt = $this->pdo->prepare("SELECT * FROM itinerary_days WHERE itinerary_id = ? ORDER BY day_number ASC");
        $stmt->execute([$itineraryId]);
        $days = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch sub-tables
        $stmtHotels = $this->pdo->prepare("
            SELECT ih.*, h.hotel_name, h.star_rating AS star_category
            FROM itinerary_hotels ih
            LEFT JOIN hotels h ON h.id = ih.hotel_id
            WHERE ih.itinerary_id = ?
        ");
        $stmtHotels->execute([$itineraryId]);
        $allHotels = $stmtHotels->fetchAll(PDO::FETCH_ASSOC);

        $stmtTrans = $this->pdo->prepare("SELECT * FROM itinerary_transport WHERE itinerary_id = ?");
        $stmtTrans->execute([$itineraryId]);
        $allTrans = $stmtTrans->fetchAll(PDO::FETCH_ASSOC);

        $stmtExcs = $this->pdo->prepare("SELECT * FROM itinerary_excursions WHERE itinerary_id = ?");
        $stmtExcs->execute([$itineraryId]);
        $allExcs = $stmtExcs->fetchAll(PDO::FETCH_ASSOC);

        $hotelsByDay = [];
        foreach ($allHotels as $h) {
            $dayId = $h['itinerary_day_id'] ?: ($h['day_id'] ?? null);
            if ($dayId) {
                $h['rate_per_night'] = (float)$h['rate_per_night'];
                $h['room_cost'] = (float)$h['room_cost'];
                $h['gst_cost'] = (float)$h['gst_cost'];
                $h['total_cost'] = (float)$h['total_cost'];
                $h['nights'] = (int)$h['nights'];
                $h['rooms'] = (int)$h['rooms'];
                if (!empty($h['room_configuration'])) {
                    $h['room_configuration'] = json_decode($h['room_configuration'], true) ?: ['doubleRooms' => 1];
                }
                $hotelsByDay[$dayId][] = $h;
            }
        }

        $transByDay = [];
        foreach ($allTrans as $t) {
            $dayId = $t['itinerary_day_id'] ?: ($t['day_id'] ?? null);
            if ($dayId) {
                $t['rate'] = (float)$t['rate'];
                $t['base_cost'] = (float)$t['base_cost'];
                $t['gst_cost'] = (float)$t['gst_cost'];
                $t['driver_cost'] = (float)$t['driver_cost'];
                $t['toll_charges'] = (float)$t['toll_charges'];
                $t['parking_charges'] = (float)$t['parking_charges'];
                $t['state_tax'] = (float)$t['state_tax'];
                $t['permit_charges'] = (float)$t['permit_charges'];
                $t['gst_percentage'] = (float)$t['gst_percentage'];
                $t['gst_included'] = (bool)$t['gst_included'];
                $t['total_cost'] = (float)$t['total_cost'];
                $t['distance_km'] = (float)$t['distance_km'];
                $transByDay[$dayId][] = $t;
            }
        }

        $excsByDay = [];
        foreach ($allExcs as $e) {
            $dayId = $e['itinerary_day_id'] ?: ($e['day_id'] ?? null);
            if ($dayId) {
                $e['adult_count'] = (int)$e['adult_count'];
                $e['child_count'] = (int)$e['child_count'];
                $e['adult_rate'] = (float)$e['adult_rate'];
                $e['child_rate'] = (float)$e['child_rate'];
                $e['total_cost'] = (float)$e['total_cost'];
                $excsByDay[$dayId][] = $e;
            }
        }

        foreach ($days as &$day) {
            $dayId = $day['id'];
            $day['day_number'] = (int)$day['day_number'];
            $day['meals'] = !empty($day['meals']) ? (json_decode($day['meals'], true) ?: []) : [];
            $day['metadata'] = !empty($day['metadata']) ? (json_decode($day['metadata'], true) ?: ['blocks' => []]) : ['blocks' => []];
            $day['hotels'] = $hotelsByDay[$dayId] ?? [];
            $day['transport'] = $transByDay[$dayId] ?? [];
            $day['excursions'] = $excsByDay[$dayId] ?? [];
        }

        $itinerary['days'] = $days;
        return [
            'itinerary' => $itinerary,
            'lead' => $linkedLead
        ];
    }

    public function listAll(array $filters = []): array {
        $stmt = $this->pdo->query("SELECT 
            i.*,
            l.customer_name AS lead_customer_name,
            l.customer_email AS lead_customer_email,
            l.customer_phone AS lead_customer_phone,
            l.destinations AS lead_destinations,
            l.trip_start_date AS lead_trip_start_date,
            l.trip_end_date AS lead_trip_end_date,
            l.travel_month AS lead_travel_month,
            l.status AS lead_status
        FROM itineraries i
        LEFT JOIN leads l ON i.lead_id = l.id
        ORDER BY i.created_at DESC");
        
        $itineraries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $acceptedProps = [];
        try {
            $pStmt = $this->pdo->query("SELECT id, lead_id, total_price, title FROM proposals WHERE status = 'Accepted'");
            while ($pr = $pStmt->fetch(PDO::FETCH_ASSOC)) {
                $acceptedProps[(int)$pr['lead_id']] = $pr;
            }
        } catch (Exception $pe) {}

        foreach ($itineraries as &$itin) {
            $rawPkg = !empty($itin['itinerary_name']) ? $itin['itinerary_name'] : ($itin['package_name'] ?? 'Custom Tour Package');
            $packageName = self::cleanDestinationString($rawPkg);
            $itin['package_name'] = $packageName;

            $custName = !empty($itin['customer_name']) ? trim($itin['customer_name']) : '';
            if (empty($custName) || strcasecmp($custName, 'Valued Client') === 0 || strcasecmp($custName, 'Guest') === 0) {
                if (!empty($itin['lead_customer_name']) && strcasecmp(trim($itin['lead_customer_name']), 'Valued Client') !== 0) {
                    $custName = trim($itin['lead_customer_name']);
                } elseif (!empty($packageName) && preg_match('/^Itinerary for\s+([^–—\-|]+)/i', $packageName, $m)) {
                    $extracted = trim($m[1]);
                    if ($extracted && strcasecmp($extracted, 'Valued Client') !== 0 && strcasecmp($extracted, 'Guest') !== 0) {
                        $custName = $extracted;
                    }
                }
            }
            $itin['customer_name'] = !empty($custName) ? $custName : 'Valued Client';

            $custEmail = !empty($itin['customer_email']) ? trim($itin['customer_email']) : '';
            if (empty($custEmail) && !empty($itin['lead_customer_email'])) {
                $custEmail = trim($itin['lead_customer_email']);
            }
            $itin['customer_email'] = $custEmail;

            $custPhone = !empty($itin['customer_phone']) ? trim($itin['customer_phone']) : '';
            if (empty($custPhone) && !empty($itin['lead_customer_phone'])) {
                $custPhone = trim($itin['lead_customer_phone']);
            }
            $itin['customer_phone'] = $custPhone;

            $dests = !empty($itin['destinations']) ? $itin['destinations'] : (!empty($itin['lead_destinations']) ? $itin['lead_destinations'] : '');
            $itin['destinations'] = self::cleanDestinationString($dests);

            $tinSt = self::normalizeStatus($itin['status'] ?? '');
            $lidSt = self::normalizeStatus($itin['lead_status'] ?? '');
            if ($tinSt === 'Booking Confirmed' || $lidSt === 'Booking Confirmed') {
                $itin['status'] = 'Booking Confirmed';
            } elseif ($tinSt !== 'Draft') {
                $itin['status'] = $tinSt;
            } elseif ($lidSt !== 'Draft') {
                $itin['status'] = $lidSt;
            } else {
                $itin['status'] = 'Draft';
            }

            $itin['final_cost'] = (float)($itin['final_cost'] ?? 0);
            $itin['cost_per_person'] = (float)($itin['cost_per_person'] ?? 0);
            $itin['total_nights'] = (int)($itin['total_nights'] ?? 1);
            $itin['adult_count'] = (int)($itin['adult_count'] ?? 2);
            $itin['child_count'] = (int)($itin['child_count'] ?? 0);

            $itinLeadId = (int)($itin['lead_id'] ?? 0);
            if (isset($acceptedProps[$itinLeadId])) {
                $itin['has_accepted_proposal'] = true;
                $itin['accepted_proposal_price'] = (float)$acceptedProps[$itinLeadId]['total_price'];
                $itin['status'] = 'Booking Confirmed';
            }
        }

        return $itineraries;
    }

    public function listByLead(string|int $leadId): array {
        $stmt = $this->pdo->prepare("
            SELECT id, itinerary_name, status, final_cost, cost_per_person, total_nights, created_at 
            FROM itineraries 
            WHERE lead_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->execute([$leadId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function updateStatus(string|int $id, ?int $leadId, string $status): array {
        $normStatus = self::normalizeStatus($status);

        $existing = null;
        if (!empty($id)) {
            $checkStmt = $this->pdo->prepare("SELECT id, lead_id, status FROM itineraries WHERE id = ? LIMIT 1");
            $checkStmt->execute([$id]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
        }

        if (!$existing && !empty($leadId)) {
            $checkStmt = $this->pdo->prepare("SELECT id, lead_id, status FROM itineraries WHERE lead_id = ? ORDER BY id DESC LIMIT 1");
            $checkStmt->execute([$leadId]);
            $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);
        }

        $actualId = $existing['id'] ?? $id;
        $targetLeadId = $existing['lead_id'] ?? $leadId;

        if ($actualId) {
            $updateStmt = $this->pdo->prepare("UPDATE itineraries SET status = :status, updated_at = NOW() WHERE id = :id");
            $updateStmt->execute([
                ':status' => $normStatus,
                ':id'     => $actualId
            ]);
        }
        if ($targetLeadId) {
            $updateLeadItins = $this->pdo->prepare("UPDATE itineraries SET status = :status, updated_at = NOW() WHERE lead_id = :lead_id");
            $updateLeadItins->execute([
                ':status' => $normStatus,
                ':lead_id' => $targetLeadId
            ]);
        }

        if ($targetLeadId && $this->tableExists('proposals')) {
            try {
                $propStmt = $this->pdo->prepare("UPDATE proposals SET status = :status, updated_at = NOW() WHERE lead_id = :lead_id");
                $propStmt->execute([':status' => $normStatus, ':lead_id' => $targetLeadId]);
            } catch (Exception $pe) {}
        }

        $leadUpdated = false;
        if ($targetLeadId) {
            try {
                if ($normStatus === 'Booking Confirmed' || $normStatus === 'Quote Sent') {
                    $leadStmt = $this->pdo->prepare("UPDATE leads SET status = :status, updated_at = NOW() WHERE id = ?");
                    $leadStmt->execute([$normStatus, $targetLeadId]);
                    $leadUpdated = true;
                }
            } catch (Exception $leadErr) {}
        }

        return [
            'success'      => true,
            'id'           => $actualId,
            'status'       => $normStatus,
            'lead_id'      => $targetLeadId,
            'lead_updated' => $leadUpdated
        ];
    }

    public function confirmLeg(int $proposalId, string $legType, string $legId, array $input, array $user): array {
        $validTypes = ['hotel', 'transport', 'activity', 'sightseeing'];
        if ($proposalId <= 0 || !in_array($legType, $validTypes, true) || $legId === '') {
            throw new InvalidArgumentException('proposal_id, valid leg_type (hotel, transport, activity, sightseeing), and leg_id are required');
        }

        $stmt = $this->pdo->prepare("SELECT id, lead_id, itinerary_data FROM proposals WHERE id = ?");
        $stmt->execute([$proposalId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            throw new RuntimeException('Proposal not found');
        }

        $leadId = (int)$row['lead_id'];
        $itineraryData = is_string($row['itinerary_data']) ? json_decode($row['itinerary_data'], true) : ($row['itinerary_data'] ?? []);
        if (!is_array($itineraryData)) {
            $itineraryData = [];
        }

        $found = false;
        $currentUserIdentifier = $user['email'] ?? ($user['user_id'] ?? ($user['sub'] ?? 'agent'));
        $nowIso = date('c');

        $collectionKey = match($legType) {
            'hotel' => 'hotels',
            'transport' => 'transport',
            'activity', 'sightseeing' => 'activities',
            default => 'hotels'
        };

        if (isset($itineraryData[$collectionKey]) && is_array($itineraryData[$collectionKey])) {
            foreach ($itineraryData[$collectionKey] as &$leg) {
                if ((string)($leg['id'] ?? '') === $legId) {
                    $found = true;
                    if ($legType === 'hotel') {
                        if (isset($input['confirmation_number'])) $leg['confirmation_number'] = trim((string)$input['confirmation_number']);
                        if (isset($input['hotel_contact'])) $leg['hotel_contact'] = trim((string)$input['hotel_contact']);
                        $leg['confirmation_status'] = !empty($leg['confirmation_number']) ? 'Confirmed' : 'Pending';
                    } elseif ($legType === 'transport') {
                        if (isset($input['driver_name'])) $leg['driver_name'] = trim((string)$input['driver_name']);
                        if (isset($input['driver_phone'])) $leg['driver_phone'] = trim((string)$input['driver_phone']);
                        if (isset($input['vehicle_number'])) $leg['vehicle_number'] = trim((string)$input['vehicle_number']);
                        $leg['confirmation_status'] = !empty($leg['driver_name']) ? 'Confirmed' : 'Pending';
                    } else {
                        if (isset($input['confirmation_number'])) $leg['confirmation_number'] = trim((string)$input['confirmation_number']);
                        if (isset($input['operator_name'])) $leg['operator_name'] = trim((string)$input['operator_name']);
                        if (isset($input['guide_contact'])) $leg['guide_contact'] = trim((string)$input['guide_contact']);
                        if (isset($input['slot_time'])) $leg['slot_time'] = trim((string)$input['slot_time']);
                        $leg['confirmation_status'] = !empty($leg['confirmation_number']) ? 'Confirmed' : 'Pending';
                    }
                    $leg['confirmed_by'] = $currentUserIdentifier;
                    $leg['confirmed_at'] = $nowIso;
                }
            }
            unset($leg);
        }

        if (isset($itineraryData['days']) && is_array($itineraryData['days'])) {
            foreach ($itineraryData['days'] as &$day) {
                if (isset($day['metadata']['blocks']) && is_array($day['metadata']['blocks'])) {
                    foreach ($day['metadata']['blocks'] as &$block) {
                        if ((string)($block['id'] ?? '') === $legId) {
                            $found = true;
                            if (!isset($block['properties']) || !is_array($block['properties'])) {
                                $block['properties'] = [];
                            }

                            if ($legType === 'hotel') {
                                if (isset($input['confirmation_number'])) {
                                    $block['properties']['hotel_conf_no'] = trim((string)$input['confirmation_number']);
                                    $block['properties']['confirmation_number'] = trim((string)$input['confirmation_number']);
                                }
                                if (isset($input['hotel_contact'])) {
                                    $block['properties']['hotel_contact'] = trim((string)$input['hotel_contact']);
                                }
                                $block['properties']['confirmation_status'] = !empty($block['properties']['confirmation_number']) ? 'Confirmed' : 'Pending';
                            } elseif ($legType === 'transport') {
                                if (isset($input['driver_name'])) $block['properties']['driver_name'] = trim((string)$input['driver_name']);
                                if (isset($input['driver_phone'])) $block['properties']['driver_phone'] = trim((string)$input['driver_phone']);
                                if (isset($input['vehicle_number'])) $block['properties']['vehicle_number'] = trim((string)$input['vehicle_number']);
                                $block['properties']['confirmation_status'] = !empty($block['properties']['driver_name']) ? 'Confirmed' : 'Pending';
                            } else {
                                if (isset($input['confirmation_number'])) {
                                    $block['properties']['confirmation_number'] = trim((string)$input['confirmation_number']);
                                    $block['properties']['ticket_number'] = trim((string)$input['confirmation_number']);
                                }
                                if (isset($input['operator_name'])) $block['properties']['operator_name'] = trim((string)$input['operator_name']);
                                if (isset($input['guide_contact'])) $block['properties']['guide_contact'] = trim((string)$input['guide_contact']);
                                if (isset($input['slot_time'])) $block['properties']['slot_time'] = trim((string)$input['slot_time']);
                                $block['properties']['confirmation_status'] = !empty($block['properties']['confirmation_number']) ? 'Confirmed' : 'Pending';
                            }
                            $block['properties']['confirmed_by'] = $currentUserIdentifier;
                            $block['properties']['confirmed_at'] = $nowIso;
                        }
                    }
                    unset($block);
                }
            }
            unset($day);
        }

        $updateStmt = $this->pdo->prepare("UPDATE proposals SET itinerary_data = ? WHERE id = ?");
        $updateStmt->execute([json_encode($itineraryData), $proposalId]);

        try {
            if ($this->tableExists('itineraries') && isset($itineraryData['days'])) {
                $syncStmt = $this->pdo->prepare("UPDATE itineraries SET days = ? WHERE lead_id = ?");
                $syncStmt->execute([json_encode($itineraryData['days']), $leadId]);
            }
        } catch (Exception $syncErr) {}

        return [
            'success' => true,
            'proposal_id' => $proposalId,
            'leg_type' => $legType,
            'leg_id' => $legId,
            'found' => $found,
            'confirmed_by' => $currentUserIdentifier,
            'confirmed_at' => $nowIso
        ];
    }
}
