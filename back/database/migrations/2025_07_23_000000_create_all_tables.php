<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // Cache table
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key', 255)->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        // Cache locks table
        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key', 255)->primary();
            $table->string('owner', 255);
            $table->integer('expiration');
        });

        // Contact messages table
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('rental_id');
            $table->string('rental_title', 255);
            $table->string('owner_email', 255);
            $table->string('sender_name', 255);
            $table->string('sender_email', 255);
            $table->text('message');
            $table->timestamp('sent_at')->useCurrent()->useCurrentOnUpdate();
            $table->timestamps();
            $table->index(['rental_id', 'sent_at']);
            $table->index('owner_email');
            $table->index('sender_email');
        });

        // Failed jobs table
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('uuid', 255)->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });

        // Jobs table
        Schema::create('jobs', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('queue', 255);
            $table->longText('payload');
            $table->unsignedTinyInteger('attempts');
            $table->unsignedInteger('reserved_at')->nullable();
            $table->unsignedInteger('available_at');
            $table->unsignedInteger('created_at');
            $table->index('queue');
        });

        // Job batches table
        Schema::create('job_batches', function (Blueprint $table) {
            $table->string('id', 255)->primary();
            $table->string('name', 255);
            $table->integer('total_jobs');
            $table->integer('pending_jobs');
            $table->integer('failed_jobs');
            $table->longText('failed_job_ids');
            $table->mediumText('options')->nullable();
            $table->integer('cancelled_at')->nullable();
            $table->integer('created_at');
            $table->integer('finished_at')->nullable();
        });

        // Migrations table
        Schema::create('migrations', function (Blueprint $table) {
            $table->increments('id');
            $table->string('migration', 255);
            $table->integer('batch');
        });

        // Notifications table
        Schema::create('notifications', function (Blueprint $table) {
            $table->char('id', 36)->primary();
            $table->string('type', 255);
            $table->string('notifiable_type', 255);
            $table->unsignedBigInteger('notifiable_id');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['notifiable_type', 'notifiable_id']);
        });

        // Password reset tokens table
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email', 255)->primary();
            $table->string('token', 255);
            $table->timestamp('created_at')->nullable();
        });

        // Personal access tokens table
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('tokenable_type', 255);
            $table->unsignedBigInteger('tokenable_id');
            $table->string('name', 255);
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->index(['tokenable_type', 'tokenable_id']);
        });

        // Users table
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name', 255);
            $table->string('email', 255)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255);
            $table->string('role', 255)->default('user');
            $table->boolean('verified')->default(0);
            $table->string('remember_token', 100)->nullable();
            $table->timestamps();
            $table->text('bio')->nullable();
            $table->string('contact_number', 20)->nullable();
            $table->string('course_year', 100)->nullable();
            $table->date('birthday')->nullable();
            $table->string('gender', 255)->nullable();
            $table->string('social_link', 500)->nullable();
            $table->text('profile_picture')->nullable();
            $table->string('location', 255)->nullable();
            $table->string('website', 500)->nullable();
            $table->json('skills')->nullable();
            $table->text('education')->nullable();
            $table->decimal('rating', 2, 1)->default(0.0);
            $table->integer('total_ratings')->default(0);
            $table->boolean('is_online')->default(0);
            $table->timestamp('last_seen')->nullable();
            $table->boolean('show_email')->default(0);
            $table->boolean('show_contact')->default(1);
            $table->boolean('show_social_link')->default(1);
            $table->integer('profile_completion')->default(0);
            $table->text('verification_document')->nullable();
            $table->string('verification_document_type', 50)->nullable();
            $table->timestamp('verification_submitted_at')->nullable();
            $table->timestamp('verification_reviewed_at')->nullable();
            $table->string('verification_status', 20)->default('unverified');
            $table->text('verification_notes')->nullable();
            $table->unsignedBigInteger('verified_by')->nullable();
            $table->index(['verified', 'role'], 'idx_verified_role');
            $table->index('last_seen', 'idx_last_seen');
            $table->index('rating', 'idx_rating');
            $table->index('verification_submitted_at', 'users_verification_submitted_at_index');
            $table->index('verification_status', 'users_verification_status_index');
            $table->foreign('verified_by')->references('id')->on('users')->onDelete('set null');
        });

        // Rentals table
        Schema::create('rentals', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('title', 255);
            $table->text('description');
            $table->decimal('price', 10, 2);
            $table->string('location', 255);
            $table->text('image')->nullable();
            $table->enum('status', ['available', 'rented', 'unavailable'])->default('available');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Rental images table
        Schema::create('rental_images', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('rental_id');
            $table->string('image_path', 255);
            $table->timestamps();
            $table->index('rental_id');
            $table->foreign('rental_id')->references('id')->on('rentals')->onDelete('cascade');
        });

        // Rental messages table
        Schema::create('rental_messages', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('rental_id');
            $table->string('renter_email', 255);
            $table->string('sender_name', 255);
            $table->string('sender_email', 255);
            $table->text('message');
            $table->string('rental_title', 500);
            $table->timestamp('created_at')->useCurrent();
            $table->index('rental_id', 'idx_rental_id');
            $table->index('renter_email', 'idx_renter_email');
        });

        // Sessions table
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id', 255)->primary();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity');
            $table->index('user_id');
            $table->index('last_activity');
        });

        // Transactions table
        Schema::create('transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('rental_id')->nullable();
            $table->unsignedBigInteger('renter_id')->nullable();
            $table->unsignedBigInteger('owner_id')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'completed', 'cancelled'])->default('pending');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->decimal('total_amount', 15, 2);
            $table->text('renter_message')->nullable();
            $table->text('owner_response')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['renter_id', 'status'], 'transactions_renter_id_status_index');
            $table->index(['owner_id', 'status'], 'transactions_owner_id_status_index');
            $table->foreign('rental_id')->references('id')->on('rentals')->onDelete('cascade');
            $table->foreign('renter_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
        });

        // Foreign keys for contact_messages
        Schema::table('contact_messages', function (Blueprint $table) {
            $table->foreign('rental_id')->references('id')->on('rentals')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('rental_messages');
        Schema::dropIfExists('rental_images');
        Schema::dropIfExists('rentals');
        Schema::dropIfExists('users');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('migrations');
        Schema::dropIfExists('job_batches');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('failed_jobs');
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
    }
}; 