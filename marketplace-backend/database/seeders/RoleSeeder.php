<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        Role::insert([
            [
                'nom' => 'Administrateur',
            ],
            [
                'nom' => 'Vendeur',
            ],
            [
                'nom' => 'Client',
            ],
            [
                'nom' => 'Livreur',
            ],
        ]);
    }
}

