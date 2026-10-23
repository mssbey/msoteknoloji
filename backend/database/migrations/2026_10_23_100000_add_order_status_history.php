<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Yeni durumlar (received, payment_failed, return_requested) için enum yerine string.
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check');
        }
        Schema::table('orders', function (Blueprint $table) {
            $table->string('status', 30)->default('pending')->change();
            $table->string('cargo_company', 50)->nullable()->after('payment_ref');
            $table->string('cargo_tracking_number', 100)->nullable()->after('cargo_company');
            $table->string('cargo_tracking_url', 500)->nullable()->after('cargo_tracking_number');
        });

        Schema::create('order_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('from_status', 30)->nullable();
            $table->string('status', 30);
            $table->string('actor_type', 20)->default('system'); // system | admin | customer | integration
            $table->unsignedBigInteger('actor_id')->nullable();
            $table->string('note', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['order_id', 'created_at']);
        });

        // Mükerrer e-posta engeli: aynı işlem anahtarı yalnızca bir kez kaydedilebilir.
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->string('dedupe_key', 150)->nullable()->unique()->after('template');
        });

        // Mevcut siparişler için başlangıç kaydı
        DB::table('orders')->orderBy('id')->select('id', 'status', 'created_at')->chunkById(500, function ($orders) {
            DB::table('order_status_histories')->insert($orders->map(fn ($o) => [
                'order_id' => $o->id,
                'status' => $o->status,
                'actor_type' => 'system',
                'note' => 'Geçmiş kaydı başlatıldı',
                'created_at' => $o->created_at ?? now(),
            ])->all());
        });
    }

    public function down(): void
    {
        Schema::table('notification_logs', function (Blueprint $table) {
            $table->dropUnique(['dedupe_key']);
            $table->dropColumn('dedupe_key');
        });
        Schema::dropIfExists('order_status_histories');
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['cargo_company', 'cargo_tracking_number', 'cargo_tracking_url']);
        });
    }
};
