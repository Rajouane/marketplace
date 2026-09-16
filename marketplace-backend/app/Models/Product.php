<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'shop_id',
        'category_id',
        'nom',
        'description',
        'prix',
        'prix_promotionnel',
        'stock',
        'seuil_alerte',
        'marque',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'decimal:2',
            'prix_promotionnel' => 'decimal:2',
            'stock' => 'integer',
            'seuil_alerte' => 'integer',
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }
}