<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Sunucu diski kalıcı olmadığından siparişe ait PDF'ler veritabanında arşivlenir.
        Schema::create('order_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('type', 50); // mesafeli-satis-sozlesmesi | on-bilgilendirme-formu
            $table->string('version', 30);
            $table->string('sha256', 64);
            $table->longText('contents'); // base64 PDF
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['order_id', 'type']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('membership_accepted_at')->nullable();
            $table->string('membership_agreement_version', 30)->nullable();
            $table->timestamp('kvkk_informed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['membership_accepted_at', 'membership_agreement_version', 'kvkk_informed_at']);
        });
        Schema::dropIfExists('order_documents');
    }
};
