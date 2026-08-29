<?php
/**
 * Seeds editable, market-reference package copy/prices for the public catalogue.
 *
 * This is deliberately CLI-only. It never runs through the website and it
 * refuses production. Run only after reviewing the prices and inclusions:
 *   php php-backend/seed_market_reference_packages.php --environment=local --confirm-market-reference
 *   php php-backend/seed_market_reference_packages.php --environment=staging --confirm-market-reference
 *
 * Prices are indicative public-market “from” prices captured on 2026-07-14.
 * They are not supplier rates, do not include every tax/flight, and must be
 * replaced in CRM Package Master once contracted rates are available.
 */
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit("Forbidden: CLI only.\n");
}

$args = implode(' ', array_slice($argv, 1));
$target = str_contains($args, '--environment=local') ? 'local' : (str_contains($args, '--environment=staging') ? 'staging' : null);
if ($target === null || !str_contains($args, '--confirm-market-reference')) {
    exit("Refusing to write. Use --environment=local|staging --confirm-market-reference after review.\n");
}

require_once __DIR__ . '/db.php';

$pdo = getDb();
$database = (string) $pdo->query('SELECT DATABASE()')->fetchColumn();
$expectedDatabase = $target === 'local' ? 'ghumofiroo_local' : 'a17511nd_GFStaging';
if ($database !== $expectedDatabase) {
    exit("ABORT: connected to '{$database}', not approved {$target} database '{$expectedDatabase}'.\n");
}

$marketNote = 'Indicative market-reference starting price as of 14 July 2026; subject to supplier availability, departure date, room/tent category, airfare and applicable taxes. Final price is confirmed by Ghumo Firoo before payment.';

