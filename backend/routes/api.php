<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\WhatsAppRedirectController;
use App\Http\Controllers\Api\CartRecoveryController;

// ── Auth ──────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

// ── Public Endpoints ─────────────────────────────────────
Route::get('categories', [CategoryController::class, 'index']);
Route::get('storefront', [\App\Http\Controllers\Api\StorefrontController::class, 'index']);
Route::get('categories/{slug}', [CategoryController::class, 'show']);

Route::get('products', [ProductController::class, 'index']);
Route::get('products/{slug}', [ProductController::class, 'show']);
Route::get('products/{slug}/variants', [ProductController::class, 'variants']);

Route::get('search', [SearchController::class, 'search']);
Route::get('search/suggestions', [SearchController::class, 'suggestions']);

// ── Lead Capture (Pop-up) ─────────────────────────────────
Route::post('leads', [LeadController::class, 'store']);

// ── Reviews ───────────────────────────────────────────────
Route::get('products/{slug}/reviews', [ReviewController::class, 'index']);
Route::post('reviews/{id}/helpful', [ReviewController::class, 'helpful']);

// ── Blog ──────────────────────────────────────────────────
Route::get('blog', [BlogController::class, 'index']);
Route::get('blog/categories', [BlogController::class, 'categories']);
Route::get('blog/{slug}', [BlogController::class, 'show']);

// ── Cart (misafir + auth) ─────────────────────────────────
Route::get('cart', [CartController::class, 'show']);
Route::post('cart/items', [CartController::class, 'add']);
Route::delete('cart/items', [CartController::class, 'remove']);
Route::post('cart/clear', [CartController::class, 'clear']);

// ── Coupon Validation ─────────────────────────────────────
Route::post('coupons/validate', [CouponController::class, 'validateCode']);

// ── Akıllı WhatsApp Buton ────────────────────────────────
Route::post('whatsapp/redirect', [WhatsAppRedirectController::class, 'build']);

// ── Cart Recovery Landing ─────────────────────────────────
Route::get('cart/recover/{token}', [CartRecoveryController::class, 'show']);
Route::post('cart/recover/{token}/restore', [CartRecoveryController::class, 'restore'])->middleware('auth:sanctum');

// ── Authenticated Endpoints ───────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/{orderNumber}', [OrderController::class, 'show']);
    Route::post('orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Yorum (auth gerektirir)
    Route::post('products/{slug}/reviews', [ReviewController::class, 'store']);

    // İade modülü
    Route::get('returns', [ReturnController::class, 'index']);
    Route::post('returns', [ReturnController::class, 'store']);
    Route::get('returns/{id}', [ReturnController::class, 'show']);
});

// ── Seller Endpoints ─────────────────────────────────────
Route::prefix('seller')->middleware(['auth:sanctum', 'role:seller|super_admin|admin'])->group(function () {
    Route::get('dashboard', fn() => response()->json(['message' => 'Seller dashboard coming soon']));
    Route::apiResource('products', App\Http\Controllers\Seller\ProductController::class);
    Route::get('orders', [App\Http\Controllers\Seller\OrderController::class, 'index']);

    // Mağaza özelleştirme (logo, renk, vitrin)
    Route::get('store', [App\Http\Controllers\Seller\StoreCustomizationController::class, 'show']);
    Route::put('store', [App\Http\Controllers\Seller\StoreCustomizationController::class, 'update']);
    Route::put('store/showcase', [App\Http\Controllers\Seller\StoreCustomizationController::class, 'updateShowcase']);

    // Abonelik
    Route::get('subscription', [App\Http\Controllers\Seller\SubscriptionController::class, 'index']);
    Route::post('subscription', [App\Http\Controllers\Seller\SubscriptionController::class, 'subscribe']);

    // Sentos entegrasyonu
    Route::get('integrations/sentos', [App\Http\Controllers\Seller\SentosIntegrationController::class, 'show']);
    Route::put('integrations/sentos', [App\Http\Controllers\Seller\SentosIntegrationController::class, 'update']);
    Route::post('integrations/sentos/sync', [App\Http\Controllers\Seller\SentosIntegrationController::class, 'sync']);

    // AI ürün asistanı
    Route::post('products/{id}/optimize', [App\Http\Controllers\Seller\AiOptimizerController::class, 'optimize']);
    Route::post('products/{id}/optimize/apply', [App\Http\Controllers\Seller\AiOptimizerController::class, 'apply']);
});
