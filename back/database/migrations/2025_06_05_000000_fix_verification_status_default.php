<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update users who have 'pending' status but haven't actually submitted documents
        DB::table('users')
            ->where('verification_status', 'pending')
            ->where(function($query) {
                $query->whereNull('verification_document')
                      ->orWhereNull('verification_submitted_at');
            })
            ->update(['verification_status' => 'unverified']);

        // Update the default value for verification_status column to 'unverified'
        DB::statement("ALTER TABLE users ALTER COLUMN verification_status SET DEFAULT 'unverified'");
        
        // Log the fix
        \Log::info('Fixed verification_status default value and cleaned up incorrect pending statuses');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert the default back to 'pending' (though this was the incorrect original state)
        DB::statement("ALTER TABLE users ALTER COLUMN verification_status SET DEFAULT 'pending'");
    }
}; 