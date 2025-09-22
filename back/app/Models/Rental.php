<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rental extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'price',
        'location',
        'image',
        'user_id',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Always append image_url and images_url to model output
    protected $appends = ['image_url', 'images_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function images()
    {
        return $this->hasMany(RentalImage::class);
    }

    public function getImagesUrlAttribute()
    {
        if ($this->relationLoaded('images')) {
            return $this->images->map(function($img) {
                return asset('storage/' . $img->image_path);
            });
        }
        return [];
    }

    // Scope for available rentals
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    // Scope for user's rentals
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Get formatted price
    public function getFormattedPriceAttribute()
    {
        return '₱' . number_format($this->price, 2);
    }

    // Get image URL
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    // Check if rental is available
    public function isAvailable()
    {
        return $this->status === 'available';
    }

    // Check if user owns this rental
    public function isOwnedBy($userId)
    {
        return $this->user_id == $userId;
    }

    // Get completed transactions for this rental
    public function completedTransactions()
    {
        return $this->hasMany(Transaction::class)->where('status', 'completed');
    }

    // Check if rental should be available again (no active transactions)
    public function shouldBeAvailable()
    {
        $activeTransaction = $this->hasMany(Transaction::class)
            ->whereIn('status', ['approved', 'pending'])
            ->first();
            
        return !$activeTransaction;
    }

    // Reset rental status to available if no active transactions
    public function resetStatusIfAvailable()
    {
        if ($this->status === 'rented' && $this->shouldBeAvailable()) {
            $this->update(['status' => 'available']);
            return true;
        }
        return false;
    }
}
