<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'verified',
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
        'rating',
        'total_ratings',
        'is_online',
        'last_seen',
        'show_email',
        'show_contact',
        'show_social_link',
        'profile_completion',
        'verification_document',
        'verification_document_type',
        'verification_submitted_at',
        'verification_reviewed_at',
        'verification_status',
        'verification_notes',
        'verified_by'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'verified' => 'boolean',
            'birthday' => 'date',
            'skills' => 'array',
            'rating' => 'decimal:1',
            'is_online' => 'boolean',
            'last_seen' => 'datetime',
            'show_email' => 'boolean',
            'show_contact' => 'boolean',
            'show_social_link' => 'boolean',
            'verification_submitted_at' => 'datetime',
            'verification_reviewed_at' => 'datetime',
        ];
    }
    
    /**
     * Boot method to set defaults for user creation
     */
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
    
    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }
    
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
    
    /**
     * Calculate and update profile completion percentage
     */
    public function updateProfileCompletion()
    {
        $fields = [
            'name', 'email', 'bio', 'contact_number', 'course_year',
            'birthday', 'gender', 'social_link', 'profile_picture'
        ];
        
        $completedFields = 0;
        foreach ($fields as $field) {
            if (!empty($this->$field)) {
                $completedFields++;
            }
        }
        
        $percentage = round(($completedFields / count($fields)) * 100);
        $this->update(['profile_completion' => $percentage]);
        
        return $percentage;
    }
    
    /**
     * Get user's average rating
     */
    public function getAverageRating()
    {
        return $this->total_ratings > 0 ? $this->rating : 0;
    }
    
    /**
     * Update user's online status
     */
    public function setOnline($online = true)
    {
        $this->update([
            'is_online' => $online,
            'last_seen' => now()
        ]);
    }
    
    /**
     * Check if user profile is complete
     */
    public function hasCompleteProfile()
    {
        return $this->profile_completion >= 80;
    }
    
    /**
     * Get formatted profile picture URL
     */
    public function getProfilePictureUrl()
    {
        if (empty($this->profile_picture)) {
            return null;
        }
        
        // If it's already a full URL (starts with http), return as is
        if (str_starts_with($this->profile_picture, 'http')) {
            return $this->profile_picture;
        }
        
        // If it's a base64 image, return as is
        if (str_starts_with($this->profile_picture, 'data:image/')) {
            return $this->profile_picture;
        }
        
        // If it's a file path, convert to full URL
        return asset('storage/' . $this->profile_picture);
    }
    
    /**
     * Get profile picture attribute with proper formatting
     */
    public function getProfilePictureAttribute($value)
    {
        return $value;
    }
    
    /**
     * Append additional attributes to model array/JSON representation
     */
    protected $appends = ['profile_picture_url'];
    
    /**
     * Get the profile picture URL.
     * Converts relative paths to full URLs for API responses.
     */
    public function getProfilePictureUrlAttribute()
    {
        if (!$this->profile_picture) {
            return null;
        }
        
        // If it's already a full URL (starts with http), return as-is
        if (str_starts_with($this->profile_picture, 'http')) {
            return $this->profile_picture;
        }
        
        // If it's a storage path, convert to full URL
        if (str_starts_with($this->profile_picture, '/storage/')) {
            return config('app.url') . $this->profile_picture;
        }
        
        // If it's a base64 image, return as-is
        if (str_starts_with($this->profile_picture, 'data:image/')) {
            return $this->profile_picture;
        }
        
        // Default case - assume it's a relative path
        return config('app.url') . '/' . ltrim($this->profile_picture, '/');
    }

    /**
     * Clean up old profile picture file when user is deleted or picture is changed.
     */
    public function cleanupProfilePicture($oldPath = null)
    {
        $pathToClean = $oldPath ?: $this->profile_picture;
        
        if ($pathToClean && str_starts_with($pathToClean, '/storage/profile_pictures/')) {
            $filePath = public_path($pathToClean);
            if (file_exists($filePath)) {
                unlink($filePath);
                \Log::info('Cleaned up profile picture file:', [
                    'user_id' => $this->id,
                    'file_path' => $filePath
                ]);
            }
        }
    }

    /**
     * Override the toArray method to include profile_picture_url.
     */
    public function toArray()
    {
        $array = parent::toArray();
        $array['profile_picture_url'] = $this->profile_picture_url;
        return $array;
    }
}
