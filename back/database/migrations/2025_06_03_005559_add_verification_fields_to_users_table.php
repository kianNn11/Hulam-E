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
        Schema::table('users', function (Blueprint $table) {
            // Verification document fields
            $table->text('verification_document')->nullable(); // Store document path or base64
            $table->string('verification_document_type', 50)->nullable(); // ID, Student ID, etc.
            $table->timestamp('verification_submitted_at')->nullable();
            $table->timestamp('verification_reviewed_at')->nullable();
            $table->string('verification_status', 20)->default('unverified'); // unverified, pending, approved, denied
            $table->text('verification_notes')->nullable(); // Admin notes for verification
            $table->unsignedBigInteger('verified_by')->nullable(); // Admin who verified
            
            // Add indexes
            $table->index('verification_status');
            $table->index('verification_submitted_at');
            
            // Foreign key for verified_by
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn([
                'verification_document',
                'verification_document_type',
                'verification_submitted_at',
                'verification_reviewed_at',
                'verification_status',
                'verification_notes',
                'verified_by'
            ]);
        });
    }
};
