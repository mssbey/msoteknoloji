<?php

namespace App\Console\Commands;

use App\Services\Integrations\Kargonomi\KargonomiClient;
use Illuminate\Console\Command;

class KargonomiRegisterWebhook extends Command
{
    protected $signature = 'kargonomi:register-webhook {--url= : Varsayılan APP_URL/api/webhooks/kargonomi}';
    protected $description = 'Kargonomi hesabına shipment.updated webhook adresini kaydeder';

    public function handle(KargonomiClient $client): int
    {
        $url = $this->option('url') ?: rtrim(config('app.url'), '/') . '/api/webhooks/kargonomi';
        $existing = collect($client->webhooks())->firstWhere('url', $url);
        if ($existing) {
            $this->info("Webhook zaten kayıtlı: {$url}");
            return self::SUCCESS;
        }

        $client->createWebhook('MSO Teknoloji sipariş durumu', $url);
        $this->info("Webhook kaydedildi: {$url}");
        $this->line('Kargonomi panelinde webhook gizli anahtarını KARGONOMI_WEBHOOK_SECRET olarak tanımlayın.');

        return self::SUCCESS;
    }
}
