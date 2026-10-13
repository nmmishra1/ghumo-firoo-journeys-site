<?php
// leads_update.php — Canonical Leads Update Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture

$_GET['action'] = 'update';
require_once __DIR__ . '/api/leads/index.php';
