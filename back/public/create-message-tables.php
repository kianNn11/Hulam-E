<?php
header('Content-Type: text/plain');

try {
    // Database connection
    $host = '127.0.0.1';
    $dbname = 'hulame';
    $username = 'root';
    $password = '';

    $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];

    $pdo = new PDO($dsn, $username, $password, $options);

    echo "Creating message tables...\n\n";

    // Create contact_messages table
    $contactMessagesTable = "
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(500) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";

    $pdo->exec($contactMessagesTable);
    echo "✅ Created contact_messages table\n";

    // Create rental_messages table
    $rentalMessagesTable = "
        CREATE TABLE IF NOT EXISTS rental_messages (
            id INT AUTO_INCREMENT PRIMARY KEY,
            rental_id INT NOT NULL,
            renter_email VARCHAR(255) NOT NULL,
            sender_name VARCHAR(255) NOT NULL,
            sender_email VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            rental_title VARCHAR(500) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_rental_id (rental_id),
            INDEX idx_renter_email (renter_email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";

    $pdo->exec($rentalMessagesTable);
    echo "✅ Created rental_messages table\n";

    echo "\n✅ All message tables created successfully!\n";
    echo "\nTables created:\n";
    echo "- contact_messages: For storing contact form submissions\n";
    echo "- rental_messages: For storing rental inquiry messages\n";

} catch (Exception $e) {
    echo "❌ Error creating message tables: " . $e->getMessage() . "\n";
}
?> 