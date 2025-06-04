<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "=== Profile Update Test ===\n\n";

// Get a test user
$user = User::first();
if (!$user) {
    echo "No users found! Creating a test user...\n";
    $user = User::create([
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
        'role' => 'user',
        'verified' => true
    ]);
}

echo "Testing with user: {$user->name} (ID: {$user->id})\n\n";

// Test 1: Small image update
echo "--- Test 1: Small Base64 Image ---\n";
$smallImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
echo "Image size: " . strlen($smallImage) . " bytes\n";

$user->profile_picture = $smallImage;
$user->save();

$updated = User::find($user->id);
if ($updated->profile_picture) {
    echo "✓ Small image saved successfully!\n";
} else {
    echo "✗ Small image failed to save\n";
}

// Test 2: Check current profile picture
echo "\n--- Test 2: Current Profile Picture ---\n";
$freshUser = User::find($user->id);
if ($freshUser->profile_picture) {
    $size = strlen($freshUser->profile_picture);
    echo "Current profile picture size: {$size} bytes\n";
    if (str_starts_with($freshUser->profile_picture, 'data:image/')) {
        echo "✓ Is valid base64 image\n";
    } else {
        echo "✗ Not a base64 image: " . substr($freshUser->profile_picture, 0, 50) . "...\n";
    }
} else {
    echo "No profile picture found\n";
}

// Test 3: Manual update with SQL
echo "\n--- Test 3: Direct SQL Update ---\n";
$testData = 'data:image/png;base64,TEST_IMAGE_DATA_123';
DB::table('users')
    ->where('id', $user->id)
    ->update(['profile_picture' => $testData]);

$directCheck = DB::table('users')
    ->where('id', $user->id)
    ->value('profile_picture');

if ($directCheck === $testData) {
    echo "✓ Direct SQL update successful\n";
} else {
    echo "✗ Direct SQL update failed\n";
    echo "Expected: {$testData}\n";
    echo "Got: {$directCheck}\n";
}

echo "\n=== Test Complete ===\n"; 