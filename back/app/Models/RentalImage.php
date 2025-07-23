<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentalImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id',
        'image_path',
    ];

    public function rental()
    {
        return $this->belongsTo(Rental::class);
    }
} 