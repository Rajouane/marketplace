<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();

            $table->string('code')->unique();

            $table->enum('type', ['montant', 'pourcentage']);

            $table->decimal('valeur', 10, 2);

            $table->decimal('montant_minimum', 10, 2)->default(0);

            $table->dateTime('date_debut');
            $table->dateTime('date_fin');

            $table->unsignedInteger('nombre_max_utilisations')->nullable();
            $table->unsignedInteger('nombre_utilisations')->default(0);

            $table->boolean('actif')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};