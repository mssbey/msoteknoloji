<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'uuid', 'order_number', 'user_id',
        'billing_address', 'shipping_address',
        'subtotal', 'shipping_cost', 'discount_amount', 'tax_amount', 'total',
        'currency', 'status', 'payment_status',
        'coupon_code', 'coupon_discount',
        'payment_method', 'payment_gateway', 'payment_ref', 'paid_at',
        'customer_note', 'admin_note',
        'ip_address', 'utm_source', 'utm_medium', 'utm_campaign',
        'is_b2b', 'metadata',
        'contract_url', 'pre_info_url',
    ];

    protected $casts = [
        'billing_address' => 'array',
        'shipping_address' => 'array',
        'metadata' => 'array',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'is_b2b' => 'boolean',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function returns(): HasMany { return $this->hasMany(ProductReturn::class); }
    public function couponRedemption() { return $this->hasOne(CouponRedemption::class); }

    public static function generateOrderNumber(): string
    {
        return 'MSO-' . now()->format('YmdHis') . '-' . strtoupper(\Illuminate\Support\Str::random(4));
    }

    public function markAsPaid(string $reference, string $gateway): void
    {
        $this->update([
            'payment_status' => 'paid',
            'payment_ref' => $reference,
            'payment_gateway' => $gateway,
            'paid_at' => now(),
            'status' => 'confirmed',
        ]);
        event(new \App\Events\OrderPlaced($this));
    }

    public function getBuyerNameAttribute(): string
    {
        $addr = $this->shipping_address ?? [];
        return trim(($addr['first_name'] ?? '') . ' ' . ($addr['last_name'] ?? ''));
    }

    public function getBuyerPhoneAttribute(): ?string
    {
        return $this->shipping_address['phone'] ?? $this->user?->phone;
    }
}
