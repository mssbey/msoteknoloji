<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationLog extends Model
{
    protected $fillable = [
        'channel', 'provider', 'to', 'template', 'content',
        'status', 'provider_message_id', 'error',
        'related_type', 'related_id', 'payload',
        'sent_at', 'delivered_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function related()
    {
        return $this->morphTo();
    }
}
