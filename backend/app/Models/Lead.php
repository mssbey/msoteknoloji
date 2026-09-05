<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'name', 'phone', 'email', 'kvkk_consent', 'commercial_consent',
        'coupon_code', 'source', 'ip_address',
        'utm_source', 'utm_medium', 'utm_campaign',
    ];

    protected $casts = [
        'kvkk_consent' => 'boolean',
        'commercial_consent' => 'boolean',
        'coupon_used' => 'boolean',
        'coupon_used_at' => 'datetime',
    ];
}
