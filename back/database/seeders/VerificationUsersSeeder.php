<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class VerificationUsersSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create users with pending verification
        $users = [
            [
                'name' => 'Jane Doe',
                'email' => 'jane.doe@student.edu',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'verified' => false,
                'verification_status' => 'pending',
                'verification_document_type' => 'Student ID',
                'verification_document' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                'verification_submitted_at' => now()->subDays(2),
                'contact_number' => '+63 912 345 6789',
                'course_year' => '3rd Year Computer Science',
                'bio' => 'Computer Science student passionate about technology and innovation.',
            ],
            [
                'name' => 'John Smith',
                'email' => 'john.smith@student.edu',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'verified' => false,
                'verification_status' => 'pending',
                'verification_document_type' => 'Government ID',
                'verification_document' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                'verification_submitted_at' => now()->subDays(1),
                'contact_number' => '+63 917 123 4567',
                'course_year' => '2nd Year Engineering',
                'bio' => 'Engineering student with interests in sustainable technology.',
            ],
            [
                'name' => 'Maria Garcia',
                'email' => 'maria.garcia@student.edu',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'verified' => false,
                'verification_status' => 'pending',
                'verification_document_type' => 'Student ID',
                'verification_document' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                'verification_submitted_at' => now()->subHours(6),
                'contact_number' => '+63 905 987 6543',
                'course_year' => '4th Year Business Administration',
                'bio' => 'Business student with entrepreneurial aspirations.',
            ],
            [
                'name' => 'Alex Johnson',
                'email' => 'alex.johnson@student.edu',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'verified' => false,
                'verification_status' => 'pending',
                'verification_document_type' => 'Driver\'s License',
                'verification_document' => 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
                'verification_submitted_at' => now()->subHours(12),
                'contact_number' => '+63 920 456 7890',
                'course_year' => '1st Year Arts',
                'bio' => 'Arts student exploring creative expression and design.',
            ]
        ];

        foreach ($users as $userData) {
            User::create($userData);
        }
    }
}
