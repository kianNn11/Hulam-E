<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== RENTAL CREATION DEBUG TEST ===\n";

try {
    // Test basic database connection
    $pdo = new PDO("mysql:host=127.0.0.1;dbname=hulame;charset=utf8", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✓ Database connection successful\n";
    
    // Check if rentals table exists and has status column
    $stmt = $pdo->query("DESCRIBE rentals");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "✓ Rentals table structure:\n";
    foreach ($columns as $column) {
        echo "  - {$column['Field']} ({$column['Type']})\n";
    }
    
    // Check if we have a test user
    $stmt = $pdo->prepare("SELECT id, name, email, verification_status FROM users ORDER BY id LIMIT 1");
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "✗ No users found in database\n";
        exit(1);
    }
    
    echo "✓ Test user found: {$user['name']} (Status: {$user['verification_status']})\n";
    
    // Test rental creation via Eloquent
    echo "\n=== Testing Rental Creation via Eloquent ===\n";
    
    $rentalData = [
        'title' => 'Test Rental Item',
        'description' => 'This is a test rental item for debugging',
        'price' => 25.50,
        'location' => 'Test Location',
        'user_id' => $user['id'],
        'status' => 'available'
    ];
    
    echo "Creating rental with data: " . json_encode($rentalData, JSON_PRETTY_PRINT) . "\n";
    
    $rental = \App\Models\Rental::create($rentalData);
    echo "✓ Rental created successfully with ID: {$rental->id}\n";
    
    // Test middleware logic
    echo "\n=== Testing User Status Middleware Logic ===\n";
    
    $userModel = \App\Models\User::find($user['id']);
    echo "User verification status: {$userModel->verification_status}\n";
    
    if ($userModel->verification_status === 'suspended') {
        echo "⚠ User is suspended - would be blocked by middleware\n";
    } elseif ($userModel->verification_status === 'inactive') {
        echo "⚠ User is deactivated - would be blocked by middleware\n";
    } else {
        echo "✓ User status allows rental creation\n";
    }
    
    // Clean up test rental
    $rental->delete();
    echo "✓ Test rental cleaned up\n";
    
    echo "\n=== All tests passed! ===\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "✗ File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "✗ Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 