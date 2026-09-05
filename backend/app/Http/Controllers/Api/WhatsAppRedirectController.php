<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

/**
 * Akıllı WhatsApp Buton — her ürün/sayfa için pre-filled mesaj üretir.
 * Frontend bu endpoint'i çağırır ve kullanıcıyı wa.me linkine yönlendirir.
 */
class WhatsAppRedirectController extends Controller
{
    public function build(Request $request)
    {
        $data = $request->validate([
            'product_slug' => 'nullable|string',
            'page' => 'nullable|string|max:120',
            'store_id' => 'nullable|integer|exists:stores,id',
        ]);

        $product = !empty($data['product_slug'])
            ? Product::with('store')->where('slug', $data['product_slug'])->first()
            : null;

        $number = $product?->store?->whatsapp_number
            ?? optional($data['store_id'] ? \App\Models\Store::find($data['store_id']) : null)->whatsapp_number
            ?? config('marketplace.whatsapp_button.default_number');

        if ($product) {
            $template = config('marketplace.whatsapp_button.product_template');
            $message = strtr($template, [
                ':url' => config('app.frontend_url', config('app.url')) . '/urun/' . $product->slug,
                ':name' => $product->name,
            ]);
        } else {
            $template = config('marketplace.whatsapp_button.page_template');
            $message = strtr($template, [':page' => $data['page'] ?? 'site']);
        }

        $waNumber = preg_replace('/\D/', '', $number);
        if (str_starts_with($waNumber, '0')) $waNumber = '9' . substr($waNumber, 1);
        if (!str_starts_with($waNumber, '9')) $waNumber = '90' . $waNumber;

        return response()->json([
            'redirect_url' => 'https://wa.me/' . $waNumber . '?text=' . rawurlencode($message),
            'phone' => '+' . $waNumber,
            'message' => $message,
        ]);
    }
}
