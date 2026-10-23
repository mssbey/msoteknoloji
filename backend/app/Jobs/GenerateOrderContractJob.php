<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\Legal\LegalDocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Bus;

/** Siparişe ait sözleşme PDF'lerini arşivler ve müşteriye bir kez e-postalar. */
class GenerateOrderContractJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly int $orderId) {}

    public function handle(LegalDocumentService $legal): void
    {
        $order = Order::with(['items', 'user'])->find($this->orderId);
        if (!$order) return;

        $legal->archiveOrderDocuments($order);
        Bus::dispatch(new SendOrderEmailJob($order->id, 'order_documents', "order:{$order->id}:order_documents"));
    }
}
