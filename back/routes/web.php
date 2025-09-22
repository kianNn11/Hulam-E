<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

// Debug route to inspect first rental's image fields
use App\Models\Rental;

Route::get('/debug-first-rental', function() {
    return Rental::with('images')->first();
});
