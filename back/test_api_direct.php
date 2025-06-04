<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\API\UserController;

echo "=== Direct API Test ===\n\n";

// Get test user
$user = User::first();
if (!$user) {
    echo "No users found!\n";
    exit;
}

echo "Testing with user: {$user->name} (ID: {$user->id})\n\n";

// Create a small test image (1x1 PNG in base64)
$testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

echo "Test image size: " . strlen($testImage) . " bytes\n";

// Mock request data
$requestData = [
    'name' => 'Test User Updated',
    'bio' => 'Updated bio for testing',
    'profile_picture' => $testImage
];

echo "--- Simulating API Call ---\n";

// Create mock request
$request = new Request();
$request->merge($requestData);

// Mock authenticated user
$request->setUserResolver(function () use ($user) {
    return $user;
});

// Test the controller method directly
$controller = new UserController();

try {
    $response = $controller->updateProfile($request);
    $responseData = $response->getData(true);
    
    echo "API Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    echo "Response Message: " . ($responseData['message'] ?? 'N/A') . "\n";
    
    if (isset($responseData['user'])) {
        $returnedUser = $responseData['user'];
        echo "\nReturned User Data:\n";
        echo "- Name: " . ($returnedUser['name'] ?? 'N/A') . "\n";
        echo "- Bio: " . ($returnedUser['bio'] ?? 'N/A') . "\n";
        echo "- Profile Picture: " . (isset($returnedUser['profile_picture']) && $returnedUser['profile_picture'] ? 
            "Present (" . strlen($returnedUser['profile_picture']) . " chars)" : 
            "Missing") . "\n";
    }
    
    // Verify in database
    echo "\n--- Database Verification ---\n";
    $freshUser = User::find($user->id);
    echo "DB Name: " . $freshUser->name . "\n";
    echo "DB Bio: " . ($freshUser->bio ?? 'NULL') . "\n";
    echo "DB Profile Picture: " . ($freshUser->profile_picture ? 
        "Present (" . strlen($freshUser->profile_picture) . " chars)" : 
        "NULL") . "\n";
        
    if ($freshUser->profile_picture === $testImage) {
        echo "✓ Profile picture matches expected value!\n";
    } else {
        echo "✗ Profile picture does not match!\n";
        echo "Expected: " . substr($testImage, 0, 50) . "...\n";
        echo "Got: " . substr($freshUser->profile_picture ?? 'NULL', 0, 50) . "...\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n"; 