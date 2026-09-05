<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            if (!Schema::hasColumn('sellers', 'invite_token')) {
                $table->string('invite_token', 64)->nullable()->after('status');
                $table->foreignId('invited_by')->nullable()->after('invite_token')
                    ->constrained('users')->nullOnDelete();
                $table->timestamp('invited_at')->nullable()->after('invited_by');
                $table->timestamp('invite_expires_at')->nullable()->after('invited_at');
                $table->index('invite_token');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sellers', function (Blueprint $table) {
            $table->dropForeign(['invited_by']);
            $table->dropColumn(['invite_token', 'invited_by', 'invited_at', 'invite_expires_at']);
        });
    }
};
