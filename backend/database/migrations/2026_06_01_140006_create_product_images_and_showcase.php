<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ürün görsel galerisi + zorunlu alt_text alanları.
     */
    public function up(): void
    {
        Schema::create('product_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->string('path');                  // S3 / disk path
            $table->string('url', 500)->nullable();
            $table->string('alt_text');              // SEO için zorunlu
            $table->string('title')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->string('mime', 50)->nullable();
            $table->timestamps();
            $table->index(['product_id', 'is_primary']);
        });

        Schema::create('store_showcase_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['featured', 'campaign', 'new_arrivals', 'best_sellers', 'custom']);
            $table->string('title');
            $table->string('subtitle')->nullable();
            $table->json('product_ids')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('cta_url')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index(['store_id', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_showcase_sections');
        Schema::dropIfExists('product_images');
    }
};
