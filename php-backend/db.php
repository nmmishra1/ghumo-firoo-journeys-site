<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
// db.php — single shared PDO connection.

function loadEnvFile()
{
    static $loaded = false;
    if ($loaded) return;

    $paths = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env',
        dirname(__DIR__) . '/.env',
        dirname(__DIR__) . '/php-backend/.env',
        $_SERVER['DOCUMENT_ROOT'] . '/php-backend/.env',
        $_SERVER['DOCUMENT_ROOT'] . '/.env'
    ];

    foreach ($paths as $envPath) {
        if ($envPath && file_exists($envPath)) {
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if ($lines !== false) {
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if ($trimmed === '' || strpos($trimmed, '#') === 0) {
                        continue;
                    }
                    $parts = explode('=', $line, 2);
                    if (count($parts) === 2) {
                        $name = trim($parts[0]);
                        $value = trim($parts[1]);
                        $value = preg_replace('/^["\'](.*)["\']$/', '$1', $value);
                        @putenv("$name=$value");
                        $_ENV[$name] = $value;
                        $_SERVER[$name] = $value;
                    }
                }
            }
            break;
        }
    }

    // Check if php-backend/db_config.php or db_config.php exists as an alternative for cPanel
    $phpConfigPaths = [
        __DIR__ . '/db_config.php',
        dirname(__DIR__) . '/db_config.php',
        $_SERVER['DOCUMENT_ROOT'] . '/php-backend/db_config.php',
        $_SERVER['DOCUMENT_ROOT'] . '/db_config.php'
    ];
    foreach ($phpConfigPaths as $cfgPath) {
        if ($cfgPath && file_exists($cfgPath)) {
            $config = @include $cfgPath;
            if (is_array($config)) {
                foreach ($config as $k => $v) {
                    @putenv("$k=$v");
                    $_ENV[$k] = $v;
                    $_SERVER[$k] = $v;
                }
            }
            break;
        }
    }

    $loaded = true;
}

