<?php

// Include the Laravel application
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Add CORS headers
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

// Only accept POST requests for login
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (!isset($data['email']) || !isset($data['password'])) {
    header('HTTP/1.1 422 Unprocessable Entity');
    echo json_encode(['message' => 'Missing required fields']);
    exit();
}

// Process login using Laravel Auth
try {
    $response = $kernel->handle(
        $request = Illuminate\Http\Request::capture()
    )->send();

    // Get Auth and User model classes
    $authClass = 'Illuminate\\Support\\Facades\\Auth';
    $userClass = 'App\\Models\\User';
    
    // Attempt login
    $credentials = [
        'email' => $data['email'],
        'password' => $data['password']
    ];
    
    if (!$authClass::attempt($credentials)) {
        header('HTTP/1.1 401 Unauthorized');
        echo json_encode(['message' => 'Invalid credentials']);
        exit();
    }
    
    // Get user and create token
    $user = $userClass::where('email', $data['email'])->first();
    $token = $user->createToken('auth_token')->plainTextToken;
    
    // Return success response
    header('Content-Type: application/json');
    echo json_encode([
        'user' => $user,
        'token' => $token,
        'message' => 'Login successful'
    ]);
    
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['message' => 'Login failed: ' . $e->getMessage()]);
}
