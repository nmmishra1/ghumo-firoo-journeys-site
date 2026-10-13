<?php
// quote_share.php — Canonical Quote Share Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture

$_GET['action'] = 'share';
require_once __DIR__ . '/api/quotes/index.php';
