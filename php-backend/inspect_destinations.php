<?php
// inspect_destinations.php — inspects the destinations table structure.
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    die("Error: This script can only be run via CLI.\n");
}
require_once __DIR__ . '/db.php';

try {
    // Read variables manually loaded by loadEnvFile() inside db.php
    $host = getenv('MYSQL_HOST') ?: getenv('DB_HOST') ?: 'localhost';
    $name = getenv('MYSQL_DATABASE') ?: getenv('DB_NAME');
    $user = getenv('MYSQL_USER') ?: getenv('DB_USER');
    $pass = getenv('MYSQL_PASSWORD') ?: getenv('DB_PASS');

    $dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
    
    try {
        $pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    } catch (PDOException $pdoErr) {
        echo "=== DATABASE CONNECTION FAILED ===\n";
        echo "Real Error Message: " . $pdoErr->getMessage() . "\n";
        echo "Error Code: " . $pdoErr->getCode() . "\n";
        echo "Connection parameters tried:\n";
        echo " - Host: " . $host . "\n";
        echo " - Database: " . $name . "\n";
        echo " - User: " . $user . "\n";
        echo "==================================\n";
        exit(1);
    }
    
    // Check if table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'destinations'");
    $exists = $stmt->fetch();
    
    if (!$exists) {
        echo "Table 'destinations' does NOT exist in the database.\n";
        exit;
    }
    
    echo "=== STRUCTURE OF 'destinations' TABLE ===\n";
    $desc = $pdo->query("DESCRIBE destinations");
    while ($row = $desc->fetch(PDO::FETCH_ASSOC)) {
        printf("%-20s %-20s %-10s %-10s %-10s %-10s\n", 
            $row['Field'], 
            $row['Type'], 
            $row['Null'], 
            $row['Key'], 
            $row['Default'] ?? 'NULL', 
            $row['Extra']
        );
    }
    
    echo "\n=== ROW COUNT ===\n";
    $count = $pdo->query("SELECT COUNT(*) as cnt FROM destinations")->fetchColumn();
    echo "Total Rows: $count\n";
    
} catch (Exception $e) {
    echo "General Error: " . $e->getMessage() . "\n";
}
