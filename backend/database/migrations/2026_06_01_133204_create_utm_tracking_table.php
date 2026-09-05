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
        Schema::create('utm_tracking', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('session_id', 100)->nullable();
            $table->string('utm_source')->nullable();   // airgunturk|instagram|facebook
            $table->string('utm_medium')->nullable();   // forum|social|print|email
            $table->string('utm_campaign')->nullable(); // banner|reels|kutu-kuponu
            $table->string('utm_content')->nullable();  // hangi banner/post
            $table->string('utm_term')->nullable();     // anahtar kelime
            $table->string('referrer')->nullable();
            $table->string('landing_page')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('device_type')->nullable();  // desktop|mobile|tablet
            $table->string('browser')->nullable();
            // Dönüşüm
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('order_total', 12, 2)->nullable();
            $table->boolean('converted')->default(false);
            $table->timestamp('converted_at')->nullable();
            $table->timestamp('first_seen_at')->useCurrent();
            $table->timestamps();
            $table->index(['utm_source', 'utm_campaign']);
            $table->index('converted');
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('utm_tracking');
    }
};
