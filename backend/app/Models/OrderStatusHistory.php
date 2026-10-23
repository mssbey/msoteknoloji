<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderStatusHistory extends Model
{
    const UPDATED_AT = null;

    protected $fillable = ['order_id', 'from_status', 'status', 'actor_type', 'actor_id', 'note'];

    protected $casts = ['created_at' => 'datetime'];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}
