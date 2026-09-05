<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'blog_category_id', 'author_id', 'seller_id',
        'title', 'slug', 'excerpt', 'content',
        'featured_image', 'featured_image_alt', 'tags',
        'seo_title', 'seo_description', 'seo_keywords', 'og_image', 'canonical_url',
        'status', 'published_at', 'is_featured', 'allow_comments',
        'related_product_ids', 'related_category_ids',
    ];

    protected $casts = [
        'tags' => 'array',
        'related_product_ids' => 'array',
        'related_category_ids' => 'array',
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
    ];

    public function category() { return $this->belongsTo(BlogCategory::class, 'blog_category_id'); }
    public function author() { return $this->belongsTo(User::class, 'author_id'); }
    public function seller() { return $this->belongsTo(Seller::class); }
}
