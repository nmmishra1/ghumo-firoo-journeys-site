<?php
require 'db.php';
$pdo = getDb();
$r = $pdo->query('SELECT vh.hotel_name, vh.location, vh.stars, vh.highlight, pv.label as variant_label FROM variant_hotels vh JOIN package_variants pv ON vh.variant_id = pv.id JOIN packages p ON pv.package_id = p.id WHERE p.slug = \'kutch-rann-utsav\' ORDER BY pv.sort_order, vh.sort_order');
print_r($r->fetchAll(PDO::FETCH_ASSOC));
