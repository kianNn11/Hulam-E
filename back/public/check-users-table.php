<?php
// Script to check if the users table has the required profile fields
header('Content-Type: text/plain');
echo "Users Table Structure Check\n";
echo "--------------------------\n";

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
    echo "✅ Connected to database successfully\n";
    
    // Show users table structure
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll();
    
    echo "\nUsers table structure:\n";
    echo "-----------------------\n";
    
    foreach ($columns as $column) {
        echo "Field: {$column['Field']}, Type: {$column['Type']}, Null: {$column['Null']}, Default: " . 
             (isset($column['Default']) ? $column['Default'] : 'NULL') . "\n";
    }
    
    // Check for specific profile fields
    $requiredFields = [
        'bio', 'contact_number', 'course_year', 'birthday', 
        'gender', 'social_link', 'profile_picture'
    ];
    
    echo "\nChecking required profile fields:\n";
    echo "-------------------------------\n";
    
    $columnNames = array_column($columns, 'Field');
    
    foreach ($requiredFields as $field) {
        if (in_array($field, $columnNames)) {
            echo "✅ Field '{$field}' exists in the users table\n";
        } else {
            echo "❌ Field '{$field}' is MISSING in the users table\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}
?>
