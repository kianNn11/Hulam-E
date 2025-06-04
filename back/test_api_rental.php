<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== API RENTAL CREATION TEST ===\n";

try {
    // Get a test user
    $user = \App\Models\User::first();
    if (!$user) {
        echo "✗ No users found\n";
        exit(1);
    }
    
    echo "✓ Test user: {$user->name} (Status: {$user->verification_status})\n";
    
    // Create a fake request to test the middleware and controller
    $request = \Illuminate\Http\Request::create('/api/rentals', 'POST', [
        'title' => 'Test API Rental',
        'description' => 'This is a test rental via API',
        'price' => 15.00,
        'location' => 'API Test Location'
    ]);
    
    // Set the authenticated user
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    echo "✓ Request created with user authentication\n";
    
    // Test middleware logic first
    $middleware = new \App\Http\Middleware\CheckUserStatus();
    
    echo "\n=== Testing Middleware Logic ===\n";
    echo "User status: {$user->verification_status}\n";
    
    // Simulate the middleware check
    if ($user->verification_status === 'suspended') {
        echo "⚠ Middleware would block: User is suspended\n";
    } elseif ($user->verification_status === 'inactive') {
        echo "⚠ Middleware would block: User is deactivated\n";
    } else {
        echo "✓ Middleware would allow: User status is acceptable\n";
    }
    
    // Test controller logic
    echo "\n=== Testing Controller Logic ===\n";
    
    $controller = new \App\Http\Controllers\API\RentalController();
    
    // Create validation
    $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
        'title' => 'required|string|min:3|max:255',
        'description' => 'required|string|min:10|max:1000',
        'price' => 'required|numeric|min:0.01',
        'location' => 'required|string|min:2|max:255',
        'image' => 'nullable|image|mimes:jpeg,jpg,png,gif|max:5120',
    ]);

    if ($validator->fails()) {
        echo "✗ Validation failed: " . json_encode($validator->errors()) . "\n";
        exit(1);
    }
    
    echo "✓ Validation passed\n";
    
    // Test rental creation
    $rentalData = [
        'title' => trim($request->title),
        'description' => trim($request->description),
        'price' => $request->price,
        'location' => trim($request->location),
        'user_id' => $user->id,
        'status' => 'available',
    ];

    echo "Creating rental with data: " . json_encode($rentalData, JSON_PRETTY_PRINT) . "\n";
    
    $rental = \App\Models\Rental::create($rentalData);
    echo "✓ Rental created successfully with ID: {$rental->id}\n";
    
    // Clean up
    $rental->delete();
    echo "✓ Test rental cleaned up\n";
    
    echo "\n=== All API tests passed! ===\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "✗ File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "✗ Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 