<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight CORS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "ghumofiroo_local");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database Connection Failed: " . $conn->connect_error
    ]);
    exit();
}

$slug = isset($_GET['slug']) ? $_GET['slug'] : 'rann-utsav-3d2n';

// Fetch package main data
$stmt = $conn->prepare("SELECT * FROM packages WHERE slug = ?");
$stmt->bind_param("s", $slug);
$stmt->execute();
$packageResult = $stmt->get_result();
$packageData = $packageResult->fetch_assoc();

if (!$packageData) {
    echo json_encode([
        "status" => "error",
        "message" => "Package not found for slug: " . $slug
    ]);
    exit();
}

// Fetch hotels & tents
$stmtHotels = $conn->prepare("SELECT * FROM package_hotels WHERE package_id = ?");
$stmtHotels->bind_param("i", $packageData['id']);
$stmtHotels->execute();
$hotelsResult = $stmtHotels->get_result();
$hotels = [];
while ($row = $hotelsResult->fetch_assoc()) {
    $hotels[] = $row;
}

// Fetch attractions
$stmtAttractions = $conn->prepare("SELECT * FROM package_attractions WHERE package_id = ?");
$stmtAttractions->bind_param("i", $packageData['id']);
$stmtAttractions->execute();
$attractionResult = $stmtAttractions->get_result();
$attractions = [];
while ($row = $attractionResult->fetch_assoc()) {
    $attractions[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => [
        "package" => $packageData,
        "hotels" => $hotels,
        "attractions" => $attractions
    ]
]);
