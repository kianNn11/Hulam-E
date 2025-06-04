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

// Only accept POST requests for actual registration
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('HTTP/1.1 405 Method Not Allowed');
    echo json_encode(['message' => 'Method not allowed']);
    exit();
}

// Get JSON data from request body
$data = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['password_confirmation'])) {
    header('HTTP/1.1 422 Unprocessable Entity');
    echo json_encode(['message' => 'Missing required fields']);
    exit();
}

// Process registration using Laravel User model
try {
    $response = $kernel->handle(
        $request = Illuminate\Http\Request::capture()
    )->send();

    // Access the user model
    $userClass = 'App\\Models\\User';
    $hashClass = 'Illuminate\\Support\\Facades\\Hash';
    
    // Check if email already exists
    if ($userClass::where('email', $data['email'])->exists()) {
        header('HTTP/1.1 422 Unprocessable Entity');
        echo json_encode(['message' => 'Email already exists']);
        exit();
    }
    
    // Create user
    $user = $userClass::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => $hashClass::make($data['password']),
        'role' => 'user',
    ]);
    
    // Generate token
    $token = $user->createToken('auth_token')->plainTextToken;
    
    // Return success response
    header('Content-Type: application/json');
    echo json_encode([
        'user' => $user,
        'token' => $token,
        'message' => 'Registration successful'
    ]);
    
} catch (Exception $e) {
    header('HTTP/1.1 500 Internal Server Error');
    echo json_encode(['message' => 'Registration failed: ' . $e->getMessage()]);
}
