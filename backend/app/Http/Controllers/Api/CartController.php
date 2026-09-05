<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CartController extends Controller
{
    public function show(Request $request)
    {
        $cart = $this->resolveCart($request, createIfMissing: false);
        return response()->json(['data' => $this->serialize($cart)]);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'nullable|integer|exists:product_variants,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $product = Product::active()->findOrFail($data['product_id']);
        $cart = $this->resolveCart($request, createIfMissing: true);

        $items = $cart->items ?? [];
        $key = $data['product_id'] . ':' . ($data['variant_id'] ?? '_');

        if (isset($items[$key])) {
            $items[$key]['quantity'] += $data['quantity'];
        } else {
            $items[$key] = [
                'product_id' => $product->id,
                'variant_id' => $data['variant_id'] ?? null,
                'name' => $product->name,
                'sku' => $product->sku,
                'price' => (float) $product->current_price,
                'quantity' => $data['quantity'],
            ];
        }

        $cart->update([
            'items' => $items,
            'subtotal' => $this->subtotal($items),
            'is_abandoned' => false,
        ]);

        return response()->json(['data' => $this->serialize($cart)], 201);
    }

    public function remove(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer',
            'variant_id' => 'nullable|integer',
        ]);

        $cart = $this->resolveCart($request, createIfMissing: false);
        if (!$cart) return response()->json(['data' => null]);

        $items = $cart->items ?? [];
        $key = $data['product_id'] . ':' . ($data['variant_id'] ?? '_');
        unset($items[$key]);

        $cart->update([
            'items' => $items,
            'subtotal' => $this->subtotal($items),
        ]);

        return response()->json(['data' => $this->serialize($cart)]);
    }

    public function clear(Request $request)
    {
        $cart = $this->resolveCart($request, createIfMissing: false);
        $cart?->update(['items' => [], 'subtotal' => 0]);
        return response()->json(['data' => null]);
    }

    private function resolveCart(Request $request, bool $createIfMissing): ?Cart
    {
        $user = $request->user();
        $sessionId = $request->header('X-Cart-Session') ?: (string) Str::uuid();

        $query = $user
            ? Cart::where('user_id', $user->id)
            : Cart::where('session_id', $sessionId);

        $cart = $query->where(function ($q) {
            $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
        })->first();

        if (!$cart && $createIfMissing) {
            $cart = Cart::create([
                'user_id' => $user?->id,
                'session_id' => $user ? null : $sessionId,
                'items' => [],
                'subtotal' => 0,
                'expires_at' => now()->addDays(14),
            ]);
        }

        return $cart;
    }

    private function subtotal(array $items): float
    {
        $sum = 0.0;
        foreach ($items as $i) {
            $sum += ($i['price'] ?? 0) * ($i['quantity'] ?? 0);
        }
        return round($sum, 2);
    }

    private function serialize(?Cart $cart): ?array
    {
        if (!$cart) return null;
        return [
            'id' => $cart->id,
            'items' => array_values($cart->items ?? []),
            'item_count' => $cart->item_count,
            'subtotal' => (float) $cart->subtotal,
            'coupon_code' => $cart->coupon_code,
        ];
    }
}
