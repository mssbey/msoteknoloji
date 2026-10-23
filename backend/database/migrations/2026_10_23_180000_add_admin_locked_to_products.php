<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    // Yönetim panelinden düzenlenen ürünün içeriği gece Sentos aktarımında ezilmesin; stok güncellenmeye devam eder.
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('admin_locked')->default(false)->after('is_digital');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('admin_locked');
        });
    }
};
