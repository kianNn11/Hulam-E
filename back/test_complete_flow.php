<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== COMPLETE FLOW TEST ===\n";

try {
    // Get test data
    $rental = \App\Models\Rental::first();
    $users = \App\Models\User::take(2)->get();
    
    if (!$rental || $users->count() < 2) {
        echo "✗ Insufficient test data\n";
        exit(1);
    }
    
    $owner = $users->first();
    $renter = $users->last();
    
    echo "✓ Owner: {$owner->name} (ID: {$owner->id})\n";
    echo "✓ Renter: {$renter->name} (ID: {$renter->id})\n";
    echo "✓ Rental: {$rental->title} (₱{$rental->price})\n\n";
    
    // Test 1: Create a GCash transaction (should be completed immediately)
    echo "=== TEST 1: GCash Transaction (Instant) ===\n";
    $gcashTransaction = \App\Models\Transaction::create([
        'rental_id' => $rental->id,
        'renter_id' => $renter->id,
        'owner_id' => $owner->id,
        'status' => 'completed',
        'start_date' => now()->addDay(),
        'end_date' => now()->addWeek(),
        'total_amount' => 500.00,
        'renter_message' => 'Test GCash payment',
        'completed_at' => now()
    ]);
    echo "✓ GCash transaction created (ID: {$gcashTransaction->id})\n";
    
    // Test 2: Create a COD transaction (should be pending)
    echo "\n=== TEST 2: COD Transaction (Pending) ===\n";
    $codTransaction = \App\Models\Transaction::create([
        'rental_id' => $rental->id,
        'renter_id' => $renter->id,
        'owner_id' => $owner->id,
        'status' => 'pending',
        'start_date' => now()->addDay(),
        'end_date' => now()->addWeek(),
        'total_amount' => 300.00,
        'renter_message' => 'Test COD payment'
    ]);
    echo "✓ COD transaction created (ID: {$codTransaction->id})\n";
    
    // Test 3: Calculate earnings
    echo "\n=== TEST 3: Earnings Calculation ===\n";
    $completedEarnings = \App\Models\Transaction::where('owner_id', $owner->id)
        ->where('status', 'completed')
        ->sum('total_amount');
    
    $pendingEarnings = \App\Models\Transaction::where('owner_id', $owner->id)
        ->whereIn('status', ['pending', 'approved'])
        ->sum('total_amount');
    
    echo "✓ Completed earnings: ₱" . number_format($completedEarnings, 2) . "\n";
    echo "✓ Pending earnings: ₱" . number_format($pendingEarnings, 2) . "\n";
    echo "✓ Total transactions: " . \App\Models\Transaction::where('owner_id', $owner->id)->count() . "\n";
    
    // Test 4: Complete the COD transaction
    echo "\n=== TEST 4: Complete COD Transaction ===\n";
    $codTransaction->update([
        'status' => 'completed',
        'completed_at' => now()
    ]);
    echo "✓ COD transaction marked as completed\n";
    
    // Recalculate earnings
    $newCompletedEarnings = \App\Models\Transaction::where('owner_id', $owner->id)
        ->where('status', 'completed')
        ->sum('total_amount');
    
    echo "✓ Updated completed earnings: ₱" . number_format($newCompletedEarnings, 2) . "\n";
    
    echo "\n=== FLOW TEST COMPLETE ===\n";
    echo "Earnings should now be visible on the frontend!\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} 