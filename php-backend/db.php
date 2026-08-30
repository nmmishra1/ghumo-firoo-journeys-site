<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
// db.php — single shared PDO connection.

function loadEnvFile()
{
    $paths = [
        __DIR__ . '/.env',
        __DIR__ . '/../.env',
        __DIR__ . '/../../.env'
    ];

    foreach ($paths as $envPath) {
        if (file_exists($envPath)) {
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
                        putenv("$name=$value");
                        $_ENV[$name] = $value;
                        $_SERVER[$name] = $value;
                    }
                }
                break;
            }
        }
    }
}

function getDb(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        loadEnvFile();

        $host = getenv('MYSQL_HOST') ?: getenv('DB_HOST') ?: '127.0.0.1';
        $name = getenv('MYSQL_DATABASE') ?: getenv('DB_NAME') ?: 'a17511nd_Ghumofiroo';
        $user = getenv('MYSQL_USER') ?: getenv('DB_USER') ?: 'a17511nd_Ghumofiroo_live';
        $pass = getenv('MYSQL_PASSWORD') ?: getenv('DB_PASS') ?: 'ltYU_UpEb)bG';

        if (!$name || !$user) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode([
                'status' => 'ERROR',
                'error' => 'Database configuration missing in .env.'
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
