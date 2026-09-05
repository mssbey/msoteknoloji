<?php

namespace App\Services\Notifications\Contracts;

interface SmsProvider
{
    /**
     * @return array{success: bool, provider_message_id: ?string, error: ?string}
     */
    public function send(string $to, string $message, array $options = []): array;
}
