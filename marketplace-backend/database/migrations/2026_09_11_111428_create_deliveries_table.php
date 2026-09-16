<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();

            $table->foreignId('livreur_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->enum('statut', [
                'en_attente',
                'recuperee',
                'en_cours',
                'livree',
                'echec'
            ])->default('en_attente');

            $table->timestamp('date_affectation')->nullable();
            $table->timestamp('date_livraison')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};