<?php
// Test database connection script
header('Content-Type: text/plain');
echo "Database connection test\n";
echo "------------------------\n";

try {
    // Database connection parameters
    $host = 'localhost';
    $db   = 'hulame';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';

    echo "Trying to connect to database: $host, $db\n";

    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    
    // Connect to database
    $pdo = new PDO($dsn, $user, $pass, $options);
    echo "✅ Connected to database successfully\n";
    
    // Check if users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Users table exists\n";
        
        // Show users table structure
        $stmt = $pdo->query("DESCRIBE users");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo "Users table columns: " . implode(', ', $columns) . "\n";
        
        // Show sample users
        $stmt = $pdo->query("SELECT id, name, email FROM users LIMIT 3");
        $users = $stmt->fetchAll();
        echo "Sample users:\n";
        foreach ($users as $user) {
            echo "ID: {$user['id']}, Name: {$user['name']}, Email: {$user['email']}\n";
        }
    } else {
        echo "❌ Users table does not exist\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
