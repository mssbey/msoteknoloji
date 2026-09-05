<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Sentos entegrasyonu için satıcı bazlı bağlantı bilgileri & ürün eşleşmeleri.
        Schema::create('sentos_integrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained()->cascadeOnDelete();
            $table->string('api_key')->nullable();
            $table->string('api_secret')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('auto_sync')->default(true);
            $table->timestamp('last_sync_at')->nullable();
            $table->enum('last_sync_status', ['success', 'partial', 'failed'])->nullable();
            $table->unsignedInteger('synced_products_count')->default(0);
            $table->text('last_error')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->unique('seller_id');
        });

        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'sentos_id')) {
                $table->string('sentos_id', 80)->nullable()->index()->after('barcode');
            }
            if (!Schema::hasColumn('products', 'last_synced_at')) {
                $table->timestamp('last_synced_at')->nullable()->after('sentos_id');
            }
        });

        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'contract_url')) {
                $table->string('contract_url', 500)->nullable()->after('admin_note');
            }
            if (!Schema::hasColumn('orders', 'pre_info_url')) {
                $table->string('pre_info_url', 500)->nullable()->after('contract_url');
            }
        });

        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'cargo_company')) {
                $table->string('cargo_company', 50)->nullable()->after('status');
                $table->string('cargo_tracking_number', 100)->nullable()->after('cargo_company');
                $table->string('cargo_tracking_url', 500)->nullable()->after('cargo_tracking_number');
                $table->timestamp('shipped_at')->nullable()->after('cargo_tracking_url');
                $table->timestamp('delivered_at')->nullable()->after('shipped_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['cargo_company', 'cargo_tracking_number', 'cargo_tracking_url', 'shipped_at', 'delivered_at']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['contract_url', 'pre_info_url']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['sentos_id', 'last_synced_at']);
        });
        Schema::dropIfExists('sentos_integrations');
    }
};
