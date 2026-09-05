<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScrapedReview extends Model
{
    protected $fillable = [
        'product_id', 'match_key', 'platform', 'external_review_id', 'external_product_url',
        'rating', 'reviewer_name', 'title', 'content', 'images', 'review_date',
        'is_verified_purchase', 'is_imported', 'imported_review_id', 'imported_at',
    ];

    protected $casts = [
        'images' => 'array',
        'review_date' => 'date',
        'is_verified_purchase' => 'boolean',
        'is_imported' => 'boolean',
        'imported_at' => 'datetime',
    ];

    public function product() { return $this->belongsTo(Product::class); }
    public function importedReview() { return $this->belongsTo(Review::class, 'imported_review_id'); }
}
