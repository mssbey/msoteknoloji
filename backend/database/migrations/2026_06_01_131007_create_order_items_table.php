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
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained()->restrictOnDelete();
            $table->foreignId('store_id')->constrained()->restrictOnDelete();
            $table->foreignId('product_id')->constrained()->restrictOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->string('name', 500);
            $table->string('sku', 100);
            $table->string('image')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 12, 2);
            $table->decimal('sale_price', 12, 2)->nullable();
            $table->decimal('total_price', 12, 2);
            $table->decimal('tax_rate', 5, 2)->default(18);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->enum('status', ['pending','processing','shipped','delivered','cancelled','refunded'])->default('pending');
            $table->decimal('commission_rate', 5, 2)->default(0);
            $table->decimal('commission_amount', 12, 2)->default(0);
            $table->decimal('seller_earning', 12, 2)->default(0);
            $table->json('variant_options')->nullable();
            $table->timestamps();
            $table->index('order_id');
            $table->index('seller_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