// The product line is intentionally small and sellable. Do not create dozens of
// thin pages; add a package only when CRM has a real itinerary and rate to support it.
$packages = [
    ['rann-utsav-quick-escape', 'Rann Utsav Quick Escape — 2 Days / 1 Night', 5900, '2 Days / 1 Night', 'domestic', ['Dhordo', 'White Rann', 'Bhuj'], ['Tent City stay', 'White Rann sunset visit', 'Cultural evening'], 'November to March', 'Budget-friendly short festival escape.'],
    ['rann-utsav-classic-3d', 'Rann Utsav Classic — 3 Days / 2 Nights', 16500, '3 Days / 2 Nights', 'domestic', ['Dhordo', 'White Rann', 'Kala Dungar', 'Bhuj'], ['Deluxe AC tent option', 'White Rann', 'Kala Dungar', 'Cultural evening'], 'November to March', 'Best first Rann Utsav experience with two nights in the desert.'],
    ['rann-utsav-premium-3d', 'Rann Utsav Premium Tent City — 3 Days / 2 Nights', 23500, '3 Days / 2 Nights', 'domestic', ['Dhordo', 'White Rann', 'Kala Dungar'], ['Premium tent option', 'Full-moon departures on request', 'Meals and transfers as per final plan'], 'November to March', 'Premium Tent City experience for couples and families.'],
    ['rann-utsav-kutch-heritage-4d', 'Rann Utsav & Kutch Heritage — 4 Days / 3 Nights', 22500, '4 Days / 3 Nights', 'domestic', ['Dhordo', 'White Rann', 'Kala Dungar', 'Mandvi', 'Bhuj'], ['Tent City stay', 'Mandvi extension', 'Kutch craft experience'], 'November to March', 'A longer Kutch journey combining White Rann, crafts and Mandvi.'],
    ['char-dham-road-dehradun-12d', 'Char Dham Yatra by Road — Dehradun to Dehradun', 34999, '12 Days / 11 Nights', 'domestic', ['Dehradun', 'Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'], ['Four Dhams by road', 'Hotel stays', 'Vegetarian meals as selected', 'Registration guidance'], 'April to November', 'A paced Char Dham road pilgrimage for families and groups.'],
    ['char-dham-senior-comfort-10d', 'Char Dham Senior Comfort Yatra — Dehradun to Dehradun', 54999, '10 Days / 9 Nights', 'domestic', ['Dehradun', 'Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'], ['Comfort-focused pacing', 'Private vehicle options', 'Senior travel assistance'], 'April to November', 'A comfort-led pilgrimage plan with practical buffers and private options.'],
    ['char-dham-helicopter-dehradun-6d', 'Char Dham by Helicopter — Dehradun to Dehradun', 225000, '6 Days / 5 Nights', 'domestic', ['Dehradun', 'Yamunotri', 'Gangotri', 'Kedarnath', 'Badrinath'], ['Helicopter sectors', 'Five-night circuit', 'Ground transfers', 'Meals and stays as selected'], 'April to November', 'Premium Char Dham helicopter circuit; weather and operator confirmation apply.'],
    ['kedarnath-badrinath-do-dham', 'Kedarnath & Badrinath Do Dham Yatra', 22000, '6 Days / 5 Nights', 'domestic', ['Haridwar', 'Guptkashi', 'Kedarnath', 'Badrinath'], ['Two sacred Dhams', 'Road itinerary', 'Custom helicopter assistance on request'], 'April to November', 'The most requested Do Dham pairing for pilgrims with limited time.'],
    ['gangotri-yamunotri-do-dham', 'Gangotri & Yamunotri Do Dham Yatra', 18500, '5 Days / 4 Nights', 'domestic', ['Haridwar', 'Barkot', 'Yamunotri', 'Gangotri'], ['Two sacred Dhams', 'Road itinerary', 'Registration guidance'], 'April to November', 'A focused Himalayan pilgrimage covering the source temples.'],
    ['singapore-city-sentosa-5d', 'Singapore City & Sentosa Family Holiday', 59999, '5 Days / 4 Nights', 'international', ['Singapore'], ['Singapore city tour', 'Gardens by the Bay', 'Sentosa option', 'Family-friendly planning'], 'December to June', 'A first Singapore holiday designed for families.'],
    ['singapore-malaysia-value-7d', 'Singapore & Malaysia Value Holiday', 57500, '7 Days / 6 Nights', 'international', ['Singapore', 'Kuala Lumpur', 'Genting Highlands'], ['Singapore city highlights', 'Kuala Lumpur', 'Batu Caves', 'Genting option'], 'Year-round', 'Value twin-country holiday; final airfare and visa cost are confirmed at quotation.'],
    ['singapore-malaysia-family-7d', 'Singapore, Kuala Lumpur & Genting Family Holiday', 78900, '7 Days / 6 Nights', 'international', ['Singapore', 'Kuala Lumpur', 'Genting Highlands'], ['Gardens by the Bay', 'Sentosa/Universal Studios option', 'Kuala Lumpur city tour', 'Genting cable car option'], 'December to June', 'Flagship Singapore–Malaysia family package with time for both countries.'],
    ['switzerland-paris-8d', 'Switzerland & Paris Explorer', 185000, '8 Days / 7 Nights', 'international', ['Paris', 'Lucerne', 'Interlaken', 'Zurich'], ['Paris city experience', 'Swiss Alps', 'Scenic rail options', 'Visa assistance'], 'April to October', 'The most sellable first Europe holiday: Paris plus the Swiss Alps.'],
    ['switzerland-italy-9d', 'Switzerland & Italy Grand Journey', 215000, '9 Days / 8 Nights', 'international', ['Zurich', 'Lucerne', 'Interlaken', 'Venice', 'Florence', 'Rome'], ['Swiss mountain experience', 'Venice', 'Florence', 'Rome'], 'April to October', 'A strong Alps-to-Italy combination for couples and families.'],
    ['france-switzerland-10d', 'France & Switzerland Scenic Holiday', 225000, '10 Days / 9 Nights', 'international', ['Paris', 'Swiss Alps', 'Zurich'], ['Paris', 'Seine cruise option', 'Swiss scenic towns', 'Visa assistance'], 'April to October', 'A relaxed France and Switzerland package with premium pacing.'],
    ['switzerland-italy-france-11d', 'Switzerland, Italy & France Grand Trio', 265000, '11 Days / 10 Nights', 'international', ['Paris', 'Zurich', 'Interlaken', 'Venice', 'Florence', 'Rome'], ['Three countries', 'Swiss Alps', 'Italian classics', 'Paris finale'], 'April to October', 'The ideal multi-country first Europe tour.'],
    ['europe-highlights-12d', 'Europe Highlights — 12 Days', 300000, '12 Days / 11 Nights', 'international', ['France', 'Belgium', 'Netherlands', 'Germany', 'Switzerland', 'Italy'], ['Six-country route', 'Guided sightseeing', 'Swiss Alps', 'Visa assistance'], 'April to October', 'Best-selling multi-country Europe route for groups and families.'],
    ['grand-europe-16d', 'Grand Europe — 16 Days', 375000, '16 Days / 15 Nights', 'international', ['France', 'Belgium', 'Netherlands', 'Germany', 'Austria', 'Switzerland', 'Italy'], ['Seven countries', 'Unhurried route', 'Premium upgrades on request'], 'April to October', 'Flagship Europe itinerary for travellers who want the full circuit.'],
];

