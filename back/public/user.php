<?php
// Simple getCurrentUser endpoint that doesn't rely on Laravel routing

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// CORS headers for cross-domain requests
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
header('Access-Control-Allow-Credentials: true');

// Log access to help debug
file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - Method: ' . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests for user profile
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use GET']);
    exit;
}

// Get authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Debug headers
file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - Headers: ' . json_encode($headers) . "\n", FILE_APPEND);
file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - Auth header: ' . $authHeader . "\n", FILE_APPEND);

// Extract token from Authorization header
$token = null;
if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Authorization token required']);
    exit;
}

// Manual PDO database access to bypass Laravel
try {
    // Connect to database
    $db = new PDO(
        'mysql:host=127.0.0.1;dbname=hulame;charset=utf8mb4',
        'root',
        '',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Find token in the database
    $hashedToken = hash('sha256', $token);
    file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - Token: ' . $token . "\n", FILE_APPEND);
    file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - Hashed token: ' . $hashedToken . "\n", FILE_APPEND);
    
    // List all tokens for debugging
    $allTokensStmt = $db->prepare("SELECT * FROM personal_access_tokens LIMIT 5");
    $allTokensStmt->execute();
    $allTokens = $allTokensStmt->fetchAll(PDO::FETCH_ASSOC);
    file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - All tokens in DB: ' . json_encode($allTokens) . "\n", FILE_APPEND);

    $stmt = $db->prepare("SELECT tokenable_id FROM personal_access_tokens WHERE token = ?");
    $stmt->execute([$hashedToken]);
    $tokenRecord = $stmt->fetch(PDO::FETCH_ASSOC);

    file_put_contents('user_debug.log', date('Y-m-d H:i:s') . ' - Token record: ' . json_encode($tokenRecord) . "\n", FILE_APPEND);
    
    if (!$tokenRecord) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Get user data
    $userId = $tokenRecord['tokenable_id'];
    $stmt = $db->prepare("SELECT id, name, email, role, bio, course_year, birthday, gender, social_link, contact_number, profile_picture, created_at, updated_at FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        exit;
    }
    
    // Return success response with user data
    http_response_code(200);
    echo json_encode([
        'user' => $user
    ]);
} catch (Exception $e) {
    // Log the error
    file_put_contents('user_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode(['error' => 'Failed to retrieve user: ' . $e->getMessage()]);
}
