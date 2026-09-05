<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->nullable()->constrained()->nullOnDelete();
            $table->tinyInteger('rating')->unsigned();  // 1-5
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->text('pros')->nullable();
            $table->text('cons')->nullable();
            $table->json('images')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_approved')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('helpful_count')->default(0);
            $table->unsignedInteger('reported_count')->default(0);
            $table->text('seller_reply')->nullable();
            $table->timestamp('seller_replied_at')->nullable();
            // Teşvik: yorum yapan kupon kazanır
            $table->string('reward_coupon')->nullable();
            $table->boolean('reward_issued')->default(false);
            // Pazar yeri import
            $table->string('source')->default('platform'); // platform|trendyol|hepsiburada
            $table->string('external_id')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['product_id', 'is_approved']);
            $table->unique(['user_id', 'order_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
