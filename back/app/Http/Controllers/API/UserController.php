<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Exception;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(['users' => User::all()]);
    }

    public function getCurrentUser(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'error' => 'Authentication required'
            ], 401);
        }
        
        return response()->json(['user' => $user]);
    }

    public function show(User $user)
    {
        return response()->json(['user' => $user]);
    }

    public function update(Request $request, User $user)
    {
        $authUser = $request->user();
        
        // Check if user is authenticated
        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'error' => 'Authentication required'
            ], 401);
        }
        
        // Check if the authenticated user is the requested user or an admin
        if ($authUser->id !== $user->id && $authUser->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['name', 'email']);
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['user' => $user, 'message' => 'Profile updated successfully']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        // Check if user is authenticated
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'error' => 'Authentication required'
            ], 401);
        }

        // Store original verification status to ensure it doesn't change during profile update
        $originalVerificationStatus = $user->verification_status;
        $originalVerificationDocument = $user->verification_document;
        $originalVerificationSubmittedAt = $user->verification_submitted_at;

        // Add debugging
        $inputData = $request->all();
        \Log::info('Profile update request received:', [
            'user_id' => $user->id,
            'input_data' => array_diff_key($inputData, ['profile_picture' => '']), // Log everything except image for size
            'has_profile_picture' => $request->has('profile_picture'),
            'profile_picture_filled' => $request->filled('profile_picture'),
            'profile_picture_size' => $request->filled('profile_picture') ? strlen($request->input('profile_picture')) : 0,
            'original_verification_status' => $originalVerificationStatus
        ]);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:8|confirmed',
            'bio' => 'sometimes|nullable|string|max:1000',
            'contact_number' => 'sometimes|nullable|string|max:20',
            'course_year' => 'sometimes|nullable|string|max:100',
            'birthday' => 'sometimes|nullable|date',
            'gender' => 'sometimes|nullable|in:Male,Female,Other',
            'social_link' => 'sometimes|nullable|url|max:255',
            'location' => 'sometimes|nullable|string|max:255',
            'website' => 'sometimes|nullable|url|max:255',
            'skills' => 'sometimes|nullable|array',
            'education' => 'sometimes|nullable|string|max:500',
            'profile_picture' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            \Log::warning('Profile update validation failed:', [
                'user_id' => $user->id,
                'errors' => $validator->errors()
            ]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Filter and prepare data for update - EXPLICITLY EXCLUDE verification fields
        $data = $request->only([
            'name', 'email', 'bio', 'contact_number', 'course_year', 
            'birthday', 'gender', 'social_link', 'location', 'website', 
            'skills', 'education'
        ]);

        // Convert empty strings to null for nullable fields
        $nullableFields = ['bio', 'contact_number', 'course_year', 'birthday', 'gender', 'social_link', 'location', 'website', 'education'];
        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }
        
        // Handle profile picture separately to avoid MySQL packet size issues
        if ($request->filled('profile_picture')) {
            $profilePicture = $request->input('profile_picture');
            
            \Log::info('Processing profile picture:', [
                'user_id' => $user->id,
                'image_size' => strlen($profilePicture),
                'is_base64' => strpos($profilePicture, 'data:image/') === 0
            ]);
            
            // Check if it's a base64 image
            if (strpos($profilePicture, 'data:image/') === 0) {
                try {
                    // Extract image data and type
                    $imageData = substr($profilePicture, strpos($profilePicture, ',') + 1);
                    $decodedImage = base64_decode($imageData);
                    
                    // Get image type
                    $imageInfo = getimagesizefromstring($decodedImage);
                    if (!$imageInfo) {
                        throw new Exception('Invalid image data');
                    }
                    
                    $mimeType = $imageInfo['mime'];
                    $extension = '';
                    switch ($mimeType) {
                        case 'image/jpeg':
                            $extension = 'jpg';
                            break;
                        case 'image/png':
                            $extension = 'png';
                            break;
                        case 'image/gif':
                            $extension = 'gif';
                            break;
                        case 'image/webp':
                            $extension = 'webp';
                            break;
                        default:
                            throw new Exception('Unsupported image type: ' . $mimeType);
                    }
                    
                    // Create filename
                    $filename = 'profile_' . $user->id . '_' . time() . '.' . $extension;
                    
                    // Ensure directory exists
                    $uploadDir = public_path('storage/profile_pictures');
                    if (!file_exists($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    // Save file
                    $filePath = $uploadDir . '/' . $filename;
                    if (file_put_contents($filePath, $decodedImage) === false) {
                        throw new Exception('Failed to save image file');
                    }
                    
                    // Delete old profile picture if exists
                    if ($user->profile_picture && str_starts_with($user->profile_picture, '/storage/profile_pictures/')) {
                        $oldFile = public_path($user->profile_picture);
                        if (file_exists($oldFile)) {
                            unlink($oldFile);
                        }
                    }
                    
                    // Store relative path in database
                    $data['profile_picture'] = '/storage/profile_pictures/' . $filename;
                    
                    \Log::info('Profile picture saved as file:', [
                        'user_id' => $user->id,
                        'filename' => $filename,
                        'path' => $data['profile_picture'],
                        'size' => strlen($decodedImage)
                    ]);
                    
                } catch (Exception $e) {
                    \Log::error('Profile picture processing failed:', [
                        'user_id' => $user->id,
                        'error' => $e->getMessage()
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to process profile picture: ' . $e->getMessage(),
                        'error' => 'Image processing error'
                    ], 422);
                }
            } else {
                // It's likely a URL or file path
                $data['profile_picture'] = $profilePicture;
                \Log::info('Profile picture URL/path saved:', [
                    'user_id' => $user->id,
                    'profile_picture' => $profilePicture
                ]);
            }
        }
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        \Log::info('Updating user profile:', [
            'user_id' => $user->id,
            'data_keys' => array_keys($data),
            'has_profile_picture_in_data' => isset($data['profile_picture'])
        ]);

        // IMPORTANT: Preserve verification fields during profile update
        // This ensures that profile picture uploads don't affect verification status
        $data['verification_status'] = $originalVerificationStatus;
        $data['verification_document'] = $originalVerificationDocument;
        $data['verification_submitted_at'] = $originalVerificationSubmittedAt;

        $user->update($data);
        $user->updateProfileCompletion();

        // Refresh user data from database
        $updatedUser = $user->fresh();
        
        // Verify that verification status wasn't changed
        if ($updatedUser->verification_status !== $originalVerificationStatus) {
            \Log::error('Verification status was unexpectedly changed during profile update:', [
                'user_id' => $user->id,
                'original_status' => $originalVerificationStatus,
                'new_status' => $updatedUser->verification_status
            ]);
            
            // Fix it immediately
            $updatedUser->update(['verification_status' => $originalVerificationStatus]);
            $updatedUser = $updatedUser->fresh();
        }
        
        \Log::info('Profile updated successfully:', [
            'user_id' => $user->id,
            'updated_fields' => array_keys($data),
            'final_profile_picture_size' => $updatedUser->profile_picture ? strlen($updatedUser->profile_picture) : 0,
            'verification_status_preserved' => $updatedUser->verification_status === $originalVerificationStatus
        ]);

        return response()->json([
            'success' => true,
            'user' => $updatedUser,
            'message' => 'Profile updated successfully'
        ]);
    }

    public function verifyUser(Request $request, User $user)
    {
        $authUser = $request->user();
        
        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'error' => 'Authentication required'
            ], 401);
        }
        
        if ($authUser->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->verified = true;
        $user->save();

        return response()->json(['user' => $user, 'message' => 'User verified successfully']);
    }

    public function getUserRentals(Request $request, $userId = null)
    {
        $authUser = $request->user();
        
        if (!$authUser) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
                'error' => 'Authentication required'
            ], 401);
        }

        // If no userId provided, use the authenticated user's ID
        $targetUserId = $userId ?: $authUser->id;
        
        // Check if user is trying to access their own rentals or is an admin
        if ($authUser->id != $targetUserId && $authUser->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access',
                'error' => 'You can only view your own rentals'
            ], 403);
        }

        try {
            $rentals = \App\Models\Rental::where('user_id', $targetUserId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $rentals,
                'message' => 'Rentals fetched successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch rentals',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
