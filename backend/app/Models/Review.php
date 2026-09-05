<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'product_id', 'user_id', 'order_item_id',
        'rating', 'title', 'content', 'pros', 'cons', 'images',
        'is_verified_purchase', 'is_approved', 'is_featured',
        'seller_reply', 'seller_replied_at',
        'reward_coupon', 'reward_issued',
        'source', 'external_id',
    ];

    protected $casts = [
        'images' => 'array',
        'is_verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
        'is_featured' => 'boolean',
        'reward_issued' => 'boolean',
        'seller_replied_at' => 'datetime',
    ];

    public function product() { return $this->belongsTo(Product::class); }
    public function user() { return $this->belongsTo(User::class); }
    public function orderItem() { return $this->belongsTo(OrderItem::class); }
}
