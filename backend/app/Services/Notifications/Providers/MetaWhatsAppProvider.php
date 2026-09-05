<?php

namespace App\Services\Notifications\Providers;

use App\Services\Notifications\Contracts\WhatsAppProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Meta WhatsApp Cloud API.
 * https://developers.facebook.com/docs/whatsapp/cloud-api
 */
class MetaWhatsAppProvider implements WhatsAppProvider
{
    public function __construct(
        private readonly array $config,
        private readonly string $phoneId,
    ) {}

    public function sendText(string $to, string $message, array $options = []): array
    {
        return $this->call([
            'messaging_product' => 'whatsapp',
            'to' => $this->normalize($to),
            'type' => 'text',
            'text' => ['body' => $message, 'preview_url' => true],
        ]);
    }

    public function sendTemplate(string $to, string $template, array $variables = [], array $options = []): array
    {
        $components = [];
        if (!empty($variables)) {
            $components[] = [
                'type' => 'body',
                'parameters' => array_map(
                    fn ($v) => ['type' => 'text', 'text' => (string) $v],
                    array_values($variables),
                ),
            ];
        }

        return $this->call([
            'messaging_product' => 'whatsapp',
            'to' => $this->normalize($to),
            'type' => 'template',
            'template' => [
                'name' => $template,
                'language' => ['code' => $options['lang'] ?? 'tr'],
                'components' => $components,
            ],
        ]);
    }

    private function call(array $payload): array
    {
        try {
            $url = sprintf(
                '%s/%s/%s/messages',
                $this->config['endpoint'],
                $this->config['api_version'],
                $this->phoneId,
            );

            $response = Http::withToken($this->config['access_token'])
                ->acceptJson()
                ->post($url, $payload);

            if ($response->successful()) {
                $id = $response->json('messages.0.id');
                return ['success' => true, 'provider_message_id' => $id, 'error' => null];
            }

            return ['success' => false, 'provider_message_id' => null, 'error' => $response->body()];
        } catch (\Throwable $e) {
            Log::error('Meta WhatsApp hatası', ['error' => $e->getMessage(), 'payload' => $payload]);
            return ['success' => false, 'provider_message_id' => null, 'error' => $e->getMessage()];
        }
    }

    private function normalize(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) $digits = '9' . substr($digits, 1);
        if (!str_starts_with($digits, '9')) $digits = '90' . $digits;
        return $digits;
    }
}
