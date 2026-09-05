<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $seller = $request->user()->seller ?? abort(403);
        return response()->json([
            'current' => $seller->subscription,
            'package' => $seller->package,
            'product_limit' => $seller->getProductLimit(),
            'used_products' => $seller->products()->count(),
            'available_packages' => config('marketplace.packages'),
        ]);
    }

    public function subscribe(Request $request)
    {
        $seller = $request->user()->seller ?? abort(403);

        $data = $request->validate([
            'package' => 'required|in:starter,professional,enterprise',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $cfg = config("marketplace.packages.{$data['package']}");
        $price = $data['billing_cycle'] === 'yearly' ? $cfg['yearly_price'] : $cfg['monthly_price'];
        $endsAt = $data['billing_cycle'] === 'yearly' ? now()->addYear() : now()->addMonth();

        // Mevcut aboneliği pasifleştir
        $seller->subscription?->update(['status' => 'cancelled', 'cancelled_at' => now()]);

        $sub = Subscription::create([
            'seller_id' => $seller->id,
            'package' => $data['package'],
            'billing_cycle' => $data['billing_cycle'],
            'price' => $price,
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => $endsAt,
            'auto_renew' => true,
        ]);

        $seller->update([
            'package' => $data['package'],
            'package_expires_at' => $endsAt,
        ]);

        return response()->json(['data' => $sub], 201);
    }
}
