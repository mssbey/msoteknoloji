<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id', 'session_id', 'items', 'subtotal', 'coupon_code',
        'is_abandoned', 'abandoned_at', 'recovery_sent', 'recovery_sent_at',
        'recovery_token', 'recovered', 'expires_at',
    ];

    protected $casts = [
        'items' => 'array',
        'subtotal' => 'decimal:2',
        'is_abandoned' => 'boolean',
        'recovery_sent' => 'boolean',
        'recovered' => 'boolean',
        'abandoned_at' => 'datetime',
        'recovery_sent_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user() { return $this->belongsTo(User::class); }

    public function markAbandoned(): void
    {
        $this->update([
            'is_abandoned' => true,
            'abandoned_at' => now(),
        ]);

        // Abandonment event fırlat → WhatsApp akışını tetikler
        event(new \App\Events\CartAbandoned($this, $this->user));
    }

    public function getItemCountAttribute(): int
    {
        return collect($this->items)->sum('quantity');
    }
}
