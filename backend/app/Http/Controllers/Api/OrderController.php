<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
            ->with(['items', 'returns'])
            ->firstOrFail();

        return response()->json(['data' => $order]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'billing_address' => 'required|array',
            'shipping_address' => 'required|array',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'nullable|string',
            'coupon_code' => 'nullable|string',
            'customer_note' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($data, $request) {
            $user = $request->user();
            $subtotal = 0.0;
            $itemRows = [];

            foreach ($data['items'] as $row) {
                $product = Product::findOrFail($row['product_id']);
                $price = (float) ($product->sale_price ?? $product->price);
                $line = $price * $row['quantity'];
                $subtotal += $line;
                $itemRows[] = [
                    'product' => $product,
                    'variant_id' => $row['variant_id'] ?? null,
                    'quantity' => $row['quantity'],
                    'unit_price' => $price,
                    'total_price' => $line,
                ];
            }

            $order = Order::create([
                'uuid' => (string) Str::uuid(),
                'order_number' => Order::generateOrderNumber(),
                'user_id' => $user->id,
                'billing_address' => $data['billing_address'],
                'shipping_address' => $data['shipping_address'],
                'subtotal' => $subtotal,
                'shipping_cost' => 0,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total' => $subtotal,
                'currency' => 'TRY',
                'status' => 'pending',
                'payment_status' => 'pending',
                'coupon_code' => $data['coupon_code'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
                'customer_note' => $data['customer_note'] ?? null,
                'ip_address' => $request->ip(),
            ]);

            foreach ($itemRows as $row) {
                $p = $row['product'];
                OrderItem::create([
                    'order_id' => $order->id,
                    'seller_id' => $p->seller_id,
                    'store_id' => $p->store_id,
                    'product_id' => $p->id,
                    'variant_id' => $row['variant_id'],
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'quantity' => $row['quantity'],
                    'unit_price' => $row['unit_price'],
                    'total_price' => $row['total_price'],
                    'status' => 'pending',
                ]);
            }

            Cart::where('user_id', $user->id)->update(['items' => [], 'subtotal' => 0]);

            return response()->json(['data' => $order->load('items')], 201);
        });
    }

    public function cancel(Request $request, int $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);

        if (in_array($order->status, ['shipped', 'delivered', 'cancelled', 'refunded'])) {
            return response()->json(['message' => 'Bu sipariş iptal edilemez.'], 422);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json(['data' => $order]);
    }
}
