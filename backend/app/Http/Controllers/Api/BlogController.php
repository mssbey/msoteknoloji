<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $posts = \App\Models\BlogPost::where('status', 'published')
            ->where('published_at', '<=', now())
            ->with(['category:id,name,slug', 'author:id,name'])
            ->when($request->category, fn($q) => $q->whereHas('category', fn($q) => $q->where('slug', $request->category)))
            ->when($request->q, fn($q) => $q->where('title', 'like', "%{$request->q}%"))
            ->when($request->featured, fn($q) => $q->where('is_featured', true))
            ->orderByDesc('published_at')
            ->paginate(12);

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function show(string $slug)
    {
        $post = \App\Models\BlogPost::where('slug', $slug)
            ->where('status', 'published')
            ->with(['category:id,name,slug', 'author:id,name'])
            ->firstOrFail();

        $post->increment('view_count');

        // İlgili yazılar
        $related = \App\Models\BlogPost::where('blog_category_id', $post->blog_category_id)
            ->where('id', '!=', $post->id)
            ->where('status', 'published')
            ->limit(3)
            ->get(['id', 'title', 'slug', 'excerpt', 'featured_image', 'published_at']);

        return response()->json([
            'success' => true,
            'data' => $post,
            'related' => $related,
        ]);
    }

    public function categories()
    {
        $categories = \App\Models\BlogCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }
}
