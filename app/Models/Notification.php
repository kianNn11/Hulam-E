<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean'
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Helpers
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    public static function createForUser($userId, $type, $title, $message, $data = null)
    {
        return static::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data
        ]);
    }

    public function getTypeIconAttribute()
    {
        $icons = [
            'rental_request' => 'bell',
            'rental_approved' => 'check-circle',
            'rental_rejected' => 'x-circle',
            'rental_completed' => 'trophy',
            'contact_message' => 'chat-bubble-left-right',
            'success' => 'check-circle',
            'warning' => 'exclamation-triangle',
            'info' => 'information-circle',
            'error' => 'x-circle'
        ];

        return $icons[$this->type] ?? 'bell';
    }

    public function getTypeColorAttribute()
    {
        $colors = [
            'rental_request' => 'blue',
            'rental_approved' => 'green',
            'rental_rejected' => 'red',
            'rental_completed' => 'purple',
            'contact_message' => 'indigo',
            'success' => 'green',
            'warning' => 'yellow',
            'info' => 'blue',
            'error' => 'red'
        ];

        return $colors[$this->type] ?? 'gray';
    }
} 