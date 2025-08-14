<?php
require_once 'db.php';
?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Certificate Verification System</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <link href="styles.css" rel="stylesheet">
  <style>
    .loading-overlay {position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.7);z-index:2000}
    .feature-item {text-align:center}
  </style>
</head>
<body>
 <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="https://msec.edu.in">
                <i class="fas fa-graduation-cap me-2"></i>
                NFT Academic Credentials
            </a>
            <div class="navbar-nav ms-auto">
                <span class="navbar-text" id="network-status">
                    <i class="fas fa-circle text-correct"></i> Connected
                </span>
            </div>
        </div>
    </nav>
	<div class="container mt-4">
        <!-- Header Section -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card bg-gradient-primary text-white">
                    <div class="card-body text-center">
                        <h1 class="display-4 mb-3">
                            <i class="fas fa-shield-alt me-3"></i>
                            Blockchain-Verified Academic Credentials
                        </h1>
                        <p class="lead">Prevent certificate forgery with decentralized, tamper-proof digital degrees</p>
                        <div class="row mt-4">
                            <div class="col-md-4">
                                <div class="feature-item">
                                    <i class="fas fa-lock fa-2x mb-2"></i>
                                    <h5>Tamper-Proof</h5>
                                    <p>Immutable blockchain records</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="feature-item">
                                    <i class="fas fa-globe fa-2x mb-2"></i>
                                    <h5>Decentralized</h5>
                                    <p>No single point of failure</p>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="feature-item">
                                    <i class="fas fa-check-circle fa-2x mb-2"></i>
                                    <h5>Verifiable</h5>
                                    <p>Instant global verification</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
<div class="container mt-4">
  <ul class="nav nav-tabs" id="mainTabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button class="nav-link active" id="issue-tab" data-bs-toggle="tab" data-bs-target="#issue" type="button">Issue Credential</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="verify-tab" data-bs-toggle="tab" data-bs-target="#verify" type="button">Verify Credential</button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" id="view-tab" data-bs-toggle="tab" data-bs-target="#view" type="button">View Credentials</button>
    </li>
  </ul>

  <div class="tab-content mt-3">
    <!-- Issue -->
    <div class="tab-pane fade show active" id="issue">
      <div class="card">
        <div class="card-header">Upload New Certificate</div>
        <div class="card-body">
          <form action="upload.php" method="post" enctype="multipart/form-data">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input type="text" name="name" class="form-control" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Certificate File (PDF/JPG/PNG)</label>
              <input type="file" name="certificate" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-success">Upload & Generate HEX</button>
          </form>
        </div>
      </div>
    </div>

    <!-- Verify -->
    <div class="tab-pane fade" id="verify">
      <div class="card">
        <div class="card-body">
          <form id="verifyForm" method="post" action="verify.php">
            <div class="mb-3">
              <label class="form-label">Enter HEX Code</label>
              <input type="text" name="hexcode" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-primary">Verify</button>
          </form>
        </div>
      </div>
    </div>

    <!-- View -->
    <div class="tab-pane fade" id="view">
      <div class="card">
        <div class="card-header">All Uploaded Certificates</div>
        <div class="card-body" id="credentialsList">
          Loading...
        </div>
      </div>
    </div>
  </div>
</div>

<div id="loadingSpinner" class="loading-overlay" style="display:none;">
  <div class="spinner-border" role="status"></div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
function showLoading(show){
  document.getElementById('loadingSpinner').style.display = show ? 'flex' : 'none';
}

async function loadCredentials(){
  showLoading(true);
  try {
    const res = await fetch('view.php');
    const html = await res.text();
    document.getElementById('credentialsList').innerHTML = html;
  } catch(e) {
    document.getElementById('credentialsList').innerText = 'Could not load credentials.';
  }
  showLoading(false);
}

document.getElementById('view-tab').addEventListener('click', loadCredentials);
</script>
</body>
</html>
