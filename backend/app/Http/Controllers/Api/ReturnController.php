<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductReturn;
use App\Services\Cargo\CargoManager;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function __construct(private readonly CargoManager $cargo) {}

    public function index(Request $request)
    {
        $items = ProductReturn::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_item_id' => 'required|integer|exists:order_items,id',
            'reason' => 'required|in:defective,wrong_item,not_as_described,changed_mind,damaged,other',
            'description' => 'nullable|string|max:2000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'string|url',
        ]);

        $item = OrderItem::with('order')->findOrFail($data['order_item_id']);
        abort_unless($item->order->user_id === $request->user()->id, 403);
        abort_if($item->status === 'cancelled', 422, 'İptal edilmiş ürün için iade açılamaz.');

        $existing = ProductReturn::where('order_item_id', $item->id)
            ->whereNotIn('status', ['rejected'])
            ->exists();
        abort_if($existing, 422, 'Bu ürün için zaten bir iade talebi mevcut.');

        $return = ProductReturn::create([
            'return_number' => ProductReturn::generateNumber(),
            'order_id' => $item->order_id,
            'order_item_id' => $item->id,
            'user_id' => $request->user()->id,
            'seller_id' => $item->seller_id,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'images' => $data['images'] ?? [],
            'status' => 'approved', // basitlik için otomatik kabul; manuel akış için 'pending' yapılabilir
        ]);

        // Otomatik iade kargo kodu
        try {
            $label = $this->cargo->returnDriver()->createReturnLabel($return);
            $return->update([
                'cargo_company' => $this->cargo->returnDriver()->code(),
                'cargo_code' => $label['tracking_number'],
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'message' => 'İade talebiniz oluşturuldu.',
            'data' => $return->fresh(),
        ], 201);
    }

    public function show(Request $request, int $id)
    {
        $return = ProductReturn::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json(['data' => $return]);
    }
}
