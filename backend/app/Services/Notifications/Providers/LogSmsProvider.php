<?php

namespace App\Services\Notifications\Providers;

use App\Services\Notifications\Contracts\SmsProvider;
use Illuminate\Support\Facades\Log;

/**
 * Sürücü 'log' iken kullanılır — testler ve geliştirme için.
 */
class LogSmsProvider implements SmsProvider
{
    public function send(string $to, string $message, array $options = []): array
    {
        Log::channel(config('logging.default'))->info('[SMS:log]', compact('to', 'message', 'options'));
        return [
            'success' => true,
            'provider_message_id' => 'log-' . uniqid(),
            'error' => null,
        ];
    }
}
