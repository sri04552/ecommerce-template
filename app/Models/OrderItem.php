<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_variant_id',
        'product_name_snapshot',
        'variant_title_snapshot',
        'variant_attributes_snapshot',
        'sku_snapshot',
        'unit_price',
        'quantity',
        'subtotal',
        'tax_amount',
        'total',
    ];

    protected $appends = [
        'product_name',
    ];

    public function getProductNameAttribute()
    {
        return $this->product_name_snapshot;
    }

    protected function casts(): array
    {
        return [
            'variant_attributes_snapshot' => 'array',
            'unit_price' => 'decimal:2',
            'quantity' => 'integer',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
