<?php
	require 'db.php';
	$rows = [];
	$res = $conn->query("SELECT id,name,course,institution,file_path,file_name,file_hash,uploaded_at FROM certificates ORDER BY uploaded_at DESC");
	if ($res) while($r = $res->fetch_assoc()) $rows[] = $r;
?>
<!doctype html>
<html>
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width,initial-scale=1">
		<title>BlockCred - View Credentials</title>
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
			<h2>All Certificates</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr><th>S.No</th><th>Name</th><th>Course</th><th>Institution</th><th>File</th><th>Uploaded</th></tr>
					</thead>
					<tbody>
						<?php foreach($rows as $i => $r): ?>
							<tr>
								<td><?php echo $i+1; ?></td>
								<td><?php echo htmlspecialchars($r['name']); ?></td>
								<td><?php echo htmlspecialchars($r['course']); ?></td>
								<td><?php echo htmlspecialchars($r['institution']); ?></td>
								<td><a href="<?php echo htmlspecialchars($r['file_path']); ?>" target="_blank">View</a></td>
								<td><?php echo htmlspecialchars($r['uploaded_at']); ?></td>
							</tr>
						<?php endforeach; ?>
					</tbody>
				</table>
			</div>
			<div class="row"><a href="index.php" class="ghost">Home</a></div>
		</div>
	</body>
</html>