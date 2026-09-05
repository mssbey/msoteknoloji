<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\Ai\ProductOptimizerService;
use Illuminate\Http\Request;

class AiOptimizerController extends Controller
{
    public function __construct(private readonly ProductOptimizerService $optimizer) {}

    /**
     * POST /api/seller/products/{id}/optimize
     * Satıcı isteğe bağlı olarak AI öneri ister.
     */
    public function optimize(Request $request, int $id)
    {
        $seller = $request->user()->seller ?? abort(403);
        $product = Product::where('seller_id', $seller->id)->findOrFail($id);

        $suggestions = $this->optimizer->suggest($product);
        return response()->json(['data' => $suggestions]);
    }

    /**
     * POST /api/seller/products/{id}/optimize/apply
     * Önerileri kabul ederek ürüne uygular.
     */
    public function apply(Request $request, int $id)
    {
        $seller = $request->user()->seller ?? abort(403);
        $product = Product::where('seller_id', $seller->id)->findOrFail($id);

        $data = $request->validate([
            'title' => 'nullable|string|max:500',
            'short_description' => 'nullable|string|max:1000',
            'long_description' => 'nullable|string',
            'seo_title' => 'nullable|string|max:200',
            'seo_description' => 'nullable|string|max:300',
        ]);

        $product->update([
            'name' => $data['title'] ?? $product->name,
            'short_description' => $data['short_description'] ?? $product->short_description,
            'description' => $data['long_description'] ?? $product->description,
            'seo_title' => $data['seo_title'] ?? $product->seo_title,
            'seo_description' => $data['seo_description'] ?? $product->seo_description,
        ]);

        return response()->json(['data' => $product]);
    }
}
