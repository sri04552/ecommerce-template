<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'customer_email',
        'customer_phone',
        'status',
        'currency',
        'subtotal',
        'discount_total',
        'shipping_total',
        'tax_total',
        'grand_total',
        'shipping_address_snapshot',
        'billing_address_snapshot',
        'shipping_method_id',
        'payment_method',
        'notes',
    ];

    protected $appends = [
        'total_amount',
        'shipping_address',
        'customer_name',
    ];

    public function getTotalAmountAttribute()
    {
        return $this->grand_total;
    }

    public function getShippingAddressAttribute()
    {
        return $this->shipping_address_snapshot;
    }

    public function getCustomerNameAttribute()
    {
        return $this->shipping_address_snapshot['name'] ?? ($this->user?->name ?? 'Customer');
    }

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_total' => 'decimal:2',
            'shipping_total' => 'decimal:2',
            'tax_total' => 'decimal:2',
            'grand_total' => 'decimal:2',
            'shipping_address_snapshot' => 'array',
            'billing_address_snapshot' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(OrderHistory::class)->orderBy('created_at', 'desc');
    }

    public function shipments(): HasMany
    {
        return $this->hasMany(Shipment::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(OrderReturn::class)->orderBy('created_at', 'desc');
    }
}
