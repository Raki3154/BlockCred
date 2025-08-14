<?php
require 'db.php';
$message = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $file = $_FILES['certificate'];

    if ($file['error'] === 0) {
        $hexcode = bin2hex(random_bytes(8)); // random hex for each cert
        $upload_dir = "uploads/";
        if (!is_dir($upload_dir)) mkdir($upload_dir);
        
        $filename = time() . "_" . basename($file['name']);
        $filepath = $upload_dir . $filename;

        if (move_uploaded_file($file['tmp_name'], $filepath)) {
            $stmt = $conn->prepare("INSERT INTO certificates (name, hexcode, file_path) VALUES (?, ?, ?)");
            $stmt->bind_param("sss", $name, $hexcode, $filepath);
            if ($stmt->execute()) {
                $message = "✅ Certificate uploaded! HEX Code: " . $hexcode;
            } else {
                $message = "❌ Database error: " . $conn->error;
            }
        } else {
            $message = "❌ Failed to upload file.";
        }
    } else {
        $message = "❌ File upload error.";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Upload Certificate</title>
	<link href="style.css" rel="stylesheet">
</head>
<body>
<h2>Upload Certificate</h2>
<form method="post" enctype="multipart/form-data">
    Name: <input type="text" name="name" required><br><br>
    Certificate: <input type="file" name="certificate" required><br><br>
    <button type="submit">Upload</button>
</form>
<p><?php echo $message; ?></p>
<a href="index.php">🏠 Home</a>
        <a href="verify.php">🔍 Verify Certificate</a>
</body>
</html>
