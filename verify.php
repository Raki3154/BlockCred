<?php
	require 'db.php';
	$error = '';
	$success = '';
	$certificate = null;
	if ($_SERVER['REQUEST_METHOD'] === 'POST') 
	{
		$input_hash = trim($_POST['hash'] ?? '');
		if (empty($input_hash)) 
		{
			header("Location: verify.php?error=" . urlencode("Please enter a credential hash."));
			exit();
		} 
		else 
		{
			$stmt = $conn->prepare("SELECT * FROM certificates WHERE file_hash = ?");
			$stmt->bind_param("s", $input_hash);
			$stmt->execute();
			$result = $stmt->get_result();
			if ($result->num_rows > 0) 
			{
				header("Location: verify.php?success=true&hash=" . urlencode($input_hash));
				exit();
			} 
			else 
			{
				header("Location: verify.php?error=" . urlencode("No match found for hash $input_hash"));
				exit();
			}
		}
	}
	if (isset($_GET['error'])) 
	{
		$error = $_GET['error'];
	}	
	if (isset($_GET['success']) && $_GET['success'] === 'true' && isset($_GET['hash'])) 
	{
		$success = "✅ Match found for credential hash <b>" . htmlspecialchars($_GET['hash']) . "</b>.";
		$stmt = $conn->prepare("SELECT * FROM certificates WHERE file_hash = ?");
		$stmt->bind_param("s", $_GET['hash']);
		$stmt->execute();
		$result = $stmt->get_result();
		if ($result->num_rows > 0) 
		{
			$certificate = $result->fetch_assoc();
		}
	}
?>
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>BlockCred - Verify Credentials</title>
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
			<h2>Verify Credential</h2>
			<?php if ($error): ?>
				<div class="result" style="border-color:var(--danger);">
					<?php echo $error; ?>
				</div>
				<div class="row" style="margin-top:10px;">
					<a href="verify.php" class="primary">Back to Verify Form</a>
				</div>
			<?php endif; ?>
			<?php if ($success): ?>
				<div class="result" style="border-color:var(--ok);">
					<?php echo $success; ?>
				</div>
				<?php if ($certificate): ?>
					<div class="table-wrap" style="margin-top:15px;">
						<table>
							<tr><th>Student Name</th><td><?php echo htmlspecialchars($certificate['name']); ?></td></tr>
							<tr><th>Course</th><td><?php echo htmlspecialchars($certificate['course']); ?></td></tr>
							<tr><th>Institution</th><td><?php echo htmlspecialchars($certificate['institution']); ?></td></tr>
							<tr><th>File Name</th><td><?php echo htmlspecialchars($certificate['file_name']); ?></td></tr>
							<tr><th>Download</th><td><a class="primary" href="<?php echo htmlspecialchars($certificate['file_path']); ?>" target="_blank">View File</a></td></tr>
						</table>
					</div>
				<?php endif; ?>
				<div class="row" style="margin-top:10px;">
					<a href="verify.php" class="primary">Back to Verify Form</a>
				</div>
			<?php endif; ?>
			<?php if (!$success && !$error): ?>
				<form method="post" class="form grid" novalidate style="margin-top:20px;">
					<div class="field">
						<label>Enter Credential Hash</label>
						<input type="text" name="hash" placeholder="e.g. 0x1a2b3c4d" required>
					</div>
					<div class="row">
						<button type="submit" class="primary">Verify</button>
						<a href="index.php" class="ghost">Cancel</a>
					</div>
				</form>
			<?php endif; ?>
		</div>
		<script src="style.js"></script>
	</body>
</html>