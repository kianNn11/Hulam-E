<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TRANSACTION CREATION TEST ===\n";

// Get a rental and users for testing
$rental = \App\Models\Rental::first();
$users = \App\Models\User::take(2)->get();

if (!$rental) {
    echo "✗ No rentals found in database\n";
    exit(1);
}

if ($users->count() < 2) {
    echo "✗ Need at least 2 users for testing\n";
    exit(1);
}

$owner = $users->first();
$renter = $users->last();

echo "✓ Found rental: {$rental->title} (₱{$rental->price})\n";
echo "✓ Owner: {$owner->name}\n";
echo "✓ Renter: {$renter->name}\n";

// Create a test transaction
try {
    $transaction = \App\Models\Transaction::create([
        'rental_id' => $rental->id,
        'renter_id' => $renter->id,
        'owner_id' => $owner->id,
        'status' => 'pending',
        'start_date' => now()->addDay(),
        'end_date' => now()->addDays(7),
        'total_amount' => $rental->price * 7, // 7 days
        'renter_message' => 'Test transaction creation'
    ]);
    
    echo "✓ Transaction created successfully with ID: {$transaction->id}\n";
    echo "✓ Amount: ₱" . number_format($transaction->total_amount, 2) . "\n";
    
    // Test completing the transaction
    $transaction->update(['status' => 'completed', 'completed_at' => now()]);
    echo "✓ Transaction marked as completed\n";
    
    // Test earnings calculation
    $ownerEarnings = \App\Models\Transaction::where('owner_id', $owner->id)
        ->where('status', 'completed')
        ->sum('total_amount');
    
    echo "✓ Owner earnings: ₱" . number_format($ownerEarnings, 2) . "\n";
    
} catch (\Exception $e) {
    echo "✗ Transaction creation failed: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETE ===\n"; 