$sql = 'INSERT INTO packages (id, name, price, slug, duration, image, images, category, rating, reviews, destinations, highlights, inclusions, exclusions, itinerary, faqs, seo_title, seo_description, seo_keywords, best_time, group_size, difficulty, quick_facts, package_type, is_active) VALUES (:id, :name, :price, :slug, :duration, :image, :images, :category, 5.00, 0, :destinations, :highlights, :inclusions, :exclusions, :itinerary, :faqs, :seo_title, :seo_description, :seo_keywords, :best_time, :group_size, :difficulty, :quick_facts, :package_type, 1) ON DUPLICATE KEY UPDATE name = VALUES(name), price = VALUES(price), duration = VALUES(duration), image = VALUES(image), images = VALUES(images), category = VALUES(category), destinations = VALUES(destinations), highlights = VALUES(highlights), inclusions = VALUES(inclusions), exclusions = VALUES(exclusions), itinerary = VALUES(itinerary), faqs = VALUES(faqs), seo_title = VALUES(seo_title), seo_description = VALUES(seo_description), seo_keywords = VALUES(seo_keywords), best_time = VALUES(best_time), group_size = VALUES(group_size), difficulty = VALUES(difficulty), quick_facts = VALUES(quick_facts), package_type = VALUES(package_type), is_active = 1';
$statement = $pdo->prepare($sql);

foreach ($packages as [$slug, $name, $price, $duration, $type, $destinations, $highlights, $bestTime, $summary]) {
    $days = (int) explode(' ', $duration)[0];
    $itinerary = [];
    for ($day = 1; $day <= $days; $day++) {
        $itinerary[] = ['day' => $day, 'title' => $day === 1 ? 'Arrival and welcome' : ($day === $days ? 'Departure' : 'Curated sightseeing and stay'), 'description' => 'Final day-wise route and inclusions are confirmed in your Ghumo Firoo proposal.'];
    }
    $statement->execute([
        'id' => 'market-' . substr(hash('sha256', $slug), 0, 29),
        'name' => $name,
        'price' => $price,
        'slug' => $slug,
        'duration' => $duration,
        'image' => $type === 'domestic' && str_contains($slug, 'rann') ? '/Rann-Utsav-Gujarat.png' : ($type === 'domestic' ? '/Kedarnath.png' : 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1600'),
        'images' => json_encode([]),
        'category' => json_encode([$type, 'market-reference']),
        'destinations' => json_encode($destinations),
        'highlights' => json_encode($highlights),
        'inclusions' => json_encode(['Accommodation and sightseeing exactly as selected in the final proposal', 'Transfers where stated in the final proposal', $marketNote]),
        'exclusions' => json_encode(['Airfare, visa, government fees and taxes unless explicitly listed in the final proposal', 'Personal expenses and optional activities', 'Anything not shown in final inclusions']),
        'itinerary' => json_encode($itinerary),
        'faqs' => json_encode([['question' => 'Is this the final package price?', 'answer' => $marketNote], ['question' => 'Can this itinerary be customised?', 'answer' => 'Yes. Ghumo Firoo can adjust dates, hotel category, transport and sightseeing in the final proposal.']]),
        'seo_title' => $name . ' | Ghumo Firoo Travels',
        'seo_description' => $summary . ' Starting from ₹' . number_format($price, 0, '.', ',') . '; subject to availability and final quote.',
        'seo_keywords' => strtolower($name . ', tour package, Ghumo Firoo Travels'),
        'best_time' => $bestTime,
        'group_size' => 'Couples, families and private groups',
        'difficulty' => 'Easy to Moderate',
        'quick_facts' => json_encode(['bestTime' => $bestTime, 'groupSize' => 'Couples, families and private groups', 'difficulty' => 'Easy to Moderate', 'priceNote' => 'Market-reference starting price; final quote applies.']),
        'package_type' => $type,
    ]);
}

echo 'Seeded/updated ' . count($packages) . " editable market-reference packages in staging.\n";
