<?php
// quote_view.php — Canonical Public Quote View Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture

$_GET['action'] = 'view';
require_once __DIR__ . '/api/quotes/index.php';
