<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(string $productSlug)
    {
        $product = \App\Models\Product::where('slug', $productSlug)->firstOrFail();

        $reviews = \App\Models\Review::where('product_id', $product->id)
            ->where('is_approved', true)
            ->with(['user:id,name,avatar'])
            ->orderByDesc('is_featured')
            ->orderByDesc('helpful_count')
            ->orderByDesc('created_at')
            ->paginate(10);

        $stats = [
            'avg' => round($reviews->avg('rating') ?? 0, 1),
            'total' => $reviews->total(),
            'distribution' => array_fill_keys(['1','2','3','4','5'], 0),
        ];

        return response()->json(['success' => true, 'data' => $reviews, 'stats' => $stats]);
    }

    public function store(Request $request, string $productSlug)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:200',
            'content' => 'nullable|string|max:2000',
            'pros' => 'nullable|string|max:500',
            'cons' => 'nullable|string|max:500',
        ]);

        $product = \App\Models\Product::where('slug', $productSlug)->firstOrFail();
        $user = $request->user();

        $review = \App\Models\Review::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'rating' => $request->rating,
            'title' => $request->title,
            'content' => $request->content,
            'pros' => $request->pros,
            'cons' => $request->cons,
            'is_approved' => false, // Moderasyon
        ]);

        // Teşvik: yorum yapana %5 kupon ver
        $rewardCode = 'YORUM5-' . strtoupper(\Illuminate\Support\Str::random(6));
        $review->update(['reward_coupon' => $rewardCode, 'reward_issued' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Yorumunuz onay için gönderildi. Teşekkürler!',
            'reward' => [
                'coupon' => $rewardCode,
                'discount' => '%5',
                'message' => 'Yorumunuz için %5 indirim kuponu kazandınız!',
            ],
        ], 201);
    }

    public function helpful(int $id)
    {
        \App\Models\Review::findOrFail($id)->increment('helpful_count');
        return response()->json(['success' => true]);
    }
}
