<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Fixing Shabu rental status ===" . PHP_EOL;

// Find the Shabu rental and its completed transaction
$shabu = DB::table('rentals')->where('title', 'like', '%shabu%')->first();
$completedTransaction = DB::table('transactions')
    ->where('rental_id', $shabu->id)
    ->where('status', 'completed')
    ->first();

if (!$shabu) {
    echo "No Shabu rental found!" . PHP_EOL;
    exit;
}

if (!$completedTransaction) {
    echo "No completed transaction found for Shabu!" . PHP_EOL;
    exit;
}

echo "Found Shabu rental (ID: {$shabu->id}) with status: {$shabu->status}" . PHP_EOL;
echo "Found completed transaction (ID: {$completedTransaction->id})" . PHP_EOL;

// Update the rental status to 'rented' since there's a completed transaction
if ($shabu->status === 'available') {
    DB::table('rentals')
        ->where('id', $shabu->id)
        ->update(['status' => 'rented']);
    
    echo "✅ Updated Shabu rental status from 'available' to 'rented'" . PHP_EOL;
} else {
    echo "Shabu rental status is already: {$shabu->status}" . PHP_EOL;
}

// Verify the update
$updatedShabu = DB::table('rentals')->where('id', $shabu->id)->first();
echo "Verified: Shabu rental status is now: {$updatedShabu->status}" . PHP_EOL;

echo PHP_EOL . "=== Final counts ===" . PHP_EOL;
$availableCount = DB::table('rentals')->where('status', 'available')->count();
$rentedCount = DB::table('rentals')->where('status', 'rented')->count();
echo "Available rentals: {$availableCount}" . PHP_EOL;
echo "Rented items: {$rentedCount}" . PHP_EOL; 