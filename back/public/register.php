<?php
// Very simple standalone registration script

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
file_put_contents('register_debug.log', date('Y-m-d H:i:s') . ' - Method: ' . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests for registration
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST']);
    exit;
}

// Get the raw POST data
$rawData = file_get_contents('php://input');
file_put_contents('register_debug.log', date('Y-m-d H:i:s') . ' - Raw data: ' . $rawData . "\n", FILE_APPEND);

// Parse JSON data
$data = json_decode($rawData, true);

// Validate input
if (!$data || !isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
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
    
    // Check if email exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    if ($stmt->fetchColumn()) {
        http_response_code(422);
        echo json_encode([
            'message' => 'The email has already been taken.',
            'errors' => [
                'email' => ['The email has already been taken.']
            ]
        ]);
        exit;
    }
    
    // Hash password
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    // Insert user
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, 'user', NOW(), NOW())");
    $success = $stmt->execute([
        $data['name'],
        $data['email'],
        $hashedPassword
    ]);
    
    if ($success) {
        $userId = $db->lastInsertId();
        
        // Create a token and store it in the personal_access_tokens table
        $token = bin2hex(random_bytes(32));
        
        // Store token in database
        $stmt = $db->prepare("INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([
            'App\\Models\\User',
            $userId,
            'auth_token',
            hash('sha256', $token),
            '["*"]'
        ]);
        
        // Return success response
        http_response_code(201);
        echo json_encode([
            'message' => 'User registered successfully',
            'user' => [
                'id' => $userId,
                'name' => $data['name'],
                'email' => $data['email'],
                'role' => 'user'
            ],
            'token' => $token
        ]);
    } else {
        throw new Exception("Failed to insert user");
    }
} catch (Exception $e) {
    // Log the error
    file_put_contents('register_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
}
