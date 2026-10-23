<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDocument extends Model
{
    const UPDATED_AT = null;

    protected $fillable = ['order_id', 'type', 'version', 'sha256', 'contents'];

    protected $hidden = ['contents'];

    protected $casts = ['created_at' => 'datetime'];

    public function order(): BelongsTo { return $this->belongsTo(Order::class); }

    public function pdf(): string
    {
        return base64_decode($this->contents);
    }

    public function filename(): string
    {
        return "{$this->type}-{$this->order->order_number}.pdf";
    }
}
