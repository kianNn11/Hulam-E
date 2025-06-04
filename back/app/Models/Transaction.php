<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id',
        'renter_id',
        'owner_id',
        'status',
        'start_date',
        'end_date',
        'total_amount',
        'renter_message',
        'owner_response',
        'approved_at',
        'rejected_at',
        'completed_at'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'total_amount' => 'decimal:2',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    // Relationships
    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }

    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where(function ($q) use ($userId) {
            $q->where('renter_id', $userId)
              ->orWhere('owner_id', $userId);
        });
    }

    // Helpers
    public function getTotalDaysAttribute()
    {
        return $this->start_date->diffInDays($this->end_date) + 1;
    }

    public function getStatusBadgeAttribute()
    {
        $badges = [
            'pending' => ['class' => 'warning', 'text' => 'Pending'],
            'approved' => ['class' => 'success', 'text' => 'Approved'],
            'rejected' => ['class' => 'danger', 'text' => 'Rejected'],
            'completed' => ['class' => 'info', 'text' => 'Completed'],
            'cancelled' => ['class' => 'secondary', 'text' => 'Cancelled']
        ];

        return $badges[$this->status] ?? ['class' => 'secondary', 'text' => 'Unknown'];
    }
}
