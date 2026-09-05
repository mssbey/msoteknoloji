<?php

namespace App\Services\Notifications;

use App\Models\NotificationLog;
use App\Services\Notifications\Contracts\WhatsAppProvider;

class WhatsAppService
{
    public function __construct(private readonly WhatsAppProvider $provider) {}

    public function sendText(string $to, string $message, array $options = [], ?object $related = null): NotificationLog
    {
        $log = $this->log($to, null, $message, $related, $options);
        $result = $this->provider->sendText($to, $message, $options);
        return $this->finalize($log, $result);
    }

    public function sendTemplate(
        string $to,
        string $template,
        array $variables = [],
        array $options = [],
        ?object $related = null,
    ): NotificationLog {
        $log = $this->log($to, $template, json_encode($variables, JSON_UNESCAPED_UNICODE), $related, $options + ['variables' => $variables]);
        $result = $this->provider->sendTemplate($to, $template, $variables, $options);
        return $this->finalize($log, $result);
    }

    /**
     * Toplu mesaj (kampanya). Her alıcı için ayrı log/satır.
     *
     * @param  iterable<array{to: string, variables?: array}>  $recipients
     */
    public function broadcast(string $template, iterable $recipients, array $options = []): array
    {
        $results = [];
        foreach ($recipients as $r) {
            $results[] = $this->sendTemplate(
                to: $r['to'],
                template: $template,
                variables: $r['variables'] ?? [],
                options: $options + ['campaign' => $options['campaign'] ?? null],
            );
        }
        return $results;
    }

    private function log(string $to, ?string $template, ?string $content, ?object $related, array $payload): NotificationLog
    {
        return NotificationLog::create([
            'channel' => 'whatsapp',
            'provider' => config('notifications.whatsapp.driver'),
            'to' => $to,
            'template' => $template,
            'content' => $content,
            'status' => 'queued',
            'related_type' => $related ? $related::class : null,
            'related_id' => $related?->getKey(),
            'payload' => $payload,
        ]);
    }

    private function finalize(NotificationLog $log, array $result): NotificationLog
    {
        $log->update([
            'status' => $result['success'] ? 'sent' : 'failed',
            'provider_message_id' => $result['provider_message_id'],
            'error' => $result['error'],
            'sent_at' => $result['success'] ? now() : null,
        ]);
        return $log;
    }
}
