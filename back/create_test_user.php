<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CREATING ACTIVE TEST USER ===\n";

try {
    // Check if test user already exists
    $existingUser = \App\Models\User::where('email', 'active@test.com')->first();
    
    if ($existingUser) {
        // Update existing user to be active
        $existingUser->update([
            'verification_status' => 'active'
        ]);
        echo "✓ Updated existing user to active status\n";
        echo "User: {$existingUser->name} ({$existingUser->email})\n";
        echo "Status: {$existingUser->verification_status}\n";
    } else {
        // Create new active user
        $user = \App\Models\User::create([
            'name' => 'Active Test User',
            'email' => 'active@test.com',
            'password' => bcrypt('password123'),
            'verification_status' => 'active',
            'role' => 'user'
        ]);
        
        echo "✓ Created new active test user\n";
        echo "User: {$user->name} ({$user->email})\n";
        echo "Password: password123\n";
        echo "Status: {$user->verification_status}\n";
    }
    
    echo "\n✓ You can now log in with this user to test rental creation\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "✗ File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    exit(1);
} 