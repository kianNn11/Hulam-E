<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use App\Http\Controllers\API\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Profile Picture Upload vs Verification Status ===\n\n";

// 1. Test profile picture upload for new unverified user
echo "1. Testing profile picture upload for new unverified user:\n";
try {
    $testUser = User::create([
        'name' => 'New User ' . time(),
        'email' => 'newuser_' . time() . '@example.com',
        'password' => bcrypt('password123'),
        'role' => 'user'
    ]);
    
    echo "✓ Created new user with ID: {$testUser->id}\n";
    echo "✓ Initial verification_status: '{$testUser->verification_status}'\n";
    
    // Simulate profile picture upload
    $testBase64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    $originalStatus = $testUser->verification_status;
    $testUser->update(['profile_picture' => $testBase64Image]);
    $testUser->refresh();
    
    echo "✓ Updated profile picture\n";
    echo "✓ Verification status after picture update: '{$testUser->verification_status}'\n";
    
    if ($testUser->verification_status === $originalStatus && $testUser->verification_status === 'unverified') {
        echo "✓ PASS: Verification status remained 'unverified' after profile picture upload\n";
    } else {
        echo "✗ FAIL: Verification status changed from '{$originalStatus}' to '{$testUser->verification_status}'\n";
    }
    
    $testUser->delete();
    echo "✓ Test user deleted\n\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// 2. Test profile picture upload for user with pending verification
echo "2. Testing profile picture upload for user with pending verification:\n";
try {
    $testUser = User::create([
        'name' => 'Pending User ' . time(),
        'email' => 'pending_' . time() . '@example.com',
        'password' => bcrypt('password123'),
        'role' => 'user',
        'verification_status' => 'pending',
        'verification_document' => 'test-document.pdf',
        'verification_submitted_at' => now()
    ]);
    
    echo "✓ Created user with pending verification, ID: {$testUser->id}\n";
    echo "✓ Initial verification_status: '{$testUser->verification_status}'\n";
    
    // Simulate profile picture upload
    $testBase64Image = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
    
    $originalStatus = $testUser->verification_status;
    $originalDoc = $testUser->verification_document;
    $originalSubmitted = $testUser->verification_submitted_at;
    
    $testUser->update(['profile_picture' => $testBase64Image]);
    $testUser->refresh();
    
    echo "✓ Updated profile picture\n";
    echo "✓ Verification status after picture update: '{$testUser->verification_status}'\n";
    echo "✓ Verification document preserved: " . ($testUser->verification_document === $originalDoc ? 'Yes' : 'No') . "\n";
    echo "✓ Verification submitted date preserved: " . ($testUser->verification_submitted_at == $originalSubmitted ? 'Yes' : 'No') . "\n";
    
    if ($testUser->verification_status === 'pending' && 
        $testUser->verification_document === $originalDoc &&
        $testUser->verification_submitted_at == $originalSubmitted) {
        echo "✓ PASS: All verification fields preserved during profile picture upload\n";
    } else {
        echo "✗ FAIL: Verification fields were modified during profile picture upload\n";
    }
    
    $testUser->delete();
    echo "✓ Test user deleted\n\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

// 3. Test UserController updateProfile method directly
echo "3. Testing UserController updateProfile method:\n";
try {
    $testUser = User::create([
        'name' => 'Controller Test User ' . time(),
        'email' => 'controller_' . time() . '@example.com',
        'password' => bcrypt('password123'),
        'role' => 'user'
    ]);
    
    echo "✓ Created test user for controller test, ID: {$testUser->id}\n";
    echo "✓ Initial verification_status: '{$testUser->verification_status}'\n";
    
    // Create a mock request
    $request = new Request();
    $request->merge([
        'name' => $testUser->name,
        'bio' => 'Updated bio for testing',
        'profile_picture' => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    ]);
    
    // Set the authenticated user
    $request->setUserResolver(function () use ($testUser) {
        return $testUser;
    });
    
    $originalStatus = $testUser->verification_status;
    
    // Call the controller method
    $controller = new UserController();
    $response = $controller->updateProfile($request);
    
    $responseData = $response->getData(true);
    
    echo "✓ Controller response success: " . ($responseData['success'] ? 'true' : 'false') . "\n";
    
    // Refresh user from database
    $testUser->refresh();
    
    echo "✓ Verification status after controller update: '{$testUser->verification_status}'\n";
    echo "✓ Profile picture updated: " . (!empty($testUser->profile_picture) ? 'Yes' : 'No') . "\n";
    
    if ($testUser->verification_status === $originalStatus && $responseData['success']) {
        echo "✓ PASS: Controller properly preserved verification status during profile update\n";
    } else {
        echo "✗ FAIL: Controller did not preserve verification status or failed to update profile\n";
    }
    
    $testUser->delete();
    echo "✓ Test user deleted\n\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n\n";
}

echo "=== Profile Picture vs Verification Test Complete ===\n";
echo "\n";
echo "Summary:\n";
echo "- New users should have 'unverified' status that doesn't change with profile picture uploads\n";
echo "- Users with pending verification should retain their status and verification data\n";
echo "- The UserController updateProfile method should preserve verification fields\n";
echo "- Profile picture uploads should be completely separate from verification document uploads\n";
?> 