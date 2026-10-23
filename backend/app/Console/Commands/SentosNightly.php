<?php

namespace App\Console\Commands;

use App\Models\Store;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SentosNightly extends Command
{
    protected $signature = 'sentos:nightly';
    protected $description = 'Sentos kataloğunu atomik olarak yerel veritabanına günceller';

    public function handle(): int
    {
        if (!config('integrations.sentos.enabled')) {
            $this->info('Sentos entegrasyonu kapalı.');
            return self::SUCCESS;
        }

        $lock = Cache::lock('sentos:nightly', 86400);
        if (!$lock->get()) {
            $this->warn('Sentos güncellemesi zaten çalışıyor.');
            return self::SUCCESS;
        }

        try {
            $store = Store::where('slug', 'mso-teknoloji')->first()
                ?? Store::find(config('integrations.sentos.store_id'));
            $options = ['--approve' => true, '--images' => true, '--variants' => true];
            if ($store) {
                $options += ['--seller' => $store->seller_id, '--store' => $store->id];
            } else {
                $options['--ensure-store'] = true;
            }

            // Başarısız veya yarım aktarmada eski katalog aynen kalır.
            DB::transaction(function () use ($options) {
                if ($this->call('sentos:import', $options) !== self::SUCCESS) {
                    throw new \RuntimeException('Sentos aktarımı tamamlanamadı.');
                }
            });
            Cache::forever('sentos:last_successful_sync', now()->toIso8601String());
            Log::info('Sentos gece güncellemesi tamamlandı.');
            return self::SUCCESS;
        } catch (\Throwable $e) {
            Log::error('Sentos gece güncellemesi başarısız; önceki katalog korundu.', ['exception' => $e]);
            $this->error('Sentos güncellenemedi; önceki katalog korundu. Ayrıntılar uygulama günlüğünde.');
            return self::FAILURE;
        } finally {
            $lock->release();
        }
    }
}
