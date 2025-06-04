<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FIXING DATABASE ISSUES ===\n";

try {
    $connection = \Illuminate\Support\Facades\DB::connection();
    $pdo = $connection->getPdo();
    
    // 1. Add missing migration records
    echo "1. Adding missing migration records...\n";
    
    $missingMigrations = [
        '2025_06_03_030629_create_transactions_table',
        '2025_06_03_062256_create_notifications_table'
    ];
    
    foreach ($missingMigrations as $migration) {
        $exists = \Illuminate\Support\Facades\DB::table('migrations')
            ->where('migration', $migration)
            ->exists();
            
        if (!$exists) {
            \Illuminate\Support\Facades\DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => 6
            ]);
            echo "  ✓ Added: $migration\n";
        } else {
            echo "  - Already exists: $migration\n";
        }
    }
    
    // 2. Fix total_amount field size
    echo "2. Fixing total_amount field size...\n";
    \Illuminate\Support\Facades\DB::statement("ALTER TABLE transactions MODIFY total_amount DECIMAL(15,2)");
    echo "  ✓ Modified total_amount to DECIMAL(15,2)\n";
    
    // 3. Update the problematic rental price
    echo "3. Fixing rental prices...\n";
    $highPriceRentals = \App\Models\Rental::where('price', '>', 100000)->get();
    foreach ($highPriceRentals as $rental) {
        $newPrice = min($rental->price, 10000); // Cap at 10,000
        $rental->update(['price' => $newPrice]);
        echo "  ✓ Fixed rental '{$rental->title}': ₱" . number_format($rental->price, 2) . " -> ₱" . number_format($newPrice, 2) . "\n";
    }
    
    echo "\n=== DATABASE FIXED SUCCESSFULLY ===\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
} 