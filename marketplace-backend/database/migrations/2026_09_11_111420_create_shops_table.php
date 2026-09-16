<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendeur_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('nom');
            $table->text('description')->nullable();
            $table->enum('statut', ['en_attente', 'active', 'suspendue'])
                ->default('en_attente');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shops');
    }
};