<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->get('q', '');
        if (strlen($q) < 2) {
            return response()->json(['success' => true, 'data' => ['results' => [], 'total' => 0]]);
        }

        $products = \App\Models\Product::active()
            ->where('name', 'like', "%{$q}%")
            ->orWhere('sku', 'like', "%{$q}%")
            ->with(['store:id,name,slug', 'category:id,name,slug'])
            ->limit(40)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $products,
                'total' => $products->count(),
                'query' => $q,
            ]
        ]);
    }

    public function suggestions(Request $request)
    {
        $q = $request->get('q', '');
        if (strlen($q) < 2) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $suggestions = \App\Models\Product::active()
            ->where('name', 'like', "%{$q}%")
            ->select('name', 'slug')
            ->limit(8)
            ->get()
            ->map(fn($p) => ['text' => $p->name, 'slug' => $p->slug]);

        return response()->json(['success' => true, 'data' => $suggestions]);
    }
}
