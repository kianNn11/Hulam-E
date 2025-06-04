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
        // First, update existing users with empty or null verification_status
        DB::table('users')
            ->where(function($query) {
                $query->whereNull('verification_status')
                      ->orWhere('verification_status', '')
                      ->orWhere('verification_status', 'pending');
            })
            ->where(function($query) {
                $query->whereNull('verification_document')
                      ->orWhereNull('verification_submitted_at');
            })
            ->update(['verification_status' => 'unverified']);

        // Drop and recreate the column with proper default
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('verification_status');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('verification_status', 20)->default('unverified')->after('verification_reviewed_at');
            $table->index('verification_status');
        });
        
        // Ensure all existing users have the unverified status if they don't have documents
        DB::table('users')
            ->where(function($query) {
                $query->whereNull('verification_status')
                      ->orWhere('verification_status', '');
            })
            ->update(['verification_status' => 'unverified']);
        
        \Log::info('Fixed verification_status column with proper default value');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('verification_status');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->string('verification_status', 20)->default('pending')->after('verification_reviewed_at');
            $table->index('verification_status');
        });
    }
}; 