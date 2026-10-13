<?php
// leads_delete.php — Canonical Leads Delete Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture

$_GET['action'] = 'delete';
require_once __DIR__ . '/api/leads/index.php';
