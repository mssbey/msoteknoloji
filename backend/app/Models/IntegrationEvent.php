<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IntegrationEvent extends Model
{
    protected $fillable = ['provider', 'event', 'idempotency_key', 'status', 'order_id', 'payload', 'error'];

    protected $casts = ['payload' => 'array'];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }
}
