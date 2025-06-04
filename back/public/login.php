<?php
// Simple login endpoint that doesn't rely on Laravel routing

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type to JSON
header('Content-Type: application/json');

// CORS headers for cross-domain requests
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Log access to help debug
file_put_contents('login_debug.log', date('Y-m-d H:i:s') . ' - Method: ' . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests for login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST']);
    exit;
}

// Get the raw POST data
$rawData = file_get_contents('php://input');
file_put_contents('login_debug.log', date('Y-m-d H:i:s') . ' - Raw data: ' . $rawData . "\n", FILE_APPEND);

// Parse JSON data
$data = json_decode($rawData, true);

// Validate input
if (!$data || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields', 'received' => $data]);
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
    
    // Find user by email
    $stmt = $db->prepare("SELECT id, name, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }
    
    // Verify password
    if (!password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        exit;
    }
    
    // Create a token
    $token = bin2hex(random_bytes(32));
    
    // Store token in database
    $stmt = $db->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
    $success = $stmt->execute([
        'App\\Models\\User',
        $user['id'],
        'auth_token',
        hash('sha256', $token),
        '["*"]'
    ]);
    
    if ($success) {
        // Return success response
        http_response_code(200);
        
        // Remove password from user data
        unset($user['password']);
        
        echo json_encode([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token
        ]);
    } else {
        throw new Exception("Failed to create token");
    }
} catch (Exception $e) {
    // Log the error
    file_put_contents('login_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode(['error' => 'Login failed: ' . $e->getMessage()]);
}
