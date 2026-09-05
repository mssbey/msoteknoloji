<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'seller_id', 'store_id', 'category_id', 'brand_id',
        'uuid', 'name', 'slug', 'sku', 'barcode',
        'description', 'short_description',
        'price', 'sale_price', 'cost_price', 'currency',
        'tax_rate', 'tax_included',
        'stock', 'min_stock_alert', 'track_stock', 'allow_backorder',
        'weight', 'width', 'height', 'depth', 'free_shipping',
        'status', 'is_active', 'is_featured', 'is_digital',
        'seo_title', 'seo_description', 'seo_keywords', 'og_image',
        'ai_score', 'ai_suggestions', 'ai_generated_at',
        'published_at', 'approved_at', 'approved_by', 'rejection_reason',
        'metadata',
        'sentos_id', 'last_synced_at',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'sale_price' => 'decimal:2',
        'cost_price' => 'decimal:2',
        'tax_included' => 'boolean',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'is_digital' => 'boolean',
        'free_shipping' => 'boolean',
        'track_stock' => 'boolean',
        'allow_backorder' => 'boolean',
        'ai_suggestions' => 'array',
        'metadata' => 'array',
        'published_at' => 'datetime',
        'approved_at' => 'datetime',
        'ai_generated_at' => 'datetime',
    ];

    public function seller() { return $this->belongsTo(Seller::class); }
    public function store() { return $this->belongsTo(Store::class); }
    public function category() { return $this->belongsTo(Category::class); }
    public function brand() { return $this->belongsTo(Brand::class); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderByDesc('is_primary')->orderBy('position'); }

    public function scopeActive($q) { return $q->where('is_active', true)->where('status', 'approved'); }
    public function scopeFeatured($q) { return $q->where('is_featured', true); }
    public function scopeInStock($q) { return $q->where('stock', '>', 0); }

    public function getCurrentPriceAttribute(): float
    {
        return (float) ($this->sale_price ?? $this->price);
    }

    public function getDiscountPercentAttribute(): ?int
    {
        if ($this->sale_price && $this->sale_price < $this->price) {
            return (int) round((($this->price - $this->sale_price) / $this->price) * 100);
        }
        return null;
    }
}
