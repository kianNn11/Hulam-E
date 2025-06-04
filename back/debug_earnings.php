<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== HULAME DEBUG - EARNINGS ISSUE ===\n";

// Check if database connection works
try {
    $connection = \Illuminate\Support\Facades\DB::connection();
    $pdo = $connection->getPdo();
    echo "✓ Database connection successful\n";
} catch (\Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Count total records
echo "\n=== DATABASE STATISTICS ===\n";
echo "Total Users: " . \App\Models\User::count() . "\n";
echo "Total Rentals: " . \App\Models\Rental::count() . "\n";
echo "Total Transactions: " . \App\Models\Transaction::count() . "\n";

// Check transactions
echo "\n=== TRANSACTION DETAILS ===\n";
$transactions = \App\Models\Transaction::with(['rental', 'owner', 'renter'])->get();

if ($transactions->count() > 0) {
    echo "Found " . $transactions->count() . " transactions:\n";
    foreach ($transactions as $transaction) {
        echo sprintf(
            "ID: %d | Owner: %s | Renter: %s | Amount: ₱%s | Status: %s | Created: %s\n",
            $transaction->id,
            $transaction->owner->name ?? 'N/A',
            $transaction->renter->name ?? 'N/A',
            number_format($transaction->total_amount, 2),
            $transaction->status,
            $transaction->created_at->format('Y-m-d H:i:s')
        );
    }
} else {
    echo "No transactions found in database\n";
}

// Check earnings for a sample user
echo "\n=== EARNINGS CALCULATION TEST ===\n";
$users = \App\Models\User::limit(3)->get();
foreach ($users as $user) {
    $userTransactions = \App\Models\Transaction::where('owner_id', $user->id)->get();
    $totalEarnings = $userTransactions->where('status', 'completed')->sum('total_amount');
    $pendingEarnings = $userTransactions->whereIn('status', ['pending', 'approved'])->sum('total_amount');
    
    echo sprintf(
        "User: %s | Total Earnings: ₱%s | Pending: ₱%s | Transactions: %d\n",
        $user->name,
        number_format($totalEarnings, 2),
        number_format($pendingEarnings, 2),
        $userTransactions->count()
    );
}

echo "\n=== DEBUG COMPLETE ===\n"; 