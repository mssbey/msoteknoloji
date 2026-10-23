<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReturn extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'return_number', 'order_id', 'order_item_id', 'user_id', 'seller_id',
        'reason', 'description', 'images', 'status',
        'cargo_company', 'cargo_code',
        'refund_amount', 'refunded_at', 'admin_note',
    ];

    protected $casts = [
        'images' => 'array',
        'refund_amount' => 'decimal:2',
        'refunded_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(fn (self $return) => app(\App\Services\Orders\ReturnLifecycle::class)->handle($return, null));
        static::updated(function (self $return) {
            if ($return->wasChanged('status')) {
                app(\App\Services\Orders\ReturnLifecycle::class)->handle($return, $return->getOriginal('status'));
            }
        });
    }

    public function order() { return $this->belongsTo(Order::class); }
    public function orderItem() { return $this->belongsTo(OrderItem::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function seller() { return $this->belongsTo(Seller::class); }

    public static function generateNumber(): string
    {
        return 'RET-' . now()->format('YmdHis') . '-' . strtoupper(\Illuminate\Support\Str::random(4));
    }
}
