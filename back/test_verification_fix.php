<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Models\User;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Verification Status Fix ===\n\n";

// 1. Check default verification_status for new users
echo "1. Testing default verification_status for new users:\n";
try {
    $testUser = User::create([
        'name' => 'Test User ' . time(),
        'email' => 'test_' . time() . '@example.com',
        'password' => bcrypt('password123'),
        'role' => 'user'
    ]);
    
    echo "✓ Created test user with ID: {$testUser->id}\n";
    echo "✓ Default verification_status: '{$testUser->verification_status}'\n";
    
    if ($testUser->verification_status === 'unverified') {
        echo "✓ PASS: Default verification_status is 'unverified'\n";
    } else {
        echo "✗ FAIL: Default verification_status is '{$testUser->verification_status}', expected 'unverified'\n";
    }
    
    // Clean up
    $testUser->delete();
    echo "✓ Test user deleted\n\n";
    
} catch (Exception $e) {
    echo "✗ Error creating test user: " . $e->getMessage() . "\n\n";
}

// 2. Check existing users with incorrect pending status
echo "2. Checking for users with pending status but no verification documents:\n";
try {
    $incorrectUsers = User::where('verification_status', 'pending')
                         ->where(function($query) {
                             $query->whereNull('verification_document')
                                   ->orWhereNull('verification_submitted_at');
                         })
                         ->get();
    
    echo "Found {$incorrectUsers->count()} users with incorrect pending status\n";
    
    if ($incorrectUsers->count() === 0) {
        echo "✓ PASS: No users with incorrect pending status found\n";
    } else {
        echo "✗ FAIL: Found users with pending status but no verification documents:\n";
        foreach ($incorrectUsers as $user) {
            echo "  - User ID {$user->id}: {$user->name} ({$user->email})\n";
        }
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "✗ Error checking users: " . $e->getMessage() . "\n\n";
}

// 3. Test profile update doesn't affect verification status
echo "3. Testing profile update preservation of verification status:\n";
try {
    // Create a test user with verification document
    $testUser = User::create([
        'name' => 'Verified Test User ' . time(),
        'email' => 'verified_test_' . time() . '@example.com',
        'password' => bcrypt('password123'),
        'role' => 'user',
        'verification_status' => 'pending',
        'verification_document' => 'test-document.pdf',
        'verification_submitted_at' => now()
    ]);
    
    echo "✓ Created test user with pending verification\n";
    echo "✓ Original verification_status: '{$testUser->verification_status}'\n";
    
    // Simulate profile picture update
    $testUser->update([
        'bio' => 'Updated bio',
        'profile_picture' => '/storage/profile_pictures/test.jpg'
    ]);
    
    $testUser->refresh();
    echo "✓ Updated profile with bio and profile picture\n";
    echo "✓ After update verification_status: '{$testUser->verification_status}'\n";
    
    if ($testUser->verification_status === 'pending') {
        echo "✓ PASS: Verification status preserved during profile update\n";
    } else {
        echo "✗ FAIL: Verification status changed from 'pending' to '{$testUser->verification_status}'\n";
    }
    
    // Clean up
    $testUser->delete();
    echo "✓ Test user deleted\n\n";
    
} catch (Exception $e) {
    echo "✗ Error testing profile update: " . $e->getMessage() . "\n\n";
}

// 4. Check users with proper pending verification status
echo "4. Checking users with proper pending verification status:\n";
try {
    $properPendingUsers = User::where('verification_status', 'pending')
                             ->whereNotNull('verification_document')
                             ->whereNotNull('verification_submitted_at')
                             ->get();
    
    echo "Found {$properPendingUsers->count()} users with proper pending verification status\n";
    
    if ($properPendingUsers->count() > 0) {
        echo "✓ These users should appear in admin verification queue:\n";
        foreach ($properPendingUsers as $user) {
            $submitDate = $user->verification_submitted_at ? $user->verification_submitted_at->format('Y-m-d H:i:s') : 'N/A';
            echo "  - User ID {$user->id}: {$user->name} (submitted: {$submitDate})\n";
        }
    } else {
        echo "No users with proper pending verification status found\n";
    }
    echo "\n";
    
} catch (Exception $e) {
    echo "✗ Error checking proper pending users: " . $e->getMessage() . "\n\n";
}

echo "=== Test Complete ===\n";
echo "\n";
echo "Summary:\n";
echo "- Default verification_status should be 'unverified' for new users\n";
echo "- Users with 'pending' status should have verification_document and verification_submitted_at\n";
echo "- Profile updates should not affect verification_status\n";
echo "- Only users with proper pending status should appear in admin verification queue\n";
?> 