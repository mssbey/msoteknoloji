<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id', 'seller_id', 'store_id', 'product_id', 'variant_id',
        'name', 'sku', 'image',
        'quantity', 'unit_price', 'sale_price', 'total_price',
        'tax_rate', 'tax_amount', 'discount',
        'status', 'commission_rate', 'commission_amount', 'seller_earning',
        'variant_options',
        'cargo_company', 'cargo_tracking_number', 'cargo_tracking_url',
        'shipped_at', 'delivered_at',
    ];

    protected $casts = [
        'variant_options' => 'array',
        'unit_price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'seller_earning' => 'decimal:2',
        'shipped_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
    public function seller(): BelongsTo { return $this->belongsTo(Seller::class); }
    public function store(): BelongsTo { return $this->belongsTo(Store::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function variant(): BelongsTo { return $this->belongsTo(ProductVariant::class, 'variant_id'); }
}
