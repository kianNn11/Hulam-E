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

    echo "Creating notifications table...\n\n";

    // Create notifications table
    $notificationsTable = "
        CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type ENUM('success', 'warning', 'info', 'error') DEFAULT 'info',
            title VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            action_type VARCHAR(100),
            action_data JSON,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_created_at (created_at),
            INDEX idx_is_read (is_read)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";

    $pdo->exec($notificationsTable);
    echo "✅ Created notifications table\n";

    // Insert some sample notifications for testing
    $sampleNotifications = [
        [
            'user_id' => 1,
            'type' => 'success',
            'title' => 'New Rental Inquiry',
            'message' => 'Someone is interested in your "Gaming Laptop" listing',
            'action_type' => 'view-rental',
            'action_data' => '{"rental_id": 1}'
        ],
        [
            'user_id' => 1,
            'type' => 'info',
            'title' => 'Payment Received',
            'message' => 'You received ₱500 for your rental booking',
            'action_type' => 'view-earnings',
            'action_data' => '{"amount": 500}'
        ],
        [
            'user_id' => 1,
            'type' => 'warning',
            'title' => 'Listing Expiring Soon',
            'message' => 'Your "Camera Equipment" listing will expire in 2 days',
            'action_type' => 'renew-listing',
            'action_data' => '{"rental_id": 2}'
        ]
    ];

    $stmt = $pdo->prepare("
        INSERT INTO notifications (user_id, type, title, message, action_type, action_data, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");

    foreach ($sampleNotifications as $notification) {
        $stmt->execute([
            $notification['user_id'],
            $notification['type'],
            $notification['title'],
            $notification['message'],
            $notification['action_type'],
            $notification['action_data']
        ]);
    }

    echo "✅ Added sample notifications\n";
    echo "\n✅ Notifications system is ready!\n";

} catch (Exception $e) {
    echo "❌ Error setting up notifications: " . $e->getMessage() . "\n";
}
?> 