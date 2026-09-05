<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone', 20)->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'phone_verified_at')) {
                $table->timestamp('phone_verified_at')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'whatsapp_opt_in')) {
                $table->boolean('whatsapp_opt_in')->default(true)->after('phone_verified_at');
            }
            if (!Schema::hasColumn('users', 'sms_opt_in')) {
                $table->boolean('sms_opt_in')->default(true)->after('whatsapp_opt_in');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('sms_opt_in');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'phone_verified_at', 'whatsapp_opt_in', 'sms_opt_in', 'avatar']);
        });
    }
};
