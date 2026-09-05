<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'source', 'discount_type', 'amount',
        'min_order_amount', 'max_discount_amount',
        'usage_limit', 'used_count', 'per_user_limit',
        'user_id', 'lead_id', 'store_id',
        'product_ids', 'category_ids', 'first_order_only',
        'is_active', 'starts_at', 'expires_at',
        'campaign_name', 'metadata',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_discount_amount' => 'decimal:2',
        'product_ids' => 'array',
        'category_ids' => 'array',
        'metadata' => 'array',
        'first_order_only' => 'boolean',
        'is_active' => 'boolean',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function lead(): BelongsTo { return $this->belongsTo(Lead::class); }
    public function store(): BelongsTo { return $this->belongsTo(Store::class); }
    public function redemptions(): HasMany { return $this->hasMany(CouponRedemption::class); }

    public function isUsable(): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->starts_at && $this->starts_at->isFuture()) return false;
        if ($this->usage_limit > 0 && $this->used_count >= $this->usage_limit) return false;
        return true;
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($subtotal < $this->min_order_amount) return 0.0;
        $raw = $this->discount_type === 'percent'
            ? ($subtotal * $this->amount / 100)
            : (float) $this->amount;
        if ($this->max_discount_amount && $raw > $this->max_discount_amount) {
            $raw = (float) $this->max_discount_amount;
        }
        return round(min($raw, $subtotal), 2);
    }
}
