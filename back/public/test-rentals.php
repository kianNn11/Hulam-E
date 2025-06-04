<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Database connection
    $host = '127.0.0.1';
    $dbname = 'hulame';
    $username = 'root';
    $password = '';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Fetch rentals with user data
    $stmt = $pdo->prepare("
        SELECT r.*, u.name as user_name, u.email as user_email 
        FROM rentals r 
        LEFT JOIN users u ON r.user_id = u.id 
        ORDER BY r.created_at DESC 
        LIMIT 12
    ");
    $stmt->execute();
    $rentals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the data
    foreach ($rentals as &$rental) {
        $rental['price'] = floatval($rental['price']);
        $rental['image'] = $rental['image'] ? "http://localhost:8000/storage/" . $rental['image'] : null;
        $rental['user'] = [
            'id' => $rental['user_id'],
            'name' => $rental['user_name'],
            'email' => $rental['user_email']
        ];
        unset($rental['user_name'], $rental['user_email']);
    }
    
    echo json_encode([
        'data' => $rentals,
        'meta' => [
            'total' => count($rentals),
            'message' => 'Rentals fetched successfully'
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed: ' . $e->getMessage(),
        'data' => []
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred: ' . $e->getMessage(),
        'data' => []
    ]);
}
?> 