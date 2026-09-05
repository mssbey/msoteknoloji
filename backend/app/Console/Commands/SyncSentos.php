<?php

namespace App\Console\Commands;

use App\Jobs\SyncSentosProductsJob;
use App\Models\SentosIntegration;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('sentos:sync {--integration= : Sadece belirli bir integration için}')]
#[Description('Sentos üzerindeki ürünleri MSO platformuna senkronize eder')]
class SyncSentos extends Command
{
    public function handle(): void
    {
        $query = SentosIntegration::query()->where('is_active', true)->where('auto_sync', true);
        if ($id = $this->option('integration')) {
            $query->where('id', $id);
        }

        $count = 0;
        foreach ($query->cursor() as $integration) {
            SyncSentosProductsJob::dispatch($integration->id);
            $count++;
        }
        $this->info("🔄 {$count} Sentos entegrasyonu için sync kuyruğa alındı.");
    }
}
