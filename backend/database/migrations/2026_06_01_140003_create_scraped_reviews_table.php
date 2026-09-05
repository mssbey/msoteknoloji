<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scraped_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('match_key', 100)->nullable();   // SKU/barkod ile eşleştirme
            $table->enum('platform', ['trendyol', 'hepsiburada', 'n11', 'amazon', 'pttavm']);
            $table->string('external_review_id', 100)->nullable();
            $table->string('external_product_url', 500)->nullable();
            $table->tinyInteger('rating')->unsigned();
            $table->string('reviewer_name', 100)->nullable();
            $table->string('title')->nullable();
            $table->text('content');
            $table->json('images')->nullable();
            $table->date('review_date')->nullable();
            $table->boolean('is_verified_purchase')->default(false);
            $table->boolean('is_imported')->default(false);
            $table->foreignId('imported_review_id')->nullable()->constrained('reviews')->nullOnDelete();
            $table->timestamp('imported_at')->nullable();
            $table->timestamps();
            $table->index(['product_id', 'platform']);
            $table->index('match_key');
            $table->unique(['platform', 'external_review_id'], 'scraped_reviews_platform_extid_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scraped_reviews');
    }
};
