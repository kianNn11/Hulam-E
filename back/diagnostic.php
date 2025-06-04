<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Http\Controllers\API\UserController;

echo "=== HULAM-E Profile Picture Diagnostic ===\n\n";

// 1. Check database connection and structure
echo "1. Database Connection & Structure\n";
try {
    DB::connection()->getPdo();
    echo "✓ Database connected successfully\n";
    
    $columns = DB::select("DESCRIBE users");
    $profilePictureColumn = collect($columns)->firstWhere('Field', 'profile_picture');
    if ($profilePictureColumn) {
        echo "✓ profile_picture column exists ({$profilePictureColumn->Type})\n";
    } else {
        echo "✗ profile_picture column missing\n";
    }
} catch (Exception $e) {
    echo "✗ Database error: " . $e->getMessage() . "\n";
}

// 2. Check existing users and profile data
echo "\n2. Existing Users & Profile Data\n";
$users = User::take(3)->get(['id', 'name', 'email', 'profile_picture']);
foreach ($users as $user) {
    echo "User ID {$user->id}: {$user->name}\n";
    if ($user->profile_picture) {
        $size = strlen($user->profile_picture);
        $type = str_starts_with($user->profile_picture, 'data:image/') ? 'Base64' : 'URL/Path';
        echo "  ✓ Profile picture: {$type} ({$size} chars)\n";
    } else {
        echo "  ✗ No profile picture\n";
    }
}

// 3. Test direct model save
echo "\n3. Direct Model Save Test\n";
$testUser = User::first();
if ($testUser) {
    $originalPicture = $testUser->profile_picture;
    $testImage = 'data:image/png;base64,TEST_DATA_' . time();
    
    echo "Testing with user: {$testUser->name}\n";
    echo "Test image: {$testImage}\n";
    
    $testUser->profile_picture = $testImage;
    $saved = $testUser->save();
    
    if ($saved) {
        $fresh = User::find($testUser->id);
        if ($fresh->profile_picture === $testImage) {
            echo "✓ Direct model save successful\n";
        } else {
            echo "✗ Direct model save failed - data mismatch\n";
        }
    } else {
        echo "✗ Direct model save failed\n";
    }
    
    // Restore original
    $testUser->profile_picture = $originalPicture;
    $testUser->save();
} else {
    echo "No users found for testing\n";
}

// 4. Test controller method
echo "\n4. Controller Method Test\n";
try {
    $testUser = User::first();
    if ($testUser) {
        $request = new Request();
        $request->merge([
            'name' => $testUser->name,
            'profile_picture' => 'data:image/png;base64,CONTROLLER_TEST_' . time()
        ]);
        
        $request->setUserResolver(function () use ($testUser) {
            return $testUser;
        });
        
        $controller = new UserController();
        $response = $controller->updateProfile($request);
        
        echo "Controller response status: " . $response->getStatusCode() . "\n";
        $data = $response->getData(true);
        echo "Controller response success: " . ($data['success'] ? 'true' : 'false') . "\n";
        
        if (isset($data['user']['profile_picture'])) {
            echo "✓ Profile picture in response\n";
        } else {
            echo "✗ No profile picture in response\n";
        }
    }
} catch (Exception $e) {
    echo "Controller test error: " . $e->getMessage() . "\n";
}

echo "\n=== Diagnostic Complete ===\n"; 