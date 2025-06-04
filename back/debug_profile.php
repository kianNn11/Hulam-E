<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "=== HULAM-E Profile Debug ===\n\n";

// Check database connection
try {
    DB::connection()->getPdo();
    echo "✓ Database connected successfully\n\n";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "\n";
    exit;
}

// Check users table structure
echo "--- Users Table Structure ---\n";
$columns = DB::select("DESCRIBE users");
foreach ($columns as $column) {
    if (in_array($column->Field, ['profile_picture', 'name', 'email', 'bio'])) {
        echo "✓ {$column->Field}: {$column->Type}\n";
    }
}
echo "\n";

// Check existing users
echo "--- Existing Users ---\n";
$users = User::take(5)->get(['id', 'name', 'email', 'profile_picture', 'created_at']);

if ($users->count() == 0) {
    echo "No users found in database\n";
} else {
    foreach ($users as $user) {
        echo "ID: {$user->id}\n";
        echo "Name: {$user->name}\n";
        echo "Email: {$user->email}\n";
        echo "Profile Picture: ";
        
        if ($user->profile_picture) {
            if (str_starts_with($user->profile_picture, 'data:image/')) {
                echo "[Base64 Image - " . strlen($user->profile_picture) . " chars]\n";
            } else {
                echo $user->profile_picture . "\n";
            }
        } else {
            echo "[NULL]\n";
        }
        echo "Created: {$user->created_at}\n";
        echo "---\n";
    }
}

echo "\n=== Debug Complete ===\n"; 