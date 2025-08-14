<?php
$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = 'raki3154';
$DB_NAME = 'nft_credentials';

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
// set charset
$conn->set_charset('utf8mb4');
?>