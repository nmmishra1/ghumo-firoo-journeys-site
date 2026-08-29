<?php
/**
 * Migration + seed: adds a real, decimal-numeric pricing shape to
 * variant_price_rows (it currently stores `price` as VARCHAR(100) —
 * fine for a display string, unusable for the season/occupancy math
 * this package actually needs), then seeds the Evoke Tent City package
 * (the fixed-itinerary, fixed-price Rann Utsav property at Dhordo —
 * what /packages/rann-utsav-mockup should be driven by) with the real
 * rate card and itinerary data provided by the business.
 *
 * SOURCE OF TRUTH: the numbers below come from "Ran Utsav ratecard-2026"
 * and the three itinerary documents (1/2/3 nights) supplied directly —
 * not invented. Two things in the source material could not be read
 * reliably and are called out explicitly below rather than guessed:
 *   1. The exact calendar date ranges for Season 1/2/3 — the ratecard
 *      says "refer to the calendar" and the calendar itself is a
 *      scanned image that didn't OCR into usable text. This migration
 *      does NOT set season date ranges — it seeds the RATES per season
 *      tier only. The date-range logic already live in
 *      RannUtsavMockupPage.tsx (full moon / Diwali / Christmas-New Year
 *      windows = Season 3, dark-moon single dates = Season 2) was left
 *      as-is since it predates this migration and its exact provenance
 *      wasn't verifiable against the garbled calendar either — flagging
 *      this so it gets a real second look, not silently trusting it.
 *   2. Whether the Season 2/3 per-person surcharge is flat across all
 *      room categories or varies by category — the ratecard's table
 *      structure (one row, not one row per category) reads as a flat
 *      per-person addition regardless of category, and that's what's
 *      seeded here. Worth confirming with whoever owns the rate card.
 *
 * Safe to re-run: every step checks before altering/inserting.
 * Usage: php php-backend/migrations/20260822_seed_evoke_tent_city.php
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    echo "This migration must be run from the CLI, not over HTTP.\n";
    exit(1);
}

require_once __DIR__ . '/../db.php';
$pdo = getDb();

function colExists(PDO $pdo, string $table, string $col): bool {
    $s = $pdo->prepare("SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?");
    $s->execute([$table, $col]);
    return (int)$s->fetchColumn() > 0;
}

echo "== Step 1: add structured pricing columns to variant_price_rows ==\n";
$newCols = [
    'season_tier'         => "ALTER TABLE variant_price_rows ADD COLUMN season_tier TINYINT NULL COMMENT '1/2/3, NULL = flat/all-days rate' AFTER room_type",
    'price_numeric'        => "ALTER TABLE variant_price_rows ADD COLUMN price_numeric DECIMAL(10,2) NULL AFTER price",
    'occupancy_type'        => "ALTER TABLE variant_price_rows ADD COLUMN occupancy_type VARCHAR(20) NULL COMMENT 'per_person, per_unit (whole suite)' AFTER price_numeric",
    'extra_mattress_rate'   => "ALTER TABLE variant_price_rows ADD COLUMN extra_mattress_rate DECIMAL(10,2) NULL AFTER occupancy_type",
    'max_pax'               => "ALTER TABLE variant_price_rows ADD COLUMN max_pax TINYINT NULL AFTER extra_mattress_rate",
];
foreach ($newCols as $col => $sql) {
    if (colExists($pdo, 'variant_price_rows', $col)) {
        echo "  OK: variant_price_rows.$col already exists.\n";
        continue;
    }
    $pdo->exec($sql);
    echo "  DONE: added variant_price_rows.$col\n";
}
echo "\n";

echo "== Step 2: ensure the Evoke Tent City package row exists ==\n";
$packageId = 'pkg-rann-utsav-evoke-tent-city';
$exists = $pdo->prepare("SELECT COUNT(*) FROM packages WHERE id = ?");
$exists->execute([$packageId]);
if ((int)$exists->fetchColumn() === 0) {
    $pdo->prepare("INSERT INTO packages (id, slug, title, tagline, destination, active_status) VALUES (?, ?, ?, ?, ?, 1)")
        ->execute([
            $packageId,
            'rann-utsav-mockup',
            'Rann Utsav — The Tent City, Dhordo (Evoke)',
            'Fixed-itinerary, fixed-price desert camp package at White Rann, Kutch',
            'Rann Utsav, Gujarat'
        ]);
    echo "  DONE: created packages row '$packageId' (slug: rann-utsav-mockup)\n";
} else {
    echo "  OK: packages row '$packageId' already exists — leaving title/slug as-is.\n";
}
echo "\n";

echo "== Step 3: seed variants (1N/2N/3N) ==\n";
// [variant_key, label, nights, days, itinerary title/subtitle already live in
// RannUtsavMockupPage.tsx were reused verbatim as inclusions text, not
// reinvented]
$variants = [
    ['1n', '1 Night / 2 Days', 1, 2],
    ['2n', '2 Nights / 3 Days', 2, 3],
    ['3n', '3 Nights / 4 Days', 3, 4],
];
$variantIds = [];
foreach ($variants as [$key, $label, $nights, $days]) {
    $find = $pdo->prepare("SELECT id FROM package_variants WHERE package_id = ? AND variant_key = ?");
    $find->execute([$packageId, $key]);
    $vid = $find->fetchColumn();
    if (!$vid) {
        $pdo->prepare("INSERT INTO package_variants (package_id, variant_key, label, nights, days, sort_order) VALUES (?,?,?,?,?,?)")
            ->execute([$packageId, $key, $label, $nights, $days, $nights]);
        $vid = $pdo->lastInsertId();
        echo "  DONE: created variant '$key' (id $vid)\n";
    } else {
        echo "  OK: variant '$key' already exists (id $vid)\n";
    }
    $variantIds[$key] = $vid;
}
echo "\n";

echo "== Step 4: seed room-category rates per season (from the real rate card) ==\n";
// Base per-person rate for N nights, by room category, Season 1.
// Verified against "Ran Utsav ratecard-2026": each is exactly base-rate x
// nights (e.g. Super Premium 10,300 x 2 = 20,600), so one nightly rate
// per category covers all three variants.
$roomCategories = [
    // key                => [room_type_key (matches RannUtsavMockupPage.tsx's
    //                         category keys exactly, NOT a prose label —
    //                         label text differs slightly between the
    //                         ratecard and the existing frontend copy, e.g.
    //                         "Deluxe AC Swiss Cottage" vs "...Cottages", so
    //                         matching must be on a stable key, not text),
    //                        nightly_rate, season1_extra_mattress]
    'super_premium_tent'   => ['super_premium',    10300, null],  // not specified in Season 1 row
    'premium_tent'          => ['ac_premium',        9300, 5500],
    'deluxe_ac_cottage'     => ['deluxe_ac',          8300, null],  // not specified in Season 1 row
    'non_ac_cottage'        => ['non_ac',             6300, 4500],
];
// Season 2 & 3: flat per-person ADDITION on top of Season 1 base (see file
// header note #2), plus a flat extra-mattress rate that applies regardless
// of category (6,000 for Super Premium/Premium/Deluxe AC, 5,000 for Non-AC).
$seasonSurcharge = [
    2 => ['1n' => 2000, '2n' => 3500, '3n' => 4500],
    3 => ['1n' => 4000, '2n' => 6000, '3n' => 8000],
];
$seasonExtraMattress = [2 => ['default' => 6000, 'non_ac_cottage' => 5000], 3 => ['default' => 6000, 'non_ac_cottage' => 5000]];

$nightsForKey = ['1n' => 1, '2n' => 2, '3n' => 3];

foreach ($roomCategories as $catKey => [$label, $nightlyRate, $season1ExtraMattress]) {
    foreach (['1n', '2n', '3n'] as $vkey) {
        $vid = $variantIds[$vkey];
        $nights = $nightsForKey[$vkey];
        $season1Price = $nightlyRate * $nights;

        // Season 1 (base)
        upsertPriceRow($pdo, $vid, $label, 1, $season1Price, 'per_person', $season1ExtraMattress);
        // Season 2 (base + surcharge)
        $s2 = $season1Price + $seasonSurcharge[2][$vkey];
        upsertPriceRow($pdo, $vid, $label, 2, $s2, 'per_person', $seasonExtraMattress[2][$catKey] ?? $seasonExtraMattress[2]['default']);
        // Season 3 (base + surcharge)
        $s3 = $season1Price + $seasonSurcharge[3][$vkey];
        upsertPriceRow($pdo, $vid, $label, 3, $s3, 'per_person', $seasonExtraMattress[3][$catKey] ?? $seasonExtraMattress[3]['default']);
    }
}
echo "  DONE: seeded " . (count($roomCategories) * 3 * 3) . " room-category/season price rows.\n\n";

echo "== Step 5: seed suite rates (Darbari & Rajwadi — 'All Days', no season variation) ==\n";
// Real ratecard: "All Days Rates" — same price regardless of Season 1/2/3.
// occupancy_type = per_unit because these are priced per SUITE (4 Pax /
// 2 Pax capacity), not per person, per the ratecard's own labeling.
$suites = [
    ['darbari', ['1n' => 70000, '2n' => 140000, '3n' => 210000], 4],
    ['rajwadi', ['1n' => 35000, '2n' => 70000,  '3n' => 105000], 2],
];
foreach ($suites as [$label, $rates, $maxPax]) {
    foreach (['1n', '2n', '3n'] as $vkey) {
        $vid = $variantIds[$vkey];
        upsertPriceRow($pdo, $vid, $label, null, $rates[$vkey], 'per_unit', null, $maxPax);
    }
}
echo "  DONE: seeded suite rates.\n\n";

function upsertPriceRow(PDO $pdo, $variantId, $roomType, $seasonTier, $price, $occupancyType, $extraMattressRate, $maxPax = null) {
    $find = $pdo->prepare(
        "SELECT id FROM variant_price_rows WHERE variant_id = ? AND room_type = ? AND " .
        ($seasonTier === null ? "season_tier IS NULL" : "season_tier = ?")
    );
    $params = $seasonTier === null ? [$variantId, $roomType] : [$variantId, $roomType, $seasonTier];
    $find->execute($params);
    $id = $find->fetchColumn();

    $displayPrice = ($occupancyType === 'per_unit' ? '₹' . number_format($price) . ' (whole unit)' : '₹' . number_format($price) . ' per person');

    if ($id) {
        $pdo->prepare("UPDATE variant_price_rows SET price = ?, price_numeric = ?, occupancy_type = ?, extra_mattress_rate = ?, max_pax = ? WHERE id = ?")
            ->execute([$displayPrice, $price, $occupancyType, $extraMattressRate, $maxPax, $id]);
    } else {
        $pdo->prepare("INSERT INTO variant_price_rows (variant_id, room_type, season_tier, price, price_numeric, occupancy_type, extra_mattress_rate, max_pax) VALUES (?,?,?,?,?,?,?,?)")
            ->execute([$variantId, $roomType, $seasonTier, $displayPrice, $price, $occupancyType, $extraMattressRate, $maxPax]);
    }
}

echo "== Step 6: seed cancellation policy (same across all variants, per the ratecard) ==\n";
$cancellationRows = [
    ['≥ 30 days before arrival', '10% charge (90% refund)'],
    ['15–29 days before arrival', '40% charge (60% refund)'],
    ['< 15 days before arrival', 'No refund'],
    ['Check-in date change', '10% of total booking amount'],
    ['Primary guest name change', '5% of total booking amount'],
    ['Room category downgrade', '5% of total booking amount'],
];
foreach ($variantIds as $vid) {
    $count = $pdo->prepare("SELECT COUNT(*) FROM variant_cancellation WHERE variant_id = ?");
    $count->execute([$vid]);
    if ((int)$count->fetchColumn() > 0) continue; // already seeded
    $ins = $pdo->prepare("INSERT INTO variant_cancellation (variant_id, days_before, charge, sort_order) VALUES (?,?,?,?)");
    foreach ($cancellationRows as $i => [$days, $charge]) {
        $ins->execute([$vid, $days, $charge, $i]);
    }
}
echo "  DONE.\n\n";

echo "== Step 7: seed day-by-day itinerary ==\n";
// This reuses the itinerary content already transcribed (cleanly) into
// RannUtsavMockupPage.tsx's `pdfItineraries` object, rather than
// re-parsing the raw uploaded documents a second time — that transcription
// was already checked against the source itineraries and matches; copying
// it here (not retyping it) avoids introducing a second, independent
// source of transcription error for the same content.
$itineraryByVariant = [
    '1n' => [
        ['day_number' => 1, 'title' => 'Arrival at Tent City Dhordo & White Rann Sunset Walk', 'timing' => 'Day 1', 'events' => [
            ['08:15 AM - 03:30 PM', 'Fixed AC Shared Coach pickup from Bhuj Railway Station & Bhuj Airport to Tent City Dhordo (85 km / 1h 45m).'],
            ['12:30 PM Onwards', 'Warm traditional Kutchi welcome and check-in at Tent City Dhordo.'],
            ['12:30 PM - 02:30 PM', 'Delicious gourmet lunch served at the respective dining hall.'],
            ['02:30 PM - 04:30 PM', 'In-house leisure: Indulge in activities at Skyzilla, Club House, Craft Haat Market, Selfie Points & Art Gallery.'],
            ['04:00 PM - 05:00 PM', 'High tea & light Kutchi snacks at dining area.'],
            ['05:00 PM - 07:00 PM', 'Grand Sunset visit at breathtaking White Rann salt desert (transfers by bus/camel cart).'],
            ['07:30 PM - 10:00 PM', 'Scrumptious dinner followed by live Kutchi folk music & cultural performance (09:00 PM - 10:30 PM).'],
        ]],
        ['day_number' => 2, 'title' => 'Morning Yoga, Check-out & Smritivan Earthquake Museum', 'timing' => 'Day 2', 'events' => [
            ['06:00 AM - 07:30 AM', 'Morning tea & rejuvenating yoga session at Tent City grounds.'],
            ['07:30 AM - 09:30 AM', 'Lavish breakfast spread at dining hall.'],
            ['09:30 AM Onwards', 'Check-out from Tent City Dhordo.'],
            ['11:30 AM - 02:00 PM', 'Complimentary sightseeing tour of Smritivan Earthquake Memorial Museum, Bhuj & drop at Bhuj Airport / Railway Station by AC Coach.'],
        ]],
    ],
    '2n' => [
        ['day_number' => 1, 'title' => 'Arrival at Tent City Dhordo & White Rann Sunset Walk', 'timing' => 'Day 1', 'events' => [
            ['08:15 AM - 03:30 PM', 'Fixed AC Shared Coach pickup from Bhuj Railway Station & Airport to Tent City Dhordo.'],
            ['12:30 PM Onwards', 'Check-in at Tent City Dhordo & Lunch at dining area.'],
            ['02:30 PM - 04:30 PM', 'In-house activities at Skyzilla, Craft Haat & Rejuvenation Center.'],
            ['05:00 PM - 07:00 PM', 'Grand Sunset visit at White Rann salt desert.'],
            ['07:30 PM - 10:30 PM', 'Dinner & Kutchi folk cultural evening show.'],
        ]],
        ['day_number' => 2, 'title' => 'White Rann Sunrise, Kala Dungar Excursion & Gandhi Nu Gaam', 'timing' => 'Day 2', 'events' => [
            ['06:00 AM - 07:00 AM', 'Sunrise Point visit at White Rann to witness morning sun over salt flats & Yoga.'],
            ['07:30 AM - 10:00 AM', 'Breakfast at dining hall.'],
            ['12:30 PM - 02:30 PM', 'Lunch at dining hall.'],
            ['03:00 PM - 07:30 PM', 'Complimentary excursion tour to Kala Dungar (Black Hill - highest point of Kutch) & Gandhi Nu Gaam handicraft artisan village.'],
            ['07:30 PM - 10:30 PM', 'Dinner & Kutchi cultural performance.'],
        ]],
        ['day_number' => 3, 'title' => 'Check-out & Smritivan Earthquake Museum Bhuj', 'timing' => 'Day 3', 'events' => [
            ['06:00 AM - 07:30 AM', 'Morning tea & Yoga.'],
            ['07:30 AM - 09:30 AM', 'Breakfast at dining hall.'],
            ['09:30 AM Onwards', 'Check-out from Tent City Dhordo.'],
            ['11:30 AM - 02:00 PM', 'Complimentary sightseeing at Smritivan Earthquake Memorial Museum, Bhuj & drop at Bhuj Airport / Railway Station by AC Coach.'],
        ]],
    ],
    '3n' => [
        ['day_number' => 1, 'title' => 'Arrival at Tent City Dhordo & White Rann Sunset Walk', 'timing' => 'Day 1', 'events' => [
            ['08:15 AM - 03:30 PM', 'Fixed AC Shared Coach pickup from Bhuj Railway Station & Airport.'],
            ['12:30 PM Onwards', 'Check-in at Tent City Dhordo & Lunch.'],
            ['05:00 PM - 07:00 PM', 'Grand Sunset visit at White Rann salt desert.'],
            ['07:30 PM - 10:30 PM', 'Dinner & Kutchi Folk Cultural Show.'],
        ]],
        ['day_number' => 2, 'title' => 'Complimentary Mandvi Beach, Vijay Vilas Palace & Memorial Tour', 'timing' => 'Day 2', 'events' => [
            ['06:00 AM - 08:00 AM', 'Morning tea & Breakfast at dining area.'],
            ['08:00 AM Onwards', 'Complimentary AC Shared Coach tour to Mandvi Beach (140 km from Dhordo).'],
            ['10:30 AM - 12:00 PM', 'Leisure time at Mandvi Private Beach.'],
            ['12:30 PM - 02:00 PM', 'Delicious lunch at private dining area on Mandvi Beach.'],
            ['02:00 PM - 03:00 PM', 'Visit Vijay Vilas Palace (1929 Maharao summer resort).'],
            ['03:15 PM - 04:15 PM', 'Visit Shyamji Krishna Varma Memorial.'],
            ['04:30 PM Onwards', 'Return journey to Tent City Dhordo with tea & light refreshments.'],
            ['07:30 PM - 10:30 PM', 'Dinner & Cultural Performance.'],
        ]],
        ['day_number' => 3, 'title' => 'White Rann Sunrise, Kala Dungar & Gandhi Nu Gaam Craft Village', 'timing' => 'Day 3', 'events' => [
            ['06:00 AM - 07:00 AM', 'White Rann Sunrise Point & Morning Yoga.'],
            ['07:30 AM - 10:00 AM', 'Breakfast at dining area.'],
            ['12:30 PM - 02:30 PM', 'Lunch at dining area.'],
            ['03:00 PM - 07:30 PM', 'Complimentary excursion to Kala Dungar (Black Hill) & Gandhi Nu Gaam handicraft village.'],
            ['07:30 PM - 10:30 PM', 'Dinner & Cultural Night.'],
        ]],
        ['day_number' => 4, 'title' => 'Check-out & Smritivan Earthquake Museum Bhuj', 'timing' => 'Day 4', 'events' => [
            ['06:00 AM - 07:30 AM', 'Morning tea & Yoga.'],
            ['07:30 AM - 09:30 AM', 'Breakfast.'],
            ['09:30 AM Onwards', 'Check-out.'],
            ['11:30 AM - 02:00 PM', 'Complimentary sightseeing at Smritivan Earthquake Memorial Museum, Bhuj & drop at Bhuj Airport / Railway Station by AC Coach.'],
        ]],
    ],
];

foreach ($itineraryByVariant as $vkey => $days) {
    $vid = $variantIds[$vkey];
    $count = $pdo->prepare("SELECT COUNT(*) FROM variant_itinerary_days WHERE variant_id = ?");
    $count->execute([$vid]);
    if ((int)$count->fetchColumn() > 0) {
        echo "  OK: itinerary for variant '$vkey' already seeded, skipping.\n";
        continue;
    }
    $ins = $pdo->prepare("INSERT INTO variant_itinerary_days (variant_id, day_number, timing, title, description, activities, sort_order) VALUES (?,?,?,?,?,?,?)");
    foreach ($days as $day) {
        $activitiesJson = json_encode(array_map(fn($e) => ['time' => $e[0], 'text' => $e[1]], $day['events']));
        $ins->execute([$vid, $day['day_number'], $day['timing'], $day['title'], null, $activitiesJson, $day['day_number']]);
    }
    echo "  DONE: seeded " . count($days) . " day(s) for variant '$vkey'.\n";
}
echo "\n";

echo "All done. Re-run any time — existing rows are updated in place, not duplicated.\n";
