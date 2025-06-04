<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== HULAM-E DIAGNOSTIC ===" . PHP_EOL;

echo "All rentals:" . PHP_EOL;
$rentals = DB::table('rentals')->get();
foreach ($rentals as $rental) {
    echo "ID: {$rental->id}, Title: {$rental->title}, Status: {$rental->status}" . PHP_EOL;
}

echo PHP_EOL . "All transactions:" . PHP_EOL;
$transactions = DB::table('transactions')
    ->join('rentals', 'transactions.rental_id', '=', 'rentals.id')
    ->select('transactions.*', 'rentals.title as rental_title')
    ->orderBy('transactions.created_at', 'desc')
    ->get();

foreach ($transactions as $transaction) {
    echo "Transaction ID: {$transaction->id}" . PHP_EOL;
    echo "  Rental: {$transaction->rental_title} (ID: {$transaction->rental_id})" . PHP_EOL;
    echo "  Status: {$transaction->status}" . PHP_EOL;
    echo "  Created: {$transaction->created_at}" . PHP_EOL;
    echo "  Completed: " . ($transaction->completed_at ?? 'Not completed') . PHP_EOL;
    echo "---" . PHP_EOL;
}

echo PHP_EOL . "Available vs Rented count:" . PHP_EOL;
echo "Available: " . DB::table('rentals')->where('status', 'available')->count() . PHP_EOL;
echo "Rented: " . DB::table('rentals')->where('status', 'rented')->count() . PHP_EOL; 