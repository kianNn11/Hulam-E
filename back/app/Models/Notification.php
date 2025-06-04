<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Notification extends Model
{
    use HasFactory;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'type',
        'notifiable_type',
        'notifiable_id',
        'data',
        'read_at'
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function notifiable()
    {
        return $this->morphTo();
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('notifiable_type', 'App\\Models\\User')
                    ->where('notifiable_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Static method to create notifications for users
    public static function createForUser($userId, $type, $title, $message, $data = [])
    {
        return static::create([
            'type' => $type,
            'notifiable_type' => 'App\\Models\\User',
            'notifiable_id' => $userId,
            'data' => array_merge([
                'title' => $title,
                'message' => $message
            ], $data)
        ]);
    }

    // Helper methods
    public function markAsRead()
    {
        $this->update(['read_at' => now()]);
    }

    public function getTitle()
    {
        return $this->data['title'] ?? 'Notification';
    }

    public function getMessage()
    {
        return $this->data['message'] ?? '';
    }

    public function getTypeIcon()
    {
        $icons = [
            'rental_request' => 'bell',
            'rental_approved' => 'check-circle',
            'rental_rejected' => 'x-circle',
            'rental_completed' => 'star',
        ];

        return $icons[$this->type] ?? 'bell';
    }

    public function getTypeColor()
    {
        $colors = [
            'rental_request' => 'blue',
            'rental_approved' => 'green',
            'rental_rejected' => 'red',
            'rental_completed' => 'yellow',
        ];

        return $colors[$this->type] ?? 'gray';
    }
}
