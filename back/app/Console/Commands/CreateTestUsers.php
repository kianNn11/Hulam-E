<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class CreateTestUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'create:test-users';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test users for development';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating test users...');

        // Create an admin user
        $admin = User::updateOrCreate(
            ['email' => 'admin@hulame.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'verified' => true,
                'verification_status' => 'approved',
                'bio' => 'System Administrator',
                'contact_number' => '09123456789',
                'course_year' => 'N/A',
                'gender' => 'Other'
            ]
        );

        // Create verified users
        $verifiedUsers = [
            [
                'name' => 'John Doe',
                'email' => 'john@example.com',
                'bio' => 'Computer Science student interested in technology rentals',
                'course_year' => 'BSCS 3rd Year',
                'contact_number' => '09171234567',
                'gender' => 'Male'
            ],
            [
                'name' => 'Jane Smith',
                'email' => 'jane@example.com',
                'bio' => 'Business Administration student',
                'course_year' => 'BSBA 2nd Year',
                'contact_number' => '09987654321',
                'gender' => 'Female'
            ]
        ];

        foreach ($verifiedUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'verified' => true,
                    'verification_status' => 'approved'
                ])
            );
        }

        // Create pending verification users
        $pendingUsers = [
            [
                'name' => 'Mike Johnson',
                'email' => 'mike@example.com',
                'bio' => 'Engineering student seeking rental opportunities',
                'course_year' => 'BSCE 1st Year',
                'contact_number' => '09456789123',
                'gender' => 'Male'
            ],
            [
                'name' => 'Sarah Williams',
                'email' => 'sarah@example.com',
                'bio' => 'Arts student with creative needs',
                'course_year' => 'BFA 4th Year',
                'contact_number' => '09789123456',
                'gender' => 'Female'
            ]
        ];

        foreach ($pendingUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'verified' => false,
                    'verification_status' => 'pending',
                    'verification_submitted_at' => now(),
                    'verification_document' => 'https://via.placeholder.com/400x300?text=Certificate+of+Registration',
                    'verification_document_type' => 'Certificate of Registration'
                ])
            );
        }

        // Create unverified users
        $unverifiedUsers = [
            [
                'name' => 'David Brown',
                'email' => 'david@example.com',
                'bio' => 'New student just getting started',
                'course_year' => 'BSIT 1st Year',
                'contact_number' => '09321654987',
                'gender' => 'Male'
            ]
        ];

        foreach ($unverifiedUsers as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                array_merge($userData, [
                    'password' => Hash::make('password'),
                    'role' => 'user',
                    'verified' => false,
                    'verification_status' => 'not-verified'
                ])
            );
        }

        $this->info('Test users created successfully!');
        $this->info('Admin: admin@hulame.com / password');
        $this->info('Users: john@example.com, jane@example.com, mike@example.com, sarah@example.com, david@example.com / password');
    }
}
