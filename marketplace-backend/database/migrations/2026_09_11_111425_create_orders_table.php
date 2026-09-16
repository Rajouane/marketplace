<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->string('numero')->unique();

            $table->foreignId('client_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('address_id')
                ->constrained('addresses')
                ->restrictOnDelete();

            $table->decimal('sous_total', 10, 2);
            $table->decimal('frais_livraison', 10, 2)->default(0);
            $table->decimal('reduction', 10, 2)->default(0);
            $table->decimal('total', 10, 2);

            $table->enum('statut', [
                'en_attente',
                'confirmee',
                'preparee',
                'expediee',
                'livree',
                'annulee'
            ])->default('en_attente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};