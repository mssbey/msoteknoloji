<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->enum('channel', ['sms', 'whatsapp', 'email', 'push']);
            $table->string('provider', 50)->nullable();
            $table->string('to', 100);
            $table->string('template', 100)->nullable();
            $table->text('content')->nullable();
            $table->enum('status', ['queued', 'sent', 'delivered', 'read', 'failed'])->default('queued');
            $table->string('provider_message_id', 100)->nullable();
            $table->text('error')->nullable();
            $table->string('related_type', 100)->nullable();   // App\Models\Order
            $table->unsignedBigInteger('related_id')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
            $table->index(['channel', 'status']);
            $table->index(['related_type', 'related_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
