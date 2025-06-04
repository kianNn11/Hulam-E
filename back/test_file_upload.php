<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Controllers\API\UserController;

echo "=== File-Based Profile Picture Test ===\n\n";

// Get test user
$user = User::first();
if (!$user) {
    echo "No users found!\n";
    exit;
}

echo "Testing with user: {$user->name} (ID: {$user->id})\n";

// Create a small test image (1x1 PNG in base64)
$testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';

echo "Test image size: " . strlen($testImage) . " bytes\n";

// Test the new file-based system
$requestData = [
    'name' => $user->name,
    'bio' => 'Testing file-based profile picture',
    'profile_picture' => $testImage
];

echo "\n--- Testing File-Based Upload ---\n";

$request = new Request();
$request->merge($requestData);

$request->setUserResolver(function () use ($user) {
    return $user;
});

$controller = new UserController();

try {
    $response = $controller->updateProfile($request);
    $responseData = $response->getData(true);
    
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    
    if (isset($responseData['user']['profile_picture'])) {
        $profilePicturePath = $responseData['user']['profile_picture'];
        echo "Profile Picture Path: " . $profilePicturePath . "\n";
        
        // Check if file exists
        if (str_starts_with($profilePicturePath, '/storage/')) {
            $filePath = public_path($profilePicturePath);
            if (file_exists($filePath)) {
                echo "✓ File exists at: " . $filePath . "\n";
                echo "✓ File size: " . filesize($filePath) . " bytes\n";
            } else {
                echo "✗ File not found at: " . $filePath . "\n";
            }
        }
        
        // Verify database entry
        $freshUser = User::find($user->id);
        if ($freshUser->profile_picture === $profilePicturePath) {
            echo "✓ Database updated correctly\n";
        } else {
            echo "✗ Database mismatch\n";
            echo "Expected: " . $profilePicturePath . "\n";
            echo "Got: " . $freshUser->profile_picture . "\n";
        }
        
    } else {
        echo "✗ No profile picture in response\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== Test Complete ===\n"; 