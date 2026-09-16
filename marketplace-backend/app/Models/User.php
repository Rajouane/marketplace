<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'email',
        'telephone',
        'password',
        'role_id',
        'statut',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Relation avec le rôle.
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * Relation avec les boutiques du vendeur.
     */
    public function shops(): HasMany
    {
        return $this->hasMany(Shop::class, 'vendeur_id');
    }

    /**
     * Relation avec le panier du client.
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class, 'client_id');
    }

    /**
     * Relation avec les adresses du client.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class, 'client_id');
    }

    /**
     * Relation avec les commandes du client.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'client_id');
    }
}

