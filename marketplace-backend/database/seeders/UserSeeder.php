<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('nom', 'Administrateur')->first();
        $vendeurRole = Role::where('nom', 'Vendeur')->first();
        $clientRole = Role::where('nom', 'Client')->first();
        $livreurRole = Role::where('nom', 'Livreur')->first();

        User::create([
            'nom' => 'Administrateur',
            'email' => 'admin@marketplace.test',
            'telephone' => '0600000001',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
            'statut' => 'actif',
        ]);

        User::create([
            'nom' => 'Vendeur Test',
            'email' => 'vendeur@marketplace.test',
            'telephone' => '0600000002',
            'password' => Hash::make('password'),
            'role_id' => $vendeurRole->id,
            'statut' => 'actif',
        ]);

        User::create([
            'nom' => 'Client Test',
            'email' => 'client@marketplace.test',
            'telephone' => '0600000003',
            'password' => Hash::make('password'),
            'role_id' => $clientRole->id,
            'statut' => 'actif',
        ]);

        User::create([
            'nom' => 'Livreur Test',
            'email' => 'livreur@marketplace.test',
            'telephone' => '0600000004',
            'password' => Hash::make('password'),
            'role_id' => $livreurRole->id,
            'statut' => 'actif',
        ]);
    }
}

