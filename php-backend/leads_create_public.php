<?php
// leads_create_public.php — Canonical Public Lead Endpoint (Backward-Compatible Forwarder)
// Ghumo Firoo Travels Enterprise Architecture

$_GET['action'] = 'public_create';
require_once __DIR__ . '/api/leads/index.php';
