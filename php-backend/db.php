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
    }

    return $pdo;
}

loadEnvFile();
