<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUS_LABELS = [
        'pending' => 'Ödeme bekleniyor',
        'payment_failed' => 'Ödeme başarısız',
        'received' => 'Sipariş alındı',
        'confirmed' => 'Onaylandı',
        'processing' => 'Hazırlanıyor',
        'shipped' => 'Kargoya verildi',
        'delivered' => 'Teslim edildi',
        'cancelled' => 'İptal edildi',
        'return_requested' => 'İade talebi oluşturuldu',
        'refunded' => 'İade edildi',
    ];

    protected $appends = ['bank_transfer'];

    public function getBankTransferAttribute(): ?array
    {
        if ($this->payment_method !== 'bank_transfer') return null;
        return array_merge(config('payments.bank_transfer'), ['reference' => $this->order_number]);
    }

    protected $fillable = [
        'uuid', 'order_number', 'user_id',
        'billing_address', 'shipping_address',
        'subtotal', 'shipping_cost', 'discount_amount', 'tax_amount', 'total',
        'currency', 'status', 'payment_status',
        'coupon_code', 'coupon_discount',
        'payment_method', 'payment_gateway', 'payment_ref', 'paid_at',
        'cargo_company', 'cargo_tracking_number', 'cargo_tracking_url',
        'kargonomi_shipment_id', 'cargo_status',
        'customer_note', 'admin_note',
        'ip_address', 'utm_source', 'utm_medium', 'utm_campaign',
        'is_b2b', 'metadata',
        'contract_url', 'pre_info_url',
    ];

    protected $casts = [
        'billing_address' => 'array',
        'shipping_address' => 'array',
        'metadata' => 'array',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total' => 'decimal:2',
        'coupon_discount' => 'decimal:2',
        'is_b2b' => 'boolean',
        'paid_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(OrderItem::class); }
    public function returns(): HasMany { return $this->hasMany(ProductReturn::class); }
    public function couponRedemption() { return $this->hasOne(CouponRedemption::class); }
    public function documents(): HasMany { return $this->hasMany(OrderDocument::class); }
    public function statusHistories(): HasMany { return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at')->orderBy('id'); }

    public static function generateOrderNumber(): string
    {
        return 'MSO-' . now()->format('YmdHis') . '-' . strtoupper(\Illuminate\Support\Str::random(4));
    }

    public function markAsPaid(string $reference, string $gateway, string $actorType = 'system', ?int $actorId = null): void
    {
        $order = \Illuminate\Support\Facades\DB::transaction(function () use ($reference, $gateway, $actorType, $actorId) {
            $order = static::query()->lockForUpdate()->findOrFail($this->getKey());
            if ($order->payment_status === 'paid') {
                return null;
            }
            if (in_array($order->status, ['cancelled', 'refunded'], true)) {
                throw new \DomainException('Cancelled or refunded orders cannot be marked as paid.');
            }
            $order->update([
            'payment_status' => 'paid',
            'payment_ref' => $reference,
            'payment_gateway' => $gateway,
            'paid_at' => now(),
            ]);
            app(\App\Services\Orders\OrderStatusService::class)
                ->transition($order, 'received', actorType: $actorType, actorId: $actorId, note: 'Ödeme alındı');
            return $order;
        });
        $this->refresh();
        if ($order) {
            \Illuminate\Support\Facades\DB::afterCommit(fn () => event(new \App\Events\OrderPlaced($order)));
        }
    }

    public function getBuyerNameAttribute(): string
    {
        $addr = $this->shipping_address ?? [];
        return trim(($addr['first_name'] ?? '') . ' ' . ($addr['last_name'] ?? ''));
    }

    public function getCustomerEmailAttribute(): ?string
    {
        return $this->user?->email ?? ($this->shipping_address['email'] ?? $this->billing_address['email'] ?? null);
    }

    public function getBuyerPhoneAttribute(): ?string
    {
        return $this->shipping_address['phone'] ?? $this->user?->phone;
    }
}
