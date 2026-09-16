<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'type',
        'valeur',
        'montant_minimum',
        'date_debut',
        'date_fin',
        'nombre_max_utilisations',
        'nombre_utilisations',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'valeur' => 'decimal:2',
            'montant_minimum' => 'decimal:2',
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'nombre_max_utilisations' => 'integer',
            'nombre_utilisations' => 'integer',
            'actif' => 'boolean',
        ];
    }
}


