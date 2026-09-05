<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->enum('source', [
                'welcome_popup',   // %15 ilk alışveriş (lead capture)
                'box_insert',      // kutu içi kupon (diğer pazar yerinden gelen)
                'cart_recovery',   // sepet terk
                'review_reward',   // yorum yapana ödül
                'campaign',        // genel kampanya
                'manual',          // admin tanımladı
                'affiliate',       // affiliate üzerinden
            ])->default('manual');
            $table->enum('discount_type', ['percent', 'fixed'])->default('percent');
            $table->decimal('amount', 10, 2);
            $table->decimal('min_order_amount', 12, 2)->default(0);
            $table->decimal('max_discount_amount', 12, 2)->nullable();
            $table->unsignedInteger('usage_limit')->default(1);   // toplam kullanım
            $table->unsignedInteger('used_count')->default(0);
            $table->unsignedTinyInteger('per_user_limit')->default(1);
            // Sahiplik
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // kullanıcıya özel
            $table->foreignId('lead_id')->nullable()->constrained()->nullOnDelete(); // lead'e özel
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete(); // mağaza özelinde
            // Kapsam
            $table->json('product_ids')->nullable();
            $table->json('category_ids')->nullable();
            $table->boolean('first_order_only')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('campaign_name')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['source', 'is_active']);
            $table->index('expires_at');
        });

        Schema::create('coupon_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('discount_amount', 12, 2);
            $table->timestamp('redeemed_at')->useCurrent();
            $table->index(['coupon_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_redemptions');
        Schema::dropIfExists('coupons');
    }
};
