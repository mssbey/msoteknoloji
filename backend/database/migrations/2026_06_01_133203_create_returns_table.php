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
        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('return_number', 30)->unique();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->enum('reason', [
                'defective', 'wrong_item', 'not_as_described',
                'changed_mind', 'damaged', 'other'
            ]);
            $table->text('description')->nullable();
            $table->json('images')->nullable();
            $table->enum('status', [
                'pending',       // Müşteri talebi oluşturdu
                'approved',      // Satıcı onayladı
                'rejected',      // Satıcı reddetti
                'shipped_back',  // Müşteri kargo verdi
                'received',      // Satıcı teslim aldı
                'refunded',      // Para iadesi yapıldı
            ])->default('pending');
            $table->string('cargo_company')->nullable(); // Iade kargo firması
            $table->string('cargo_code')->nullable();   // Iade kargo takip kodu
            $table->decimal('refund_amount', 12, 2)->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->text('admin_note')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
            $table->index(['seller_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('returns');
    }
};
