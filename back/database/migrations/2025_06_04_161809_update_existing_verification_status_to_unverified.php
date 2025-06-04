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
        // Update users who have 'pending' verification status but haven't submitted documents
        // These should be 'unverified' instead
        DB::table('users')
            ->where('verification_status', 'pending')
            ->whereNull('verification_document')
            ->whereNull('verification_submitted_at')
            ->update(['verification_status' => 'unverified']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to pending for users who don't have documents
        DB::table('users')
            ->where('verification_status', 'unverified')
            ->whereNull('verification_document')
            ->whereNull('verification_submitted_at')
            ->update(['verification_status' => 'pending']);
    }
};
