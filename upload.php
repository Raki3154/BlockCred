<?php
	require 'db.php';
	$error = '';
	$success = '';
	$uploaded_hash = '';
	if ($_SERVER['REQUEST_METHOD'] === 'POST') 
	{
		$name = $conn->real_escape_string($_POST['name'] ?? '');
		$course = $conn->real_escape_string($_POST['course'] ?? '');
		$institution = $conn->real_escape_string($_POST['institution'] ?? '');
		if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) 
		{
			header("Location: upload.php?error=" . urlencode("File upload error."));
			exit();
		} 
		else 
		{
			$f = $_FILES['file'];
			$tmp = $f['tmp_name'];
			$origName = basename($f['name']);
			$mime = $f['type'];
			$size = (int)$f['size'];
			$maxBytes = 10 * 1024 * 1024;
			$ext = strtolower(pathinfo($origName, PATHINFO_EXTENSION));
			$allowed = ['pdf', 'png', 'jpg', 'jpeg'];
			if (!in_array($ext, $allowed)) 
			{
				header("Location: upload.php?error=" . urlencode("Invalid file type."));
				exit();
			} 
			elseif ($size > $maxBytes) 
			{
				header("Location: upload.php?error=" . urlencode("File too large (max 10MB)."));
				exit();
			} 
			else 
			{
				$uploadDir = __DIR__ . '/uploads/';
				if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
				$unique = time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
				$destination = $uploadDir . $unique;
				$dbPath = 'uploads/' . $unique;
				$sha256_hash = hash('sha256', file_get_contents($tmp));
				$uploaded_hash = "0x" . substr(md5($sha256_hash), 0, 8);
				if (!move_uploaded_file($tmp, $destination)) 
				{
					header("Location: upload.php?error=" . urlencode("Failed to move uploaded file."));
					exit();
				} 
				else 
				{
					$stmt = $conn->prepare("INSERT INTO certificates (name, course, institution, file_path, file_name, mime_type, file_size, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
					if (!$stmt) 
					{
						header("Location: upload.php?error=" . urlencode("DB prepare error: " . $conn->error));
						exit();
					} 
					else
					{
						$stmt->bind_param("sssssiss", $name, $course, $institution, $dbPath, $origName, $mime, $size, $uploaded_hash);
						if ($stmt->execute()) 
						{
							header("Location: upload.php?success=true&hash=" . urlencode($uploaded_hash));
							exit();
						} 
						else 
						{
							unlink($destination);
							header("Location: upload.php?error=" . urlencode("DB error: " . $stmt->error));
							exit();
						}
					}
				}
			}
		}
	}
	if (isset($_GET['error'])) 
	{
		$error = $_GET['error'];
	}
	if (isset($_GET['success']) && $_GET['success'] === 'true' && isset($_GET['hash'])) 
	{
		$success = "✅ Uploaded successfully!";
		$uploaded_hash = $_GET['hash'];
	}
?>
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>BlockCred - Upload Credentials</title>
		<link rel="icon" type="image/jpg" href="images/logo.JPG">
		<link rel="stylesheet" href="style.css">
	</head>
	<body>
		<header class="site-header">
			<div class="inner flex">
				<div class="brand flex">
					<img src="images/logo.jpg" alt="BlockCred Logo" class="logo-img">
					<span class="title">BlockCred</span>
				</div>
				<nav class="nav">
					<a href="upload.php" class="nav-btn">Upload</a>
					<a href="verify.php" class="nav-btn">Verify</a>
					<a href="view.php" class="nav-btn">Catalog</a>
				</nav>
			</div>
		</header>
		<div class="inner">
			<h2>Upload Certificate</h2>
			<?php if ($error): ?>
				<div class="result" style="border-color:var(--danger);">
					<?php echo htmlspecialchars($error); ?>
				</div>
				<div class="row" style="margin-top:10px;">
					<a href="upload.php" class="primary">Back to Upload Form</a>
				</div>
			<?php endif; ?>
			<?php if ($success): ?>
				<div class="result" style="border-color:var(--ok);">
					<?php echo $success; ?><br>
						<label><b>Credential Hash:</b></label>
						<input type="text" readonly 
						   value="<?php echo htmlspecialchars($uploaded_hash); ?>" 
						   class="mono" style="width:100%; padding:8px; border-radius:6px; margin-top:6px;"
						   onclick="this.select();document.execCommand('copy');alert('Hash copied to clipboard!');">
				</div>
				<div class="row" style="margin-top:10px;">
					<a href="upload.php" class="primary">Back to Upload Form</a>
				</div>
			<?php endif; ?>
			<?php if (!$success && !$error): ?>
				<form method="post" enctype="multipart/form-data" class="form grid" novalidate>
					<div class="field">
						<label>Student Name</label>
						<input type="text" name="name" placeholder="Your Name" required>
					</div>
					<div class="field">
						<label>Course</label>
						<input type="text" name="course" placeholder="Course Enrolled" required>
					</div>
					<div class="field">
						<label>Institution</label>
						<input type="text" name="institution" placeholder="Institution Name" required>
					</div>
					<div class="field file">
						<label>Certificate File</label>
						<input type="file" name="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg" required>
						<div id="filePreview" class="preview"></div>
					</div>
					<div class="row">
						<button type="submit" class="primary">Upload & Generate Hash</button>
						<a href="index.php" class="ghost">Cancel</a>
					</div>
				</form>
			<?php endif; ?>
		</div>
		<script src="style.js"></script>
	</body>
</html>