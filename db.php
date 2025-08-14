<?php
$DB_HOST = "localhost";
$DB_USER = "root"; // default for XAMPP
$DB_PASS = "raki3154"; // default empty for XAMPP
$DB_NAME = "certificate_verification";

$conn = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
