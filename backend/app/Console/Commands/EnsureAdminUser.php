<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

/**
 * ADMIN_EMAIL ve ADMIN_PASSWORD tanımlıysa yönetici hesabını oluşturur veya şifresini günceller.
 * Sunucu her açılışta çalıştırır (docker/start.sh); Render'da komut satırı gerekmez.
 */
class EnsureAdminUser extends Command
{
    protected $signature = 'admin:ensure';
    protected $description = 'Ortam değişkenlerindeki bilgilerle yönetici hesabını oluşturur veya günceller';

    public function handle(): int
    {
        $email = trim((string) config('app.admin.email'));
        $password = (string) config('app.admin.password');

        if ($email === '' || $password === '') {
            $this->info('ADMIN_EMAIL / ADMIN_PASSWORD tanımlı değil; yönetici hesabı değiştirilmedi.');
            return self::SUCCESS;
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($password) < 10) {
            $this->error('ADMIN_EMAIL geçerli bir e-posta, ADMIN_PASSWORD en az 10 karakter olmalı.');
            return self::FAILURE;
        }

        $user = User::firstOrNew(['email' => $email]);
        $created = !$user->exists;
        if ($created) $user->name = config('app.admin.name') ?: 'MSO Yönetici';
        // Aynı şifre her açılışta yeniden yazılmasın (oturumlar düşmesin).
        if ($created || !password_verify($password, $user->password)) {
            $user->password = $password; // modelde "hashed" cast
        }
        $user->save();

        $role = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        if (!$user->hasRole($role)) $user->assignRole($role);

        $this->info($created ? "Yönetici hesabı oluşturuldu: {$email}" : "Yönetici hesabı güncel: {$email}");
        return self::SUCCESS;
    }
}
