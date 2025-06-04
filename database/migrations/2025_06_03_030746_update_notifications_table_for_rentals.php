<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            // Update type enum to include rental-related types
            $table->dropColumn('type');
        });
        
        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type', ['rental_request', 'rental_approved', 'rental_rejected', 'rental_completed', 'contact_message', 'success', 'warning', 'info', 'error'])
                  ->default('info')
                  ->after('user_id');
            
            // Add data column if it doesn't exist (rename action_data)
            if (Schema::hasColumn('notifications', 'action_data')) {
                $table->renameColumn('action_data', 'data');
            } else {
                $table->json('data')->nullable()->after('message');
            }
            
            // Add updated_at if it doesn't exist
            if (!Schema::hasColumn('notifications', 'updated_at')) {
                $table->timestamp('updated_at')->nullable()->after('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropColumn('type');
        });
        
        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('type', ['success', 'warning', 'info', 'error'])->default('info')->after('user_id');
            
            if (Schema::hasColumn('notifications', 'data')) {
                $table->renameColumn('data', 'action_data');
            }
            
            if (Schema::hasColumn('notifications', 'updated_at')) {
                $table->dropColumn('updated_at');
            }
        });
    }
}; 