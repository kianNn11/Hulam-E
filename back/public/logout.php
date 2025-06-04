<?php
// Simple logout endpoint that doesn't rely on Laravel routing

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// CORS headers for cross-domain requests
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
header('Access-Control-Allow-Credentials: true');

// Log access to help debug
file_put_contents('logout_debug.log', date('Y-m-d H:i:s') . ' - Method: ' . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests for logout
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST']);
    exit;
}

// Get authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Check if we have a token
$token = null;
if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
} else {
    // Even if no token, we'll still respond with success for logout
    // This makes the frontend experience smoother
    http_response_code(200);
    echo json_encode(['message' => 'Successfully logged out']);
    exit;
}

$token = $matches[1];

// Manual PDO database access to bypass Laravel
try {
    // Connect to database
    $db = new PDO(
        'mysql:host=127.0.0.1;dbname=hulame;charset=utf8mb4',
        'root',
        '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Delete token from database
    $hashedToken = hash('sha256', $token);
    $stmt = $db->prepare("DELETE FROM personal_access_tokens WHERE token = ?");
    $success = $stmt->execute([$hashedToken]);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'message' => 'Successfully logged out'
    ]);
} catch (Exception $e) {
    // Log the error
    file_put_contents('logout_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode(['error' => 'Logout failed: ' . $e->getMessage()]);
}
