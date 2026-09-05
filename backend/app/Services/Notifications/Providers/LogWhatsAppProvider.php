<?php

namespace App\Services\Notifications\Providers;

use App\Services\Notifications\Contracts\WhatsAppProvider;
use Illuminate\Support\Facades\Log;

class LogWhatsAppProvider implements WhatsAppProvider
{
    public function sendText(string $to, string $message, array $options = []): array
    {
        Log::info('[WA:log:text]', compact('to', 'message', 'options'));
        return ['success' => true, 'provider_message_id' => 'log-' . uniqid(), 'error' => null];
    }

    public function sendTemplate(string $to, string $template, array $variables = [], array $options = []): array
    {
        Log::info('[WA:log:template]', compact('to', 'template', 'variables', 'options'));
        return ['success' => true, 'provider_message_id' => 'log-' . uniqid(), 'error' => null];
    }
}
