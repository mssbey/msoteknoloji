<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cached_product_images', function (Blueprint $table) {
            $table->string('hash', 64)->primary();
            $table->string('source_hash', 64)->index();
            $table->text('source_url');
            $table->string('mime', 50);
            $table->longText('contents');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cached_product_images');
    }
};
