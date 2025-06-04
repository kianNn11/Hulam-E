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
    // Get request body
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data) {
        throw new Exception("Invalid input data");
    }

    // Validate required fields
    if (!isset($data['userId']) || !is_numeric($data['userId'])) {
        throw new Exception("User ID is required");
    }

    if (!isset($data['verificationData']) || !is_array($data['verificationData'])) {
        throw new Exception("Verification data is required");
    }

    // Connect to database
    $db = new PDO(
        'mysql:host=127.0.0.1;dbname=hulame;charset=utf8mb4',
        'root',
        '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Update user's verification status
    // For now, we'll just set a verification_requested flag to true
    // In a real app, you'd store verification documents and process them
    $stmt = $db->prepare("UPDATE users SET verification_requested = 1, updated_at = NOW() WHERE id = ?");
    $result = $stmt->execute([$data['userId']]);
    
    if (!$result) {
        throw new Exception("Failed to submit verification request");
    }
    
    // Store verification data in a verification_requests table if it exists
    try {
        $stmt = $db->prepare("INSERT INTO verification_requests (user_id, data, created_at, updated_at) VALUES (?, ?, NOW(), NOW())");
        $stmt->execute([$data['userId'], json_encode($data['verificationData'])]);
    } catch (Exception $e) {
        // If table doesn't exist, just log it and continue
        file_put_contents('verify_error.log', date('Y-m-d H:i:s') . ' - Could not store verification data: ' . $e->getMessage() . "\n", FILE_APPEND);
    }
    
    // Return success
    http_response_code(200);
    echo json_encode([
        'message' => 'Verification request submitted successfully',
        'status' => 'pending'
    ]);
    
} catch (Exception $e) {
    file_put_contents('verify_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
