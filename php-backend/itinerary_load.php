<?php
// itinerary_load.php — Canonical Itinerary Load Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture
$_GET['action'] = 'load';
require_once __DIR__ . '/api/itineraries/index.php';
