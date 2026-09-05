<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SentosIntegration extends Model
{
    protected $fillable = [
        'seller_id', 'api_key', 'api_secret', 'is_active', 'auto_sync',
        'last_sync_at', 'last_sync_status', 'synced_products_count',
        'last_error', 'settings',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'auto_sync' => 'boolean',
        'last_sync_at' => 'datetime',
        'settings' => 'array',
    ];

    protected $hidden = ['api_key', 'api_secret'];

    public function seller(): BelongsTo { return $this->belongsTo(Seller::class); }
}
