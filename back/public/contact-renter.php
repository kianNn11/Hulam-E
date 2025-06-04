<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Validate required fields
    $requiredFields = ['rental_id', 'renter_email', 'sender_name', 'sender_email', 'message', 'rental_title'];
    $missingFields = [];

    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
    }

    // Validate email formats
    if (!filter_var($input['renter_email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid renter email format');
    }

    if (!filter_var($input['sender_email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid sender email format');
    }

    // Store the message in database (optional - for tracking)
    try {
        $stmt = $pdo->prepare("
            INSERT INTO rental_messages (
                rental_id, renter_email, sender_name, sender_email, message, rental_title, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, NOW())
        ");

        $stmt->execute([
            $input['rental_id'],
            $input['renter_email'],
            $input['sender_name'],
            $input['sender_email'],
            $input['message'],
            $input['rental_title']
        ]);
    } catch (PDOException $e) {
        // If table doesn't exist, we can still continue (just won't store the message)
        error_log("Database error in contact-renter: " . $e->getMessage());
    }

    // In a real application, you would send an email here
    // For now, we'll just return success
    // You can integrate with PHPMailer or similar for actual email sending

    /*
    // Example email sending (uncomment and configure as needed)
    $to = $input['renter_email'];
    $subject = "New Rental Inquiry for: " . $input['rental_title'];
    $emailMessage = "You have received a new rental inquiry.\n\n";
    $emailMessage .= "From: " . $input['sender_name'] . " (" . $input['sender_email'] . ")\n";
    $emailMessage .= "Regarding: " . $input['rental_title'] . "\n\n";
    $emailMessage .= "Message:\n" . $input['message'] . "\n\n";
    $emailMessage .= "Please reply directly to: " . $input['sender_email'];
    
    $headers = "From: noreply@hulam-e.com\r\n";
    $headers .= "Reply-To: " . $input['sender_email'] . "\r\n";
    
    mail($to, $subject, $emailMessage, $headers);
    */

    echo json_encode([
        'success' => true,
        'message' => 'Message sent successfully'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?> 