<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $fillable = [
        'seller_id', 'package', 'billing_cycle', 'price', 'status',
        'trial_ends_at', 'current_period_start', 'current_period_end',
        'cancelled_at', 'auto_renew', 'gateway_sub_id',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'trial_ends_at' => 'datetime',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
        'auto_renew' => 'boolean',
    ];

    public function seller(): BelongsTo { return $this->belongsTo(Seller::class); }

    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial'])
            && $this->current_period_end?->isFuture();
    }

    public function productLimit(): int
    {
        return (int) config("marketplace.packages.{$this->package}.product_limit", 500);
    }
}
