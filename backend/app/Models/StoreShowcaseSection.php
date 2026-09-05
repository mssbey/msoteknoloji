<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreShowcaseSection extends Model
{
    protected $fillable = [
        'store_id', 'type', 'title', 'subtitle',
        'product_ids', 'cta_text', 'cta_url',
        'position', 'is_active',
    ];

    protected $casts = [
        'product_ids' => 'array',
        'is_active' => 'boolean',
    ];

    public function store(): BelongsTo { return $this->belongsTo(Store::class); }

    public function products()
    {
        return Product::whereIn('id', $this->product_ids ?? [])->active()->get();
    }
}
