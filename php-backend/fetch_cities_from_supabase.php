<?php
require_once __DIR__ . '/db.php';
$supabaseUrl = "https://rfdumlnkmfuacsznogzz.supabase.co";
$supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmZHVtbG5rbWZ1YWNzem5vZ3p6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NzYxMDUsImV4cCI6MjA5NjM1MjEwNX0.5VtSJ46jEgI8tlqXMWOXz8jvc68C__Suo1WgGJw_KIM";

$url = "$supabaseUrl/rest/v1/cities?select=*";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "apikey: $supabaseKey",
    "Authorization: Bearer $supabaseKey"
]);
$response = curl_exec($ch);
curl_close($ch);

$cities = json_decode($response, true);
print_r(array_slice($cities, 0, 10));
echo "Total cities in Supabase: " . count($cities) . "\n";
