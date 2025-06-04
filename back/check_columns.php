<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "=== Database Column Check ===\n\n";

// Get actual table structure
echo "Current users table structure:\n";
$columns = DB::select("DESCRIBE users");
foreach ($columns as $column) {
    echo "- {$column->Field} ({$column->Type})\n";
}

echo "\n--- Profile Fields Check ---\n";
$profileFields = [
    'bio' => 'text',
    'contact_number' => 'varchar(20)',
    'course_year' => 'varchar(100)',
    'birthday' => 'date',
    'gender' => 'enum',
    'social_link' => 'varchar(500)',
    'profile_picture' => 'text',
    'profile_completion' => 'int'
];

$missingFields = [];
foreach ($profileFields as $field => $type) {
    if (Schema::hasColumn('users', $field)) {
        echo "✓ {$field} exists\n";
    } else {
        echo "✗ {$field} MISSING\n";
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    echo "\n--- Adding Missing Fields ---\n";
    try {
        Schema::table('users', function ($table) use ($missingFields) {
            foreach ($missingFields as $field) {
                switch ($field) {
                    case 'bio':
                        $table->text('bio')->nullable();
                        break;
                    case 'contact_number':
                        $table->string('contact_number', 20)->nullable();
                        break;
                    case 'course_year':
                        $table->string('course_year', 100)->nullable();
                        break;
                    case 'birthday':
                        $table->date('birthday')->nullable();
                        break;
                    case 'gender':
                        $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
                        break;
                    case 'social_link':
                        $table->string('social_link', 500)->nullable();
                        break;
                    case 'profile_picture':
                        $table->text('profile_picture')->nullable();
                        break;
                    case 'profile_completion':
                        $table->integer('profile_completion')->default(0);
                        break;
                }
                echo "✓ Added {$field}\n";
            }
        });
        echo "\nAll missing fields added successfully!\n";
    } catch (Exception $e) {
        echo "Error adding fields: " . $e->getMessage() . "\n";
    }
} else {
    echo "\n✓ All profile fields exist!\n";
}

echo "\n=== Check Complete ===\n"; 