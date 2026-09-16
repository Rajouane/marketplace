<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            $table->foreignId('shop_id')
                ->constrained('shops')
                ->cascadeOnDelete();

            $table->foreignId('category_id')
                ->constrained('categories')
                ->restrictOnDelete();

            $table->string('nom');
            $table->text('description')->nullable();

            $table->decimal('prix', 10, 2);
            $table->decimal('prix_promotionnel', 10, 2)->nullable();

            $table->unsignedInteger('stock')->default(0);
            $table->unsignedInteger('seuil_alerte')->default(5);

            $table->string('marque')->nullable();

            $table->enum('statut', [
                'brouillon',
                'en_attente',
                'publie',
                'rejete'
            ])->default('brouillon');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};