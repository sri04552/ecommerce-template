<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Promotion extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'coupon_code',
        'discount_type',
        'discount_value',
        'minimum_order_amount',
        'max_discount_amount',
        'usage_limit_total',
        'usage_limit_per_user',
        'used_count',
        'starts_at',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'minimum_order_amount' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'usage_limit_total' => 'integer',
            'usage_limit_per_user' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Determine if promotion is currently valid.
     */
    public function isValid(): bool
    {
        if (! $this->is_active) {
            return false;
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return false;
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return false;
        }

        if ($this->usage_limit_total !== null && $this->used_count >= $this->usage_limit_total) {
            return false;
        }

        return true;
    }

    /**
     * Get descriptive validation error if not valid for given subtotal.
     */
    public function getValidationError(float $subtotal): ?string
    {
        if (! $this->is_active) {
            return 'This coupon code is no longer active.';
        }

        $now = now();

        if ($this->starts_at && $now->lt($this->starts_at)) {
            return 'This coupon promotion has not started yet.';
        }

        if ($this->expires_at && $now->gt($this->expires_at)) {
            return 'This coupon has expired.';
        }

        if ($this->usage_limit_total !== null && $this->used_count >= $this->usage_limit_total) {
            return 'This coupon has reached its maximum usage limit.';
        }

        if ($this->minimum_order_amount !== null && $subtotal < (float) $this->minimum_order_amount) {
            return 'Minimum order amount of ₹'.number_format((float) $this->minimum_order_amount, 2).' is required for this coupon.';
        }

        return null;
    }

    /**
     * Calculate discount amount for a given order subtotal.
     */
    public function calculateDiscount(float $subtotal): float
    {
        if ($this->getValidationError($subtotal) !== null) {
            return 0.00;
        }

        $discount = 0.00;

        if ($this->discount_type === 'percentage') {
            $discount = ($subtotal * (float) $this->discount_value) / 100.0;
            if ($this->max_discount_amount !== null) {
                $discount = min($discount, (float) $this->max_discount_amount);
            }
        } else {
            // Fixed amount discount
            $discount = min((float) $this->discount_value, $subtotal);
        }

        return round(max(0.00, $discount), 2);
    }
}
