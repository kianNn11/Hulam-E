<?php
// Script to run database migrations for enhanced profile functionality
header('Content-Type: text/plain');
echo "Running Database Migrations\n";
echo "===========================\n";

try {
    // Database connection parameters
    $host = 'localhost';
    $db   = 'hulame';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    // Connect to database
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "✅ Connected to database successfully\n\n";
    
    // Check if columns already exist
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll();
    $columnNames = array_column($columns, 'Field');
    
    echo "Current table structure:\n";
    foreach ($columnNames as $col) {
        echo "  - $col\n";
    }
    echo "\n";
    
    // Define new columns to add
    $newColumns = [
        'location' => "ADD COLUMN `location` VARCHAR(255) NULL",
        'website' => "ADD COLUMN `website` VARCHAR(500) NULL", 
        'skills' => "ADD COLUMN `skills` JSON NULL",
        'education' => "ADD COLUMN `education` TEXT NULL",
        'rating' => "ADD COLUMN `rating` DECIMAL(2,1) DEFAULT 0.0",
        'total_ratings' => "ADD COLUMN `total_ratings` INT DEFAULT 0",
        'is_online' => "ADD COLUMN `is_online` BOOLEAN DEFAULT FALSE",
        'last_seen' => "ADD COLUMN `last_seen` TIMESTAMP NULL",
        'show_email' => "ADD COLUMN `show_email` BOOLEAN DEFAULT FALSE",
        'show_contact' => "ADD COLUMN `show_contact` BOOLEAN DEFAULT TRUE",
        'show_social_link' => "ADD COLUMN `show_social_link` BOOLEAN DEFAULT TRUE",
        'profile_completion' => "ADD COLUMN `profile_completion` INT DEFAULT 0"
    ];
    
    // Add missing columns
    echo "Adding new columns:\n";
    foreach ($newColumns as $columnName => $sql) {
        if (!in_array($columnName, $columnNames)) {
            try {
                $pdo->exec("ALTER TABLE users $sql");
                echo "✅ Added column: $columnName\n";
            } catch (PDOException $e) {
                echo "❌ Failed to add column $columnName: " . $e->getMessage() . "\n";
            }
        } else {
            echo "⏭️  Column $columnName already exists\n";
        }
    }
    
    // Modify existing columns for better constraints
    echo "\nModifying existing columns:\n";
    
    // Update bio to TEXT
    try {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN `bio` TEXT NULL");
        echo "✅ Modified bio column to TEXT\n";
    } catch (PDOException $e) {
        echo "❌ Failed to modify bio column: " . $e->getMessage() . "\n";
    }
    
    // Update contact_number length
    try {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN `contact_number` VARCHAR(20) NULL");
        echo "✅ Modified contact_number column length\n";
    } catch (PDOException $e) {
        echo "❌ Failed to modify contact_number column: " . $e->getMessage() . "\n";
    }
    
    // Update course_year length  
    try {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN `course_year` VARCHAR(100) NULL");
        echo "✅ Modified course_year column length\n";
    } catch (PDOException $e) {
        echo "❌ Failed to modify course_year column: " . $e->getMessage() . "\n";
    }
    
    // Update social_link length
    try {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN `social_link` VARCHAR(500) NULL");
        echo "✅ Modified social_link column length\n";
    } catch (PDOException $e) {
        echo "❌ Failed to modify social_link column: " . $e->getMessage() . "\n";
    }
    
    // Update profile_picture to TEXT for base64 images
    try {
        $pdo->exec("ALTER TABLE users MODIFY COLUMN `profile_picture` TEXT NULL");
        echo "✅ Modified profile_picture column to TEXT\n";
    } catch (PDOException $e) {
        echo "❌ Failed to modify profile_picture column: " . $e->getMessage() . "\n";
    }
    
    // Add indexes for better performance
    echo "\nAdding indexes:\n";
    
    $indexes = [
        "CREATE INDEX idx_verified_role ON users(verified, role)",
        "CREATE INDEX idx_last_seen ON users(last_seen)",
        "CREATE INDEX idx_rating ON users(rating)"
    ];
    
    foreach ($indexes as $indexSql) {
        try {
            $pdo->exec($indexSql);
            echo "✅ Added index successfully\n";
        } catch (PDOException $e) {
            if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
                echo "⏭️  Index already exists\n";
            } else {
                echo "❌ Failed to add index: " . $e->getMessage() . "\n";
            }
        }
    }
    
    // Update profile completion for existing users
    echo "\nUpdating profile completion for existing users:\n";
    
    $stmt = $pdo->query("SELECT id, name, email, bio, contact_number, course_year, birthday, gender, social_link, profile_picture FROM users");
    $users = $stmt->fetchAll();
    
    foreach ($users as $user) {
        $profileFields = ['name', 'email', 'bio', 'contact_number', 'course_year', 'birthday', 'gender', 'social_link', 'profile_picture'];
        $completedFields = 0;
        
        foreach ($profileFields as $field) {
            if (!empty($user[$field])) {
                $completedFields++;
            }
        }
        
        $profileCompletion = round(($completedFields / count($profileFields)) * 100);
        
        $updateStmt = $pdo->prepare("UPDATE users SET profile_completion = ? WHERE id = ?");
        $updateStmt->execute([$profileCompletion, $user['id']]);
        
        echo "✅ Updated profile completion for user {$user['name']}: {$profileCompletion}%\n";
    }
    
    echo "\n🎉 Database migration completed successfully!\n";
    
    // Show final table structure
    echo "\nFinal table structure:\n";
    $stmt = $pdo->query("DESCRIBE users");
    $finalColumns = $stmt->fetchAll();
    
    foreach ($finalColumns as $column) {
        echo "  - {$column['Field']} ({$column['Type']})\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?> 