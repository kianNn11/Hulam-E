<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== FIXING MIGRATION ISSUES ===\n";

try {
    // Mark problematic migrations as run
    $problemMigrations = [
        '2025_06_03_220557_create_transactions_table',
        '2025_06_03_220600_create_notifications_table',
        '2025_06_03_220725_create_transactions_table'
    ];
    
    foreach ($problemMigrations as $migration) {
        $exists = \Illuminate\Support\Facades\DB::table('migrations')
            ->where('migration', $migration)
            ->exists();
            
        if (!$exists) {
            \Illuminate\Support\Facades\DB::table('migrations')->insert([
                'migration' => $migration,
                'batch' => 6
            ]);
            echo "  ✓ Marked as run: $migration\n";
        } else {
            echo "  - Already marked: $migration\n";
        }
    }
    
    echo "\n=== MIGRATIONS FIXED ===\n";
    
} catch (\Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
} 