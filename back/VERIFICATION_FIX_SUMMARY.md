# Verification Status Fix Summary

## Problem Description
Users who uploaded profile pictures were having their `verification_status` unexpectedly set to `'pending'`, which caused them to appear in the admin verification queue even though they hadn't submitted any verification documents.

## Root Causes Identified
1. **Database Schema Issue**: The `verification_status` column had an incorrect default value in the database schema
2. **Missing Protection**: The profile update logic didn't explicitly preserve verification fields during updates

## Fixes Applied

### 1. Database Schema Fix
- **Migration**: `2025_06_05_000000_fix_verification_status_default.php`
  - Updated users with incorrect `'pending'` status (without verification documents) to `'unverified'`
  - Fixed the database column default value

- **Migration**: `2025_06_05_000001_fix_verification_status_mysql.php`
  - Recreated the `verification_status` column with proper default value of `'unverified'`
  - Ensured all existing users without verification documents are set to `'unverified'`

### 2. User Model Enhancement
- **File**: `back/app/Models/User.php`
- **Added**: `boot()` method with a `creating` event listener
- **Purpose**: Ensures new users always get `'unverified'` verification status by default

### 3. Profile Update Protection
- **File**: `back/app/Http/Controllers/API/UserController.php`
- **Method**: `updateProfile()`
- **Changes**:
  - Added explicit preservation of verification fields during profile updates
  - Store original verification status, document, and submission date
  - Explicitly set these values in the update data
  - Added verification to ensure status wasn't accidentally changed
  - Enhanced logging for debugging

## Key Changes Made

### UserController::updateProfile()
```php
// Store original verification status to ensure it doesn't change
$originalVerificationStatus = $user->verification_status;
$originalVerificationDocument = $user->verification_document;
$originalVerificationSubmittedAt = $user->verification_submitted_at;

// ... process profile updates ...

// IMPORTANT: Preserve verification fields during profile update
$data['verification_status'] = $originalVerificationStatus;
$data['verification_document'] = $originalVerificationDocument;
$data['verification_submitted_at'] = $originalVerificationSubmittedAt;

// ... verify status wasn't changed ...
```

### User Model Boot Method
```php
protected static function boot()
{
    parent::boot();
    
    static::creating(function ($user) {
        // Ensure verification_status is set to 'unverified' for new users
        if (empty($user->verification_status)) {
            $user->verification_status = 'unverified';
        }
    });
}
```

## Verification Workflow Now

### For New Users:
1. User registers → `verification_status` = `'unverified'`
2. User uploads profile picture → `verification_status` remains `'unverified'`
3. User appears as unverified (not in admin queue)

### For Verification Process:
1. User submits verification document via `/users/verify-student` endpoint
2. `verification_status` changes to `'pending'`
3. `verification_document` and `verification_submitted_at` are set
4. User appears in admin verification queue

### For Profile Updates:
1. User updates profile (including profile picture)
2. All verification fields are explicitly preserved
3. Only profile fields are updated
4. Verification status remains unchanged

## Testing
- Created comprehensive test scripts that verify:
  - New users get `'unverified'` status by default
  - Profile picture uploads don't affect verification status
  - Users with pending verification retain their status and documents
  - Only users with proper verification documents appear in admin queue

## Files Modified
1. `back/database/migrations/2025_06_05_000000_fix_verification_status_default.php` (new)
2. `back/database/migrations/2025_06_05_000001_fix_verification_status_mysql.php` (new)
3. `back/app/Models/User.php` (enhanced)
4. `back/app/Http/Controllers/API/UserController.php` (enhanced)
5. `back/test_verification_fix.php` (new test)
6. `back/test_profile_picture_verification_fix.php` (new test)

## Result
✅ Profile picture uploads no longer affect verification status
✅ Admin verification queue only shows users who actually submitted verification documents
✅ New users default to 'unverified' status
✅ Verification workflow works as intended 