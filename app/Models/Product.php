<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'brand_id',
        'name',
        'slug',
        'sku',
        'short_description',
        'description',
        'base_price',
        'sale_price',
        'delivery_fee',
        'offer_tag',
        'discount_percentage',
        'cost_price',
        'has_variants',
        'is_featured',
        'is_active',
        'meta_title',
        'meta_description',
    ];

    protected function casts(): array
    {
        return [
            'base_price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'has_variants' => 'boolean',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Check if customers have already placed orders containing this product.
     * Used to prevent fraudulent price and spec modifications on ordered goods.
     */
    public function hasOrders(): bool
    {
        return $this->variants()->whereHas('orderItems')->exists();
    }
}
