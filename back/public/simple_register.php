<?php
// Simple registration endpoint that doesn't rely on Laravel routing

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log the request for debugging
file_put_contents(__DIR__ . '/register_log.txt', date('Y-m-d H:i:s') . ' - Request received\n', FILE_APPEND);

// Add CORS headers for frontend requests
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate input
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// Include Laravel bootstrap to use models
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Use Laravel User model to create user
try {
    // Check if email exists
    $userExists = \App\Models\User::where('email', $data['email'])->exists();
    if ($userExists) {
        http_response_code(422);
        echo json_encode(['error' => 'Email already registered']);
        exit();
    }

    // Create user
    $user = new \App\Models\User();
    $user->name = $data['name'];
    $user->email = $data['email'];
    $user->password = \Illuminate\Support\Facades\Hash::make($data['password']);
    $user->role = 'user';
    $user->save();

    // Create token
    $token = $user->createToken('auth_token')->plainTextToken;

    // Return success
    http_response_code(201);
    echo json_encode([
        'message' => 'User registered successfully',
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role
        ],
        'token' => $token
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed: ' . $e->getMessage()]);
}
