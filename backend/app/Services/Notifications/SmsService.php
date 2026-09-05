<?php

namespace App\Services\Notifications;

use App\Models\NotificationLog;
use App\Services\Notifications\Contracts\SmsProvider;

class SmsService
{
    public function __construct(private readonly SmsProvider $provider) {}

    public function send(string $to, string $message, array $options = [], ?object $related = null): NotificationLog
    {
        $log = NotificationLog::create([
            'channel' => 'sms',
            'provider' => config('notifications.sms.driver'),
            'to' => $to,
            'template' => $options['template'] ?? null,
            'content' => $message,
            'status' => 'queued',
            'related_type' => $related ? $related::class : null,
            'related_id' => $related?->getKey(),
            'payload' => $options,
        ]);

        $result = $this->provider->send($to, $message, $options);

        $log->update([
            'status' => $result['success'] ? 'sent' : 'failed',
            'provider_message_id' => $result['provider_message_id'],
            'error' => $result['error'],
            'sent_at' => $result['success'] ? now() : null,
        ]);

        return $log;
    }
}
