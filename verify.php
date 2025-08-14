<?php
require 'db.php';
$result_msg = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $hexcode = $_POST['hexcode'];
    $stmt = $conn->prepare("SELECT * FROM certificates WHERE hexcode = ?");
    $stmt->bind_param("s", $hexcode);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        $data = $res->fetch_assoc();
        $result_msg = "✅ Certificate Verified! Issued to: " . $data['name'] . "<br>File: <a href='" . $data['file_path'] . "' target='_blank'>View Certificate</a>";
    } else {
        $result_msg = "❌ Fake Certificate! HEX not found.";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Verify Certificate</title>
	<link href="style.css" rel="stylesheet">
</head>
<body>
<h2>Verify Certificate</h2>
<form method="post">
    HEX Code: <input type="text" name="hexcode" required><br><br>
    <button type="submit">Verify</button>
</form>
<p><?php echo $result_msg; ?></p>
<a href="index.php">🏠 Home</a>
</body>
</html>