function getDb(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        loadEnvFile();

        $host = getenv('MYSQL_HOST') ?: ($_ENV['MYSQL_HOST'] ?? ($_SERVER['MYSQL_HOST'] ?? (getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? '127.0.0.1'))));
        $name = getenv('MYSQL_DATABASE') ?: ($_ENV['MYSQL_DATABASE'] ?? ($_SERVER['MYSQL_DATABASE'] ?? (getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? ''))));
        $user = getenv('MYSQL_USER') ?: ($_ENV['MYSQL_USER'] ?? ($_SERVER['MYSQL_USER'] ?? (getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? ''))));
        $pass = getenv('MYSQL_PASSWORD') ?: ($_ENV['MYSQL_PASSWORD'] ?? ($_SERVER['MYSQL_PASSWORD'] ?? (getenv('DB_PASS') ?: ($_ENV['DB_PASS'] ?? ''))));

        if (!$name || !$user) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode([
                'status' => 'ERROR',
                'error' => 'Database configuration missing in environment.'
            ]);
            exit;
        }

        // Try 127.0.0.1 first, fall back to localhost
        try {
            $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
        } catch (PDOException $e) {
            try {
                $dsn = "mysql:host=localhost;dbname={$name};charset=utf8mb4";
                $pdo = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);
            } catch (PDOException $e2) {
                header('Content-Type: application/json; charset=utf-8');
                echo json_encode([
                    'status' => 'ERROR',
                    'error' => 'Database connection failed: ' . $e2->getMessage()
                ]);
                exit;
            }
        }

        // Auto-migrate restrictive ENUM status columns to VARCHAR(100)
        static $migrated = false;
        if (!$migrated && $pdo) {
            try {
                $colItin = $pdo->query("SHOW COLUMNS FROM itineraries LIKE 'status'")->fetch(PDO::FETCH_ASSOC);
                if ($colItin && strpos(strtolower($colItin['Type'] ?? ''), 'enum') !== false) {
                    $pdo->exec("ALTER TABLE itineraries MODIFY COLUMN status VARCHAR(100) NOT NULL DEFAULT 'Draft'");
                }
            } catch (Exception $eItin) {}

            try {
                $colLead = $pdo->query("SHOW COLUMNS FROM leads LIKE 'status'")->fetch(PDO::FETCH_ASSOC);
                if ($colLead && strpos(strtolower($colLead['Type'] ?? ''), 'enum') !== false) {
                    $pdo->exec("ALTER TABLE leads MODIFY COLUMN status VARCHAR(100) NOT NULL DEFAULT 'New'");
                }
            } catch (Exception $eLead) {}

            // Auto-seed WelcomHeritage Bal Samand Lake Palace if missing
            try {
                $checkH = $pdo->query("SELECT id FROM hotels WHERE LOWER(hotel_name) LIKE '%bal samand%' OR LOWER(name) LIKE '%bal samand%' LIMIT 1");
                $existsH = $checkH ? $checkH->fetchColumn() : null;
                if (!$existsH) {
                    $jodhpurId = 61;
                    $cStmt = $pdo->query("SELECT id FROM cities WHERE LOWER(name) LIKE '%jodhpur%' OR LOWER(city_name) LIKE '%jodhpur%' LIMIT 1");
                    if ($cR = $cStmt->fetch(PDO::FETCH_ASSOC)) {
                        $jodhpurId = (int)$cR['id'];
                    }

                    $hCols = [];
                    $qCols = $pdo->query("SHOW COLUMNS FROM hotels");
                    while ($r = $qCols->fetch(PDO::FETCH_ASSOC)) {
                        $hCols[] = strtolower($r['Field']);
                    }

                    $hotelId = 'hotel-6abb986e4e0866.11840170';
                    $hotelName = 'WelcomHeritage Bal Samand Lake Palace';
                    $addr = 'BSF STC, Mandore Rd, Mandore, Jodhpur, Rajasthan 342026';

                    $fields = ['id'];
                    $vals = [$hotelId];
                    $placeholders = ['?'];

                    if (in_array('hotel_name', $hCols)) { $fields[] = 'hotel_name'; $vals[] = $hotelName; $placeholders[] = '?'; }
                    elseif (in_array('name', $hCols)) { $fields[] = 'name'; $vals[] = $hotelName; $placeholders[] = '?'; }

                    if (in_array('city_id', $hCols)) { $fields[] = 'city_id'; $vals[] = $jodhpurId; $placeholders[] = '?'; }
                    if (in_array('city', $hCols)) { $fields[] = 'city'; $vals[] = 'Jodhpur'; $placeholders[] = '?'; }
                    elseif (in_array('city_name', $hCols)) { $fields[] = 'city_name'; $vals[] = 'Jodhpur'; $placeholders[] = '?'; }

                    if (in_array('state', $hCols)) { $fields[] = 'state'; $vals[] = 'Rajasthan'; $placeholders[] = '?'; }
                    elseif (in_array('state_name', $hCols)) { $fields[] = 'state_name'; $vals[] = 'Rajasthan'; $placeholders[] = '?'; }

                    if (in_array('country', $hCols)) { $fields[] = 'country'; $vals[] = 'India'; $placeholders[] = '?'; }
                    if (in_array('star_rating', $hCols)) { $fields[] = 'star_rating'; $vals[] = 4; $placeholders[] = '?'; }
                    elseif (in_array('star_category', $hCols)) { $fields[] = 'star_category'; $vals[] = 4; $placeholders[] = '?'; }

                    if (in_array('address', $hCols)) { $fields[] = 'address'; $vals[] = $addr; $placeholders[] = '?'; }
                    if (in_array('active_status', $hCols)) { $fields[] = 'active_status'; $vals[] = 1; $placeholders[] = '?'; }
                    if (in_array('active', $hCols)) { $fields[] = 'active'; $vals[] = 1; $placeholders[] = '?'; }
                    if (in_array('is_active', $hCols)) { $fields[] = 'is_active'; $vals[] = 1; $placeholders[] = '?'; }

                    $pdo->prepare("INSERT INTO hotels (" . implode(', ', $fields) . ") VALUES (" . implode(', ', $placeholders) . ")")->execute($vals);

                    try {
                        $pdo->prepare("INSERT IGNORE INTO hotel_contracts (id, hotel_id, contract_name, season, valid_from, valid_to, status, active_status) VALUES ('contract-bal-samand-2026', ?, 'Official Ratecard 2026-2027', 'Normal Season', '2026-01-01', '2027-12-31', 'active', 1)")->execute([$hotelId]);
                    } catch (Exception $eC) {}

                    try {
                        $rates = [
                            ['Premium', 'MAP', 6050.00],
                            ['Premium', 'CP', 5500.00],
                            ['Garden Room', 'CP', 5500.00],
                            ['Garden Room', 'MAP', 6050.00],
                            ['Regal Suite', 'CP', 8500.00],
                            ['Regal Suite', 'MAP', 9500.00]
                        ];
                        foreach ($rates as $r) {
                            $pdo->prepare("INSERT INTO hotel_rates (hotel_id, room_type, meal_plan, season_start, season_end, rate_per_night, is_active) VALUES (?, ?, ?, '2026-01-01', '2027-12-31', ?, 1)")->execute([$hotelId, $r[0], $r[1], $r[2]]);
                        }
                    } catch (Exception $eR) {}
                }
            } catch (Exception $eH) {}

            $migrated = true;
        }
    }

    return $pdo;
}

loadEnvFile();
