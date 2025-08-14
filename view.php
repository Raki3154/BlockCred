<?php
require 'db.php';

$stmt = $conn->query("SELECT * FROM certificates ORDER BY uploaded_at ASC");

if ($stmt->num_rows > 0) {
    echo "<table class='table table-bordered'>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Certificate Owner</th>
                    <th>File</th>
                    <th>Uploaded At</th>
                </tr>
            </thead>
            <tbody>";
    while ($row = $stmt->fetch_assoc()) {
        echo "<tr>
                <td>{$row['id']}</td>
                <td>{$row['name']}</td>
                <td><a href='{$row['file_path']}' target='_blank'>View</a></td>
                <td>{$row['uploaded_at']}</td>
              </tr>";
    }
    echo "</tbody></table>";
} else {
    echo "<p>No certificates found.</p>";
}
?>
