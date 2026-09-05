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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id', 100)->nullable();
            $table->json('items');                         // [{product_id, variant_id, qty, price}]
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->string('coupon_code')->nullable();
            $table->boolean('is_abandoned')->default(false);
            $table->timestamp('abandoned_at')->nullable();
            $table->boolean('recovery_sent')->default(false);
            $table->timestamp('recovery_sent_at')->nullable();
            $table->boolean('recovered')->default(false); // Sipariş verildi mi
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->index('user_id');
            $table->index('session_id');
            $table->index(['is_abandoned', 'recovery_sent']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
