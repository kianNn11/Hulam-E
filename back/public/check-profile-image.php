<?php
header('Content-Type: text/plain');
echo "Profile Image Database Check\n";
echo "============================\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=hulame', 'root', '');
    
    // Check table structure
    $stmt = $pdo->query("DESCRIBE users");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        if ($col['Field'] === 'profile_picture') {
            echo "profile_picture column found:\n";
            echo "  Type: " . $col['Type'] . "\n";
            echo "  Null: " . $col['Null'] . "\n";
            echo "  Default: " . $col['Default'] . "\n\n";
        }
    }
    
    // Check actual data
    $stmt = $pdo->query("SELECT id, name, profile_picture FROM users WHERE profile_picture IS NOT NULL LIMIT 3");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Users with profile pictures:\n";
    foreach ($users as $user) {
        $imageLength = strlen($user['profile_picture']);
        echo "  User: " . $user['name'] . " (ID: " . $user['id'] . ")\n";
        echo "  Image data length: " . $imageLength . " characters\n";
        echo "  Starts with: " . substr($user['profile_picture'], 0, 50) . "...\n\n";
    }
    
    if (empty($users)) {
        echo "No users found with profile pictures.\n";
        
        // Check all users
        $stmt = $pdo->query("SELECT id, name, LENGTH(profile_picture) as img_len FROM users");
        $allUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "\nAll users profile picture status:\n";
        foreach ($allUsers as $user) {
            echo "  " . $user['name'] . " (ID: " . $user['id'] . ") - Length: " . $user['img_len'] . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?> 