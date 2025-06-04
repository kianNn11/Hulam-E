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

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
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
    
    // Get user ID from token (simplified - for demo purposes using user_id = 1)
    // In production, you would validate the Authorization header token
    $user_id = 1; // Default user for demo
    
    // Validate required fields
    $errors = [];
    
    if (empty($_POST['title'])) {
        $errors['title'] = 'Title is required';
    } elseif (strlen(trim($_POST['title'])) < 3) {
        $errors['title'] = 'Title must be at least 3 characters';
    }
    
    if (empty($_POST['description'])) {
        $errors['description'] = 'Description is required';
    } elseif (strlen(trim($_POST['description'])) < 10) {
        $errors['description'] = 'Description must be at least 10 characters';
    }
    
    if (empty($_POST['price'])) {
        $errors['price'] = 'Price is required';
    } elseif (!is_numeric($_POST['price']) || floatval($_POST['price']) <= 0) {
        $errors['price'] = 'Price must be a valid number greater than 0';
    }
    
    if (empty($_POST['location'])) {
        $errors['location'] = 'Location is required';
    } elseif (strlen(trim($_POST['location'])) < 2) {
        $errors['location'] = 'Location must be at least 2 characters';
    }
    
    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode([
            'message' => 'Validation failed',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Handle image upload
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!in_array($_FILES['image']['type'], $allowedTypes)) {
            http_response_code(422);
            echo json_encode([
                'message' => 'Validation failed',
                'errors' => ['image' => 'File must be an image (JPEG, PNG, or GIF)']
            ]);
            exit;
        }
        
        if ($_FILES['image']['size'] > $maxSize) {
            http_response_code(422);
            echo json_encode([
                'message' => 'Validation failed',
                'errors' => ['image' => 'Image size cannot exceed 5MB']
            ]);
            exit;
        }
        
        // Create storage directory if it doesn't exist
        $storageDir = '../storage/app/public/rentals';
        if (!is_dir($storageDir)) {
            mkdir($storageDir, 0755, true);
        }
        
        // Generate unique filename
        $extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = time() . '_' . uniqid() . '.' . $extension;
        $fullPath = $storageDir . '/' . $filename;
        
        if (move_uploaded_file($_FILES['image']['tmp_name'], $fullPath)) {
            $imagePath = 'rentals/' . $filename;
        }
    }
    
    // Insert rental into database
    $stmt = $pdo->prepare("
        INSERT INTO rentals (title, description, price, location, image, user_id, status, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, 'available', NOW(), NOW())
    ");
    
    $stmt->execute([
        trim($_POST['title']),
        trim($_POST['description']),
        floatval($_POST['price']),
        trim($_POST['location']),
        $imagePath,
        $user_id
    ]);
    
    $rentalId = $pdo->lastInsertId();
    
    // Fetch the created rental with user data
    $stmt = $pdo->prepare("
        SELECT r.*, u.name as user_name, u.email as user_email 
        FROM rentals r 
        LEFT JOIN users u ON r.user_id = u.id 
        WHERE r.id = ?
    ");
    $stmt->execute([$rentalId]);
    $rental = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($rental) {
        // Format the data
        $rental['price'] = floatval($rental['price']);
        $rental['image'] = $rental['image'] ? "http://localhost:8000/storage/" . $rental['image'] : null;
        $rental['user'] = [
            'id' => $rental['user_id'],
            'name' => $rental['user_name'],
            'email' => $rental['user_email']
        ];
        unset($rental['user_name'], $rental['user_email']);
    }
    
    http_response_code(201);
    echo json_encode([
        'data' => $rental,
        'message' => 'Rental posted successfully! Your item is now available for rent.'
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'An error occurred: ' . $e->getMessage()
    ]);
}
?> 