<?php
/**
 * Ghumo Firoo Journeys Enterprise API Root Endpoint
 * Path: php-backend/index.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'ONLINE',
    'service' => 'Ghumo Firoo Journeys Enterprise Backend API',
    'version' => '2.0',
    'endpoints' => [
        'health' => '/php-backend/health.php',
        'users' => '/php-backend/users.php',
        'hotels' => '/php-backend/hotels.php',
        'hotel_rates' => '/php-backend/hotel-rates.php',
        'reports' => '/php-backend/reports.php',
        'upload' => '/php-backend/upload.php'
    ],
    'timestamp' => date('c')
], JSON_PRETTY_PRINT);
