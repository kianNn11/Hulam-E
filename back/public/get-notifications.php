<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

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

    // Get user ID from query parameter or session
    $userId = $_GET['user_id'] ?? null;
    
    if (!$userId) {
        throw new Exception('User ID is required');
    }

    // Fetch notifications for the user
    $stmt = $pdo->prepare("
        SELECT 
            id,
            type,
            title,
            message,
            action_type,
            action_data,
            is_read,
            created_at,
            CASE 
                WHEN created_at >= NOW() - INTERVAL 1 MINUTE THEN 'Just now'
                WHEN created_at >= NOW() - INTERVAL 1 HOUR THEN CONCAT(TIMESTAMPDIFF(MINUTE, created_at, NOW()), ' minutes ago')
                WHEN created_at >= NOW() - INTERVAL 1 DAY THEN CONCAT(TIMESTAMPDIFF(HOUR, created_at, NOW()), ' hours ago')
                ELSE CONCAT(TIMESTAMPDIFF(DAY, created_at, NOW()), ' days ago')
            END as time_ago
        FROM notifications 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 20
    ");

    $stmt->execute([$userId]);
    $notifications = $stmt->fetchAll();

    // Format notifications for frontend
    $formattedNotifications = array_map(function($notification) {
        return [
            'id' => $notification['id'],
            'type' => $notification['type'],
            'title' => $notification['title'],
            'message' => $notification['message'],
            'time' => $notification['time_ago'],
            'isRead' => (bool)$notification['is_read'],
            'action' => $notification['action_type'],
            'actionData' => $notification['action_data'] ? json_decode($notification['action_data'], true) : null
        ];
    }, $notifications);

    echo json_encode([
        'success' => true,
        'notifications' => $formattedNotifications,
        'unreadCount' => count(array_filter($formattedNotifications, function($n) { return !$n['isRead']; }))
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?> 