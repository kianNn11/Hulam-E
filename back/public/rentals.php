<?php
// Simple rentals endpoint that doesn't rely on Laravel routing

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
file_put_contents('rentals_debug.log', date('Y-m-d H:i:s') . ' - Method: ' . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests for rentals
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use GET']);
    exit;
}

// Get user_id from query parameter
$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;

// Get authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Check if we have a token
if (!$authHeader || !preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
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
    
    // Find token in the database
    $hashedToken = hash('sha256', $token);
    $stmt = $db->prepare("SELECT tokenable_id FROM personal_access_tokens WHERE token = ?");
    $stmt->execute([$hashedToken]);
    $tokenRecord = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$tokenRecord) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
    
    // Check if rentals table exists (it might not in a new installation)
    $stmt = $db->prepare("SHOW TABLES LIKE 'rentals'");
    $stmt->execute();
    $rentalTableExists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$rentalTableExists) {
        // Return empty rentals array if table doesn't exist yet
        http_response_code(200);
        echo json_encode([
            'data' => [],
            'message' => 'No rentals found (table does not exist)'
        ]);
        exit;
    }
    
    // Get rentals data based on user_id if provided
    if ($userId) {
        $stmt = $db->prepare("SELECT * FROM rentals WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
    } else {
        // Get all rentals if no user_id is provided
        $stmt = $db->prepare("SELECT * FROM rentals ORDER BY created_at DESC");
        $stmt->execute();
    }
    
    $rentals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Return success response with rentals data
    http_response_code(200);
    echo json_encode([
        'data' => $rentals
    ]);
} catch (Exception $e) {
    // Log the error
    file_put_contents('rentals_error.log', date('Y-m-d H:i:s') . ' - Error: ' . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode(['error' => 'Failed to retrieve rentals: ' . $e->getMessage()]);
}
