<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductImageController extends Controller
{
    public function __invoke(Request $request, string $hash)
    {
        $image = DB::table('cached_product_images')->where('hash', $hash)->firstOrFail();
        $response = response(base64_decode($image->contents), 200, [
            'Content-Type' => $image->mime,
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ]);
        $response->setEtag($hash);
        $response->isNotModified($request);
        return $response;
    }
}
