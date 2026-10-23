<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id', 'sku', 'barcode',
        'price', 'sale_price', 'cost_price',
        'stock', 'weight', 'image', 'is_active', 'sort_order', 'attributes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'is_active' => 'boolean',
        'attributes' => 'array',
    ];

    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
}
