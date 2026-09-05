<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'per_page' => 'sometimes|integer|min:1|max:100',
            'page' => 'sometimes|integer|min:1',
            'collection' => 'sometimes|nullable|in:' . implode(',', array_keys(\App\Services\StorefrontCatalog::GROUPS)),
        ]);
        $catalog = app(\App\Services\StorefrontCatalog::class);
        $products = \App\Models\Product::active()
            ->with(['seller:id,company_name', 'store:id,name,slug,rating', 'category:id,name,slug', 'brand:id,name,slug'])
            ->when($request->category, fn($q) => $q->whereHas('category', fn($q) => $q->where('slug', $request->category)))
            ->when($request->brand, fn($q) => $q->whereHas('brand', fn($q) => $q->where('slug', $request->brand)))
            ->when($request->min_price, fn($q) => $q->where('price', '>=', $request->min_price))
            ->when($request->max_price, fn($q) => $q->where('price', '<=', $request->max_price))
            ->when($request->in_stock, fn($q) => $q->where('stock', '>', 0))
            ->when($request->featured, fn($q) => $q->where('is_featured', true))
            ->when($request->boolean('has_image'), fn($q) => $q->whereNotNull('og_image')->where('og_image', '<>', ''))
            ->when($request->collection, fn($q) => $q->whereIn('id', $catalog->items()->filter(fn($p) => $catalog->group($p) === $request->collection)->pluck('id')))
            ->when($request->q, fn($q) => $q->where('name', 'like', '%' . $request->q . '%'))
            ->orderBy(match($request->sort ?? 'newest') {
                'price_asc' => 'price',
                'price_desc' => 'price',
                'rating' => 'rating',
                'popular' => 'sale_count',
                default => 'created_at',
            }, str_ends_with($request->sort ?? '', '_asc') ? 'asc' : 'desc')
            ->orderByDesc('id')
            ->paginate($request->per_page ?? 20);

        $products->getCollection()->each(fn ($product) => $product->setAttribute('collection_slug', $catalog->group($product)));

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show(string $slug)
    {
        $product = \App\Models\Product::active()
            ->with(['seller', 'store', 'category', 'brand', 'variants', 'images'])
            ->where('slug', $slug)
            ->firstOrFail();

        $product->increment('view_count');

        return response()->json(['success' => true, 'data' => $product]);
    }

    public function variants(string $slug)
    {
        $product = \App\Models\Product::active()->where('slug', $slug)->firstOrFail();
        return response()->json(['success' => true, 'data' => $product->variants()->where('is_active', true)->get()]);
    }
}
