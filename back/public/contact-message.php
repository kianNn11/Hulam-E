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
    $requiredFields = ['name', 'email', 'subject', 'message'];
    $missingFields = [];

    foreach ($requiredFields as $field) {
        if (empty($input[$field])) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        throw new Exception('Missing required fields: ' . implode(', ', $missingFields));
    }

    // Validate email format
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Invalid email format');
    }

    // Store the message in database
    $stmt = $pdo->prepare("
        INSERT INTO contact_messages (
            name, email, subject, message, created_at
        ) VALUES (?, ?, ?, ?, NOW())
    ");

    $stmt->execute([
        $input['name'],
        $input['email'],
        $input['subject'],
        $input['message']
    ]);

    // In a real application, you would send an email notification here
    // For now, we'll just return success

    /*
    // Example email sending (uncomment and configure as needed)
    $to = "support@hulam-e.com";
    $subject = "New Contact Form Submission: " . $input['subject'];
    $emailMessage = "You have received a new contact form submission.\n\n";
    $emailMessage .= "Name: " . $input['name'] . "\n";
    $emailMessage .= "Email: " . $input['email'] . "\n";
    $emailMessage .= "Subject: " . $input['subject'] . "\n\n";
    $emailMessage .= "Message:\n" . $input['message'];
    
    $headers = "From: noreply@hulam-e.com\r\n";
    $headers .= "Reply-To: " . $input['email'] . "\r\n";
    
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