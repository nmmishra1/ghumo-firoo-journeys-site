<?php
// quote_action.php — Canonical Quote Action Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture

$_GET['action'] = 'action';
require_once __DIR__ . '/api/quotes/index.php';
