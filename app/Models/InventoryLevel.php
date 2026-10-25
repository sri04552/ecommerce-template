<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_variant_id',
        'quantity_on_hand',
        'reserved_quantity',
        'safety_threshold',
        'allow_backorder',
    ];

    protected function casts(): array
    {
        return [
            'quantity_on_hand' => 'integer',
            'reserved_quantity' => 'integer',
            'safety_threshold' => 'integer',
            'allow_backorder' => 'boolean',
        ];
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * Quantity available for purchase (on hand minus reserved).
     */
    public function getAvailableQuantityAttribute(): int
    {
        return max(0, $this->quantity_on_hand - $this->reserved_quantity);
    }
}
