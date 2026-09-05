<?php

namespace App\Services\Notifications\Providers;

use App\Services\Notifications\Contracts\SmsProvider;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NetgsmSmsProvider implements SmsProvider
{
    public function __construct(private readonly array $config) {}

    public function send(string $to, string $message, array $options = []): array
    {
        try {
            $response = Http::asForm()->get($this->config['endpoint'], [
                'usercode' => $this->config['usercode'],
                'password' => $this->config['password'],
                'gsmno' => $this->normalize($to),
                'message' => mb_substr($message, 0, 612),
                'msgheader' => $options['sender'] ?? config('notifications.sms.sender'),
                'dil' => 'TR',
            ]);

            $body = trim($response->body());
            // Netgsm: "00 <BulkId>" başarılı; aksi hata kodu döner
            if (str_starts_with($body, '00 ') || $body === '00') {
                return ['success' => true, 'provider_message_id' => trim(substr($body, 3)) ?: null, 'error' => null];
            }

            return ['success' => false, 'provider_message_id' => null, 'error' => "Netgsm hata kodu: {$body}"];
        } catch (\Throwable $e) {
            Log::error('Netgsm SMS gönderim hatası', ['error' => $e->getMessage(), 'to' => $to]);
            return ['success' => false, 'provider_message_id' => null, 'error' => $e->getMessage()];
        }
    }

    private function normalize(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '90')) $digits = substr($digits, 2);
        if (str_starts_with($digits, '0')) $digits = substr($digits, 1);
        return $digits;
    }
}
