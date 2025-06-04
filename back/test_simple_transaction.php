<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== SIMPLE TRANSACTION TEST ===\n";

// Get data
$rental = \App\Models\Rental::first();
$users = \App\Models\User::take(2)->get();

if (!$rental || $users->count() < 2) {
    echo "✗ Insufficient data for testing\n";
    exit(1);
}

$owner = $users->first();
$renter = $users->last();

echo "✓ Rental: {$rental->title} (₱{$rental->price})\n";
echo "✓ Owner: {$owner->name} (ID: {$owner->id})\n";
echo "✓ Renter: {$renter->name} (ID: {$renter->id})\n";

// Test with a simple amount
$testAmount = 100.00;

try {
    $transaction = \App\Models\Transaction::create([
        'rental_id' => $rental->id,
        'renter_id' => $renter->id,
        'owner_id' => $owner->id,
        'status' => 'pending',
        'start_date' => '2025-01-16',
        'end_date' => '2025-01-17',
        'total_amount' => $testAmount,
        'renter_message' => 'Simple test'
    ]);
    
    echo "✓ Transaction created with ID: {$transaction->id}\n";
    echo "✓ Amount: ₱" . number_format($transaction->total_amount, 2) . "\n";
    
    // Update to completed
    $transaction->update(['status' => 'completed', 'completed_at' => now()]);
    echo "✓ Transaction marked as completed\n";
    
    // Check earnings
    $earnings = \App\Models\Transaction::where('owner_id', $owner->id)
        ->where('status', 'completed')
        ->sum('total_amount');
    
    echo "✓ Owner total earnings: ₱" . number_format($earnings, 2) . "\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETE ===\n"; 