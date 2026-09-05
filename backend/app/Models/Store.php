<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    protected $fillable = [
        'seller_id', 'uuid', 'name', 'slug', 'description',
        'logo', 'banner', 'favicon', 'custom_domain',
        'theme_color', 'accent_color', 'text_color',
        'announcement_text', 'announcement_bg', 'announcement_active',
        'whatsapp_number', 'featured_section_title',
        'welcome_coupon_active', 'welcome_coupon_percent',
        'is_active', 'is_featured',
        'seo_title', 'seo_description',
        'rating', 'review_count', 'follower_count', 'total_products',
        'meta', 'vitrin_sections',
    ];

    protected $casts = [
        'meta' => 'array',
        'vitrin_sections' => 'array',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'announcement_active' => 'boolean',
        'welcome_coupon_active' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function seller(): BelongsTo { return $this->belongsTo(Seller::class); }
    public function products(): HasMany { return $this->hasMany(Product::class); }
    public function showcaseSections(): HasMany { return $this->hasMany(StoreShowcaseSection::class)->orderBy('position'); }

    public function scopeActive($q) { return $q->where('is_active', true); }
    public function scopeFeatured($q) { return $q->where('is_featured', true); }
}
