<?php
// Enable CORS - must be at the very top
header('Access-Control-Allow-Origin: *'); // Allow all origins for development
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Write logs to public folder where we can see them
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Define a log file in the public directory
$logFile = __DIR__ . '/update_profile_log.txt';
file_put_contents($logFile, "\n\n----" . date('Y-m-d H:i:s') . "----\n", FILE_APPEND);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Create a log file for debugging
$logFile = __DIR__ . '/profile_update_debug.log';
file_put_contents($logFile, "\n\n-----" . date('Y-m-d H:i:s') . "-----\n");

try {
    // Get request body
    $rawInput = file_get_contents('php://input');
    file_put_contents($logFile, "Raw input: $rawInput\n", FILE_APPEND);
    
    $data = json_decode($rawInput, true);
    file_put_contents($logFile, "Decoded data: " . print_r($data, true) . "\n", FILE_APPEND);

    // Check for required fields
    if (!$data || !isset($data['id'])) {
        throw new Exception("Invalid input data or missing user ID");
    }
    
    // Database connection
    $host = 'localhost';
    $db   = 'hulame';
    $user = 'root';
    $pass = '';
    $charset = 'utf8mb4';
    
    file_put_contents($logFile, "Connecting to database $db on $host\n", FILE_APPEND);
    
    $dsn = "mysql:host=$host;dbname=$db;charset=$charset";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $user, $pass, $options);
    file_put_contents($logFile, "Connected to database\n", FILE_APPEND);

    // Extract user ID from data
    $userId = $data['id'];
    file_put_contents($logFile, "Processing update for user ID: $userId\n", FILE_APPEND);
    
    // Define allowed fields for update
    $allowedFields = [
        'name',
        'email',
        'bio',
        'contact_number',
        'course_year',
        'birthday',
        'gender',
        'social_link',
        'profile_picture',
        'location',
        'website',
        'skills',
        'education',
        'show_email',
        'show_contact',
        'show_social_link'
    ];
    
    // Build update query
    $updateFields = [];
    $params = [];
    
    // Verify the users table exists
    $stmt = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($stmt->rowCount() == 0) {
        throw new Exception("Users table does not exist");
    }
    
    // Get table columns
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $columnsMap = array_flip($columns);
    
    file_put_contents($logFile, "Table columns: " . implode(", ", $columns) . "\n", FILE_APPEND);
    
    // Build update parameters
    foreach ($allowedFields as $field) {
        if (isset($data[$field]) && isset($columnsMap[$field])) {
            // Skip empty values except for explicit null/empty string updates
            if ($data[$field] === '' && $field !== 'bio' && $field !== 'profile_picture') {
                continue;
            }
            
            $updateFields[] = "`$field` = ?";
            // Handle JSON fields
            if ($field === 'skills' && is_array($data[$field])) {
                $params[] = json_encode($data[$field]);
            } else {
                $params[] = $data[$field];
            }
            
            // Special logging for profile_picture
            if ($field === 'profile_picture') {
                $imageLength = strlen($data[$field]);
                file_put_contents($logFile, "Will update profile_picture - Length: $imageLength characters\n", FILE_APPEND);
                if ($imageLength > 0) {
                    file_put_contents($logFile, "Profile picture starts with: " . substr($data[$field], 0, 50) . "...\n", FILE_APPEND);
                }
            } else {
                file_put_contents($logFile, "Will update $field\n", FILE_APPEND);
            }
        }
    }
    
    // Always update last_seen timestamp
    $updateFields[] = "`last_seen` = NOW()";
    
    // Always return success, even if there's nothing to update
    if (count($updateFields) <= 1) { // Only last_seen was added
        file_put_contents($logFile, "No fields to update\n", FILE_APPEND);
        echo json_encode([
            'success' => true,
            'message' => 'No changes to update',
            'user' => $data
        ]);
        exit;
    }
    
    // Prepare and execute update
    $query = "UPDATE users SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $params[] = $userId;
    
    file_put_contents($logFile, "SQL: $query\n", FILE_APPEND);
    
    $stmt = $pdo->prepare($query);
    $result = $stmt->execute($params);
    
    file_put_contents($logFile, "Update result: " . ($result ? "success" : "failed") . "\n", FILE_APPEND);
    
    if (!$result) {
        throw new Exception("Failed to update user record");
    }
    
    // Calculate and update profile completion
    $profileFields = ['name', 'email', 'bio', 'contact_number', 'course_year', 'birthday', 'gender', 'social_link', 'profile_picture'];
    $stmt = $pdo->prepare("SELECT " . implode(", ", $profileFields) . " FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $profileData = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $completedFields = 0;
    foreach ($profileFields as $field) {
        if (!empty($profileData[$field])) {
            $completedFields++;
        }
    }
    
    $profileCompletion = round(($completedFields / count($profileFields)) * 100);
    
    // Update profile completion
    $stmt = $pdo->prepare("UPDATE users SET profile_completion = ? WHERE id = ?");
    $stmt->execute([$profileCompletion, $userId]);
    
    // Get updated user data
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception("Failed to retrieve updated user data");
    }
    
    // Ensure we have both snake_case and camelCase versions of fields for frontend compatibility
    $formattedUser = [
        // Original fields from database
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'bio' => isset($user['bio']) ? $user['bio'] : '',
        'course_year' => isset($user['course_year']) ? $user['course_year'] : '',
        'contact_number' => isset($user['contact_number']) ? $user['contact_number'] : '',
        'birthday' => isset($user['birthday']) ? $user['birthday'] : '',
        'gender' => isset($user['gender']) ? $user['gender'] : '',
        'social_link' => isset($user['social_link']) ? $user['social_link'] : '',
        'profile_picture' => isset($user['profile_picture']) ? $user['profile_picture'] : '',
        
        // Add camelCase aliases for frontend
        'fullName' => $user['name'],
        'courseYear' => isset($user['course_year']) ? $user['course_year'] : '',
        'contactNumber' => isset($user['contact_number']) ? $user['contact_number'] : '',
        'socialLink' => isset($user['social_link']) ? $user['social_link'] : '',
        'profileImage' => isset($user['profile_picture']) ? $user['profile_picture'] : ''
    ];
    
    // Log the formatted response
    file_put_contents($logFile, "Returning formatted user: " . print_r($formattedUser, true) . "\n", FILE_APPEND);
    
    // Return success response with both formats
    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $formattedUser
    ]);
} catch (Exception $e) {
    // Log error to file for debugging
    file_put_contents($logFile, "Final exception: " . $e->getMessage() . "\n", FILE_APPEND);
    
    // Return error response that frontend can handle
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'message' => 'Failed to update profile. Please try again.'
    ]);
}
?>