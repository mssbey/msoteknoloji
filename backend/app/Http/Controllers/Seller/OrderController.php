<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller;
        if (!$seller) {
            return response()->json(['data' => []]);
        }

        $items = OrderItem::where('seller_id', $seller->id)
            ->with(['order:id,order_number,status,payment_status,created_at,shipping_address,user_id', 'product:id,slug,name'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['data' => $items]);
    }
}
