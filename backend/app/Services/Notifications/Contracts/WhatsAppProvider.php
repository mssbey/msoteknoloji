<?php

namespace App\Services\Notifications\Contracts;

interface WhatsAppProvider
{
    /**
     * @return array{success: bool, provider_message_id: ?string, error: ?string}
     */
    public function sendText(string $to, string $message, array $options = []): array;

    /**
     * @return array{success: bool, provider_message_id: ?string, error: ?string}
     */
    public function sendTemplate(string $to, string $template, array $variables = [], array $options = []): array;
}
