<?php
// Enable CORS
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST for this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Accept multipart/form-data
    if (!isset($_POST['userId']) || !is_numeric($_POST['userId'])) {
        http_response_code(422);
        echo json_encode(['error' => 'User ID is required']);
        exit;
    }
    $userId = $_POST['userId'];

    if (!isset($_POST['verificationData'])) {
        http_response_code(422);
        echo json_encode(['error' => 'Verification data is required']);
        exit;
    }
    $verificationData = json_decode($_POST['verificationData'], true);
    if (!$verificationData) {
        http_response_code(422);
        echo json_encode(['error' => 'Invalid verification data']);
        exit;
    }

    // File upload handling
    if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(422);
        echo json_encode(['error' => 'Verification document is required']);
        exit;
    }
    $file = $_FILES['document'];
    $allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    $maxSize = 10 * 1024 * 1024; // 10MB
    if (!in_array($file['type'], $allowedTypes)) {
        http_response_code(422);
        echo json_encode(['error' => 'File type not allowed. Allowed: JPG, PNG, PDF, DOC, DOCX']);
        exit;
    }
    if ($file['size'] > $maxSize) {
        http_response_code(422);
        echo json_encode(['error' => 'File size exceeds 10MB limit']);
        exit;
    }
    // Create storage directory if it doesn't exist
    $storageDir = '../storage/app/public/verification_docs';
    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0755, true);
    }
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'verification_' . $userId . '_' . time() . '.' . $extension;
    $fullPath = $storageDir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $fullPath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded file']);
        exit;
    }
    $filePathForDb = 'verification_docs/' . $filename;

    // Connect to database
    $db = new PDO(
        'mysql:host=127.0.0.1;dbname=hulame;charset=utf8mb4',
        'root',
        '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    // Update user's verification status and document path
    $stmt = $db->prepare("UPDATE users SET verification_requested = 1, verification_document = ?, updated_at = NOW() WHERE id = ?");
    $result = $stmt->execute([$filePathForDb, $userId]);
    if (!$result) {
        throw new Exception("Failed to submit verification request");
    }
    // Store verification data in a verification_requests table if it exists
    try {
        $stmt = $db->prepare("INSERT INTO verification_requests (user_id, data, document_path, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
        $stmt->execute([$userId, json_encode($verificationData), $filePathForDb]);
    } catch (Exception $e) {
        // If table doesn't exist, just log it and continue
        file_put_contents('verify_error.log', date('Y-m-d H:i:s') . ' - Could not store verification data: ' . $e->getMessage() . "\n", FILE_APPEND);
    }
    // Return success
    http_response_code(200);
    echo json_encode([
        'message' => 'Verification request submitted successfully',
        'status' => 'pending',
        'document' => $filePathForDb
    ]);
} catch (Exception $e) {
    file_put_contents('verify_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
