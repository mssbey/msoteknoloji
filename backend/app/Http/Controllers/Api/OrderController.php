<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateOrderContractJob;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Models\Coupon;
use App\Services\Coupons\CouponService;
use App\Services\Legal\LegalDocumentService;
use App\Services\Orders\OrderStatusService;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $orders]);
    }

    public function show(Request $request, string $orderNumber)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->where('order_number', $orderNumber)
            ->with(['items', 'returns', 'statusHistories:id,order_id,status,created_at', 'documents:id,order_id,type,version,created_at'])
            ->firstOrFail();

        return response()->json(['data' => $order]);
    }

    private function rules(bool $preview = false): array
    {
        $required = $preview ? 'nullable' : 'required';

        return [
            'billing_address' => "{$required}|array",
            'shipping_address' => "{$required}|array",
            'shipping_address.first_name' => "{$required}|string|max:100",
            'shipping_address.last_name' => "{$required}|string|max:100",
            'shipping_address.phone' => $preview ? ['nullable', 'string', 'max:20'] : ['required', 'regex:/^[+0-9 ()-]{10,20}$/'],
            'shipping_address.city' => "{$required}|string|max:100",
            'shipping_address.district' => "{$required}|string|max:100",
            'shipping_address.address' => $preview ? 'nullable|string|max:1000' : 'required|string|min:10|max:1000',
            'billing_address.first_name' => "{$required}|string|max:100",
            'billing_address.last_name' => "{$required}|string|max:100",
            'billing_address.address' => $preview ? 'nullable|string|max:1000' : 'required|string|min:10|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => "{$required}|in:bank_transfer",
            'coupon_code' => 'nullable|string',
            'customer_note' => 'nullable|string|max:1000',
        ] + ($preview ? [] : [
            // Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi onayı
            'legal_accepted' => 'accepted',
        ]);
    }

    /**
     * Sepet satırlarını fiyatlar ve stok kurallarını uygular.
     * $reserve true ise satırları kilitler ve stoktan düşer (sipariş oluşturma).
     */
    private function priceItems(array $items, bool $reserve): array
    {
        $subtotal = 0.0;
        $rows = [];
        foreach ($items as $row) {
            $product = ($reserve ? Product::lockForUpdate() : Product::query())->findOrFail($row['product_id']);
            if (!$product->is_active || $product->status !== 'approved') {
                throw ValidationException::withMessages(['items' => "{$product->name} satışa açık değil."]);
            }
            $variants = $reserve ? $product->variants()->lockForUpdate() : $product->variants();
            $variant = isset($row['variant_id']) ? $variants->find($row['variant_id']) : null;
            if (isset($row['variant_id']) && !$variant) {
                throw ValidationException::withMessages(['items' => 'Ürün seçeneği bu ürüne ait değil.']);
            }
            if (!$variant && $product->variants()->exists()) {
                throw ValidationException::withMessages(['items' => 'Lütfen ürün seçeneklerini belirleyiniz.']);
            }
            if ($variant && !$variant->is_active) throw ValidationException::withMessages(['items' => 'Ürün seçeneği satışa açık değil.']);
            $stockItem = $variant ?? $product;
            if ($product->track_stock && !$product->allow_backorder && $stockItem->stock < $row['quantity']) {
                throw ValidationException::withMessages(['items' => "{$product->name} için yeterli stok yok."]);
            }
            if ($reserve && $product->track_stock) $stockItem->decrement('stock', $row['quantity']);
            $price = (float) ($variant?->sale_price ?? $variant?->price ?? $product->sale_price ?? $product->price);
            $line = $price * $row['quantity'];
            $subtotal += $line;
            $rows[] = [
                'seller_id' => $product->seller_id,
                'store_id' => $product->store_id,
                'product_id' => $product->id,
                'variant_id' => $variant?->id,
                'name' => $product->name,
                'sku' => $variant?->sku ?? $product->sku,
                'variant_options' => $this->variantOptions($variant?->attributes),
                'quantity' => $row['quantity'],
                'unit_price' => $price,
                'total_price' => $line,
                'status' => 'pending',
            ];
        }

        return [$rows, $subtotal];
    }

    /**
     * Sentos varyant özelliklerini ({"model":{"name":"Seçenek","value":"Bordo"},"color":""})
     * sözleşme ve siparişte gösterilecek ["Seçenek" => "Bordo"] biçimine çevirir.
     */
    private function variantOptions(mixed $attributes): ?array
    {
        $attributes = is_string($attributes) ? json_decode($attributes, true) : $attributes;
        if (!is_array($attributes)) return null;

        $labels = ['color' => 'Renk', 'size' => 'Beden', 'model' => 'Seçenek'];
        $options = [];
        foreach ($attributes as $key => $attribute) {
            $value = is_array($attribute) ? ($attribute['value'] ?? null) : $attribute;
            if (!is_scalar($value) || trim((string) $value) === '') continue;
            $label = (is_array($attribute) ? trim((string) ($attribute['name'] ?? '')) : '')
                ?: ($labels[$key] ?? (is_string($key) ? $key : 'Seçenek'));
            $options[$label] = (string) $value;
        }

        return $options ?: null;
    }

    /** @return array{0: float, 1: float, 2: ?Coupon} kargo ücreti, indirim, kupon */
    private function totals(float $subtotal, ?string $couponCode, $user, bool $lock): array
    {
        $shipping = $subtotal >= 1000 ? 0 : 29.90;
        if (empty($couponCode)) return [$shipping, 0, null];

        if ($lock) Coupon::where('code', $couponCode)->lockForUpdate()->first();
        $result = app(CouponService::class)->validate($couponCode, $subtotal, $user);
        if ($result['error']) throw ValidationException::withMessages(['coupon_code' => $result['error']]);

        return [$shipping, $result['discount'], $result['coupon']];
    }

    private function orderAttributes(array $data, $user, float $subtotal, float $shipping, float $discount, Request $request): array
    {
        return [
            'user_id' => $user->id,
            'billing_address' => $data['billing_address'] ?? [],
            'shipping_address' => $data['shipping_address'] ?? [],
            'subtotal' => $subtotal,
            'shipping_cost' => $shipping,
            'discount_amount' => $discount,
            'coupon_discount' => $discount,
            'tax_amount' => 0,
            'total' => round($subtotal + $shipping - $discount, 2),
            'currency' => 'TRY',
            'status' => 'pending',
            'payment_status' => 'pending',
            'coupon_code' => $data['coupon_code'] ?? null,
            'payment_method' => $data['payment_method'] ?? 'bank_transfer',
            'customer_note' => $data['customer_note'] ?? null,
            'ip_address' => $request->ip(),
        ];
    }

    public function store(Request $request)
    {
        $data = $request->validate($this->rules());
        $legal = app(LegalDocumentService::class);

        $order = DB::transaction(function () use ($data, $request, $legal) {
            $user = $request->user();
            [$itemRows, $subtotal] = $this->priceItems($data['items'], reserve: true);
            [$shipping, $discount, $coupon] = $this->totals($subtotal, $data['coupon_code'] ?? null, $user, lock: true);

            $order = Order::create($this->orderAttributes($data, $user, $subtotal, $shipping, $discount, $request) + [
                'uuid' => (string) Str::uuid(),
                'order_number' => Order::generateOrderNumber(),
                'metadata' => ['legal' => [
                    'accepted_at' => now()->toIso8601String(),
                    'ip' => $request->ip(),
                    'versions' => collect(LegalDocumentService::ORDER_DOCUMENTS)->keys()
                        ->mapWithKeys(fn ($slug) => [$slug => $legal->version($slug)])->all(),
                ]],
            ]);
            foreach ($itemRows as $row) {
                $order->items()->create($row);
            }

            app(OrderStatusService::class)->recordInitial($order, 'customer', $user->id);
            Cart::where('user_id', $user->id)->update(['items' => [], 'subtotal' => 0]);
            if ($coupon) app(CouponService::class)->redeem($coupon, $order, $discount);

            return $order;
        });

        // Sözleşme PDF'leri sipariş kaydından sonra üretilir; bir hata siparişi bozmaz.
        rescue(fn () => Bus::dispatch(new GenerateOrderContractJob($order->id)));

        return response()->json(['data' => $order->load('items')], 201);
    }

    /** Ödeme öncesinde gösterilen, sepete ve adrese göre doldurulmuş sözleşme metinleri */
    public function legalPreview(Request $request)
    {
        $data = $request->validate($this->rules(preview: true));
        $user = $request->user();
        [$itemRows, $subtotal] = $this->priceItems($data['items'], reserve: false);
        [$shipping, $discount] = $this->totals($subtotal, $data['coupon_code'] ?? null, $user, lock: false);

        $order = new Order($this->orderAttributes($data, $user, $subtotal, $shipping, $discount, $request));
        $order->setRelation('user', $user);
        $order->setRelation('items', collect($itemRows)->map(fn ($row) => new OrderItem($row)));
        $legal = app(LegalDocumentService::class);

        return response()->json(['data' => collect(LegalDocumentService::ORDER_DOCUMENTS)->map(fn ($title, $slug) => [
            'slug' => $slug,
            'title' => $title,
            'version' => $legal->version($slug),
            'html' => $legal->renderBody($slug, $order),
        ])->values()]);
    }

    public function document(Request $request, string $orderNumber, string $type)
    {
        abort_unless(array_key_exists($type, LegalDocumentService::ORDER_DOCUMENTS), 404);
        $order = Order::where('user_id', $request->user()->id)->where('order_number', $orderNumber)->firstOrFail();
        $document = app(LegalDocumentService::class)->archiveOrderDocuments($order)[$type];

        return response($document->pdf(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="' . $document->filename() . '"',
        ]);
    }

    public function cancel(Request $request, int $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);
        if ($order->status === 'cancelled') {
            return response()->json(['message' => 'Bu sipariş iptal edilemez.'], 422);
        }

        try {
            app(OrderStatusService::class)->transition($order, 'cancelled', 'customer', $request->user()->id, 'Müşteri iptal etti');
        } catch (\DomainException) {
            return response()->json(['message' => 'Bu sipariş iptal edilemez.'], 422);
        }

        return response()->json(['data' => $order]);
    }
}
