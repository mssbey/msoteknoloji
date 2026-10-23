<?php

namespace App\Console\Commands;

use App\Jobs\SendOrderEmailJob;
use App\Models\NotificationLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;

class RetryOrderEmails extends Command
{
    protected $signature = 'orders:retry-emails {--max-attempts=5}';
    protected $description = 'Gönderilemeyen sipariş ve iade e-postalarını yeniden dener';

    public function handle(): int
    {
        $max = (int) $this->option('max-attempts');
        $retried = 0;

        NotificationLog::query()
            ->where('channel', 'email')
            ->whereNotNull('dedupe_key')
            ->where(fn ($q) => $q->where('status', 'failed')
                // Gönderim sırasında süreç çökerse kayıt 'queued' kalır.
                ->orWhere(fn ($q) => $q->where('status', 'queued')->where('updated_at', '<', now()->subMinutes(15))))
            ->orderBy('id')
            ->each(function (NotificationLog $log) use ($max, &$retried) {
                $payload = $log->payload ?? [];
                $attempts = (int) ($payload['attempts'] ?? 1);
                if ($attempts >= $max || empty($payload['order_id'])) return;

                $log->update(['payload' => ['attempts' => $attempts + 1] + $payload]);
                rescue(fn () => Bus::dispatch(new SendOrderEmailJob($payload['order_id'], $log->template, $log->dedupe_key, $payload['return_id'] ?? null)));
                $retried++;
            });

        $this->info("{$retried} e-posta yeniden denendi.");
        return self::SUCCESS;
    }
}
