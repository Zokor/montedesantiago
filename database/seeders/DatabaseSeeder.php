<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::firstOrCreate(
        //     ['email' => 'test@example.com'],
        //     [
        //         'name' => 'Test User',
        //         'password' => Hash::make('password'),
        //         'email_verified_at' => now(),
        //     ]
        // );
        $webmaster = User::firstOrCreate(
            ['email' => 'bflgomes@gmail.com'],
            [
                'name' => 'webmaster',
                'password' => Hash::make('3v0lut10n'),
                'email_verified_at' => now(),
            ]
        );

        // Assign admin role to webmaster
        if (!$webmaster->hasRole('admin')) {
            $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
            $webmaster->assignRole($adminRole);
        }
    }
}
