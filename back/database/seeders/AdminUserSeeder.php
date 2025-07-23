<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        $adminEmail = 'admin@hulame.com';
        
        if (!User::where('email', $adminEmail)->exists()) {
            User::create([
                'name' => 'System Administrator',
                'email' => $adminEmail,
                'password' => Hash::make('Admin123'),
                'role' => 'admin',
                'verified' => true,
                'email_verified_at' => now(),
            ]);
            
            $this->command->info('Admin user created successfully!');
            $this->command->info('Email: ' . $adminEmail);
            $this->command->info('Password: Admin123');
        } else {
            // Update password if admin already exists
            $admin = User::where('email', $adminEmail)->first();
            $admin->password = Hash::make('Admin123');
            $admin->save();
            $this->command->info('Admin user already exists. Password updated to Admin123.');
            $this->command->info('Admin user already exists.');
        }
    }
} 