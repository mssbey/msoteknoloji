<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('kargonomi_shipment_id')->nullable()->unique()->after('cargo_tracking_url');
            $table->string('cargo_status', 50)->nullable()->after('kargonomi_shipment_id');
        });

        // Gelen webhook'lar ve giden entegrasyon çağrıları; hata takibi ve mükerrer işlem engeli için.
        Schema::create('integration_events', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 30);
            $table->string('event', 60);
            $table->string('idempotency_key', 191)->nullable()->unique();
            $table->string('status', 20)->default('received'); // received | processed | ignored | failed
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->json('payload')->nullable();
            $table->text('error')->nullable();
            $table->timestamps();
            $table->index(['provider', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integration_events');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropUnique(['kargonomi_shipment_id']);
            $table->dropColumn(['kargonomi_shipment_id', 'cargo_status']);
        });
    }
};
