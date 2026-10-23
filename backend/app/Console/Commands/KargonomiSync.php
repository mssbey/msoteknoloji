<?php

namespace App\Console\Commands;

use App\Models\IntegrationEvent;
use App\Models\Order;
use App\Services\Integrations\Kargonomi\KargonomiClient;
use App\Services\Integrations\Kargonomi\KargonomiShipmentService;
use Illuminate\Console\Command;

/** Webhook kaçırılırsa açık gönderilerin durumunu Kargonomi'den çeker. */
class KargonomiSync extends Command
{
    protected $signature = 'kargonomi:sync';
    protected $description = 'Açık Kargonomi gönderilerinin durumunu siparişlere aktarır';

    public function handle(KargonomiClient $client, KargonomiShipmentService $shipments): int
    {
        if (!$client->enabled()) {
            $this->info('Kargonomi entegrasyonu kapalı.');
            return self::SUCCESS;
        }

        $updated = 0;
        Order::whereNotNull('kargonomi_shipment_id')
            ->whereIn('status', ['confirmed', 'processing', 'shipped'])
            ->orderBy('id')
            ->each(function (Order $order) use ($shipments, &$updated) {
                try {
                    $before = [$order->status, $order->cargo_status];
                    $order = $shipments->refresh($order);
                    if ($before !== [$order->status, $order->cargo_status]) $updated++;
                } catch (\Throwable $e) {
                    IntegrationEvent::create([
                        'provider' => 'kargonomi', 'event' => 'sync', 'status' => 'failed',
                        'order_id' => $order->id, 'error' => mb_substr($e->getMessage(), 0, 2000),
                    ]);
                    $this->warn("{$order->order_number}: {$e->getMessage()}");
                }
            });

        $this->info("{$updated} sipariş güncellendi.");
        return self::SUCCESS;
    }
}
