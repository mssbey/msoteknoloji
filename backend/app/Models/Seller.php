<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    use \Illuminate\Database\Eloquent\SoftDeletes;

    protected $fillable = [
        'user_id', 'uuid', 'company_name', 'tax_number', 'tax_office',
        'company_type', 'phone', 'email', 'status', 'package',
        'package_expires_at', 'approved_at', 'approved_by',
        'iban', 'bank_name', 'bank_account_name',
        'commission_rate', 'balance', 'pending_balance', 'total_sales',
        'notes', 'metadata',
    ];

    protected $casts = [
        'package_expires_at' => 'datetime',
        'approved_at' => 'datetime',
        'metadata' => 'array',
        'balance' => 'decimal:2',
        'commission_rate' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function store() { return $this->hasOne(Store::class); }
    public function stores() { return $this->hasMany(Store::class); }
    public function products() { return $this->hasMany(Product::class); }
    public function orders() { return $this->hasManyThrough(Order::class, OrderItem::class, 'seller_id', 'id', 'id', 'order_id'); }
    public function subscription() { return $this->hasOne(Subscription::class)->latestOfMany(); }

    public function isActive(): bool { return $this->status === 'approved'; }
    public function getProductLimit(): int
    {
        return match($this->package) {
            'starter' => 500,
            'professional' => 2000,
            'enterprise' => -1,
        };
    }
}
