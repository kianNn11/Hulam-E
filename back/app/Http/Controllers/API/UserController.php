<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

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

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$user->id,
            'password' => 'sometimes|string|min:8|confirmed',
            'bio' => 'sometimes|string|max:1000',
            'contact_number' => 'sometimes|string|max:20',
            'course_year' => 'sometimes|string|max:100',
            'birthday' => 'sometimes|date',
            'gender' => 'sometimes|in:Male,Female,Other',
            'social_link' => 'sometimes|url|max:255',
            'location' => 'sometimes|string|max:255',
            'website' => 'sometimes|url|max:255',
            'skills' => 'sometimes|array',
            'education' => 'sometimes|string|max:500',
            'profile_picture' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only([
            'name', 'email', 'bio', 'contact_number', 'course_year', 
            'birthday', 'gender', 'social_link', 'location', 'website', 
            'skills', 'education'
        ]);
        
        // Handle profile picture separately to avoid MySQL packet size issues
        if ($request->filled('profile_picture')) {
            $profilePicture = $request->input('profile_picture');
            
            // Check if it's a base64 image and if it's too large
            if (strpos($profilePicture, 'data:image/') === 0) {
                // For now, skip saving very large images to avoid MySQL errors
                // In production, you should save to file storage and store only the path
                $imageSize = strlen($profilePicture);
                if ($imageSize > 1000000) { // 1MB limit
                    // Skip the image update for now
                    error_log("Profile picture too large: {$imageSize} bytes");
                } else {
                    $data['profile_picture'] = $profilePicture;
                }
            } else {
                // It's likely a URL or file path
                $data['profile_picture'] = $profilePicture;
            }
        }
        
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);
        $user->updateProfileCompletion();

        return response()->json([
            'success' => true,
            'user' => $user,
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
