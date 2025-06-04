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
            // Basic profile fields
            $table->text('bio')->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->string('course_year', 100)->nullable();
            $table->date('birthday')->nullable();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('social_link', 500)->nullable();
            $table->text('profile_picture')->nullable(); // For base64 images or URLs
            
            // Additional profile enhancements
            $table->string('location', 255)->nullable();
            $table->string('website', 500)->nullable();
            $table->json('skills')->nullable(); // Store skills as JSON array
            $table->text('education')->nullable();
            $table->decimal('rating', 2, 1)->default(0.0); // User rating out of 5
            $table->integer('total_ratings')->default(0);
            $table->boolean('is_online')->default(false);
            $table->timestamp('last_seen')->nullable();
            
            // Privacy settings
            $table->boolean('show_email')->default(false);
            $table->boolean('show_contact')->default(true);
            $table->boolean('show_social_link')->default(true);
            
            // Profile completion tracking
            $table->integer('profile_completion')->default(0); // Percentage
            
            // Add indexes for better performance
            $table->index(['verified', 'role']);
            $table->index('last_seen');
            $table->index('rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the columns added in the up method
            $table->dropColumn([
                'bio',
                'contact_number',
                'course_year',
                'birthday',
                'gender',
                'social_link',
                'profile_picture',
                'location',
                'website',
                'skills',
                'education',
                'rating',
                'total_ratings',
                'is_online',
                'last_seen',
                'show_email',
                'show_contact',
                'show_social_link',
                'profile_completion'
            ]);
        });
    }
};
