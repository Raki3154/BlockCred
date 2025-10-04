<?php
	require_once 'db.php';
?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>BlockCred - Credentials Verification</title>
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
		<link rel="icon" type="image/jpg" href="images/logo.JPG">
		<link rel="stylesheet" href="./style.css" />
	</head>
	<body>
		<div class="bg-ornaments" aria-hidden="true">
			<span class="blob b1"></span>
			<span class="blob b2"></span>
			<span class="grid"></span>
		</div>
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
		<main class="main">
			<section class="hero">
				<div class="inner">
					<h1>Issue. Verify. Trust.</h1>
					<p class="lede">A clean, fast interface for <b>verifiable academic credentials</b></p>
					<ul class="features">
						<li>
							<span class="badge">Verifiable</span>
							Every credential is secured with cryptographic hash codes, allowing anyone to instantly confirm its authenticity.
						</li>
						<li>
							<span class="badge">Tamper-Evident</span>
							Even the smallest change in a file generates a completely different hash, making unauthorized alterations easy to detect.
						</li>
						<li>
							<span class="badge">Portable</span>
							Credentials can be exported as JSON, shared through secure links, or verified with just the hash for maximum flexibility.
						</li>
					</ul>
				</div>
				<div class="inner" style="margin-top: 40px;">
					<h2>About BlockCred</h2>
					<p>
						<b>BlockCred</b> is a secure and reliable credential management system designed for institutions, students, and employers. 
						It simplifies the process of issuing academic certificates, verifying authenticity and preventing fraud using modern cryptographic 
						techniques. By generating a unique <b>hash code</b> for each uploaded credential, BlockCred ensures that every certificate is 
						tamper-proof and easily verifiable. Students can safely store and share their credentials, while institutions maintain 
						a transparent and trusted record of issued documents. Whether for <b>admissions, recruitment, or professional validation</b>, 
						BlockCred provides a fast, user-friendly, and future-ready solution for digital trust in education.
					</p>
				</div>
			</section>
		</main>
		<div id="toast" class="toast"></div>
		<footer class="site-footer">
			<div class="inner">
				 <p>&copy; <?php echo date('Y'); ?> BlockCred. All rights reserved.</p>
			</div>
		</footer>
	  <script src="./style.js"></script>
	</body>
</html>