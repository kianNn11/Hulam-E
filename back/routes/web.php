<?php

use Illuminate\Support\Facades\Route;
use App\Models\Rental;

if (app()->environment('local')) {
Route::get('/', function () {
    return view('welcome');
});

// Debug route to inspect first rental's image fields
Route::get('/debug-first-rental', function() {
    return Rental::with('images')->first();
});
}
