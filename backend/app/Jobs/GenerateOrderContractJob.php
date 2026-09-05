<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\Legal\LegalDocumentService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateOrderContractJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public readonly int $orderId) {}

    public function handle(LegalDocumentService $legal): void
    {
        $order = Order::with(['items', 'user'])->find($this->orderId);
        if (!$order) return;

        try {
            $path = $legal->generateSalesContract($order);
            $legal->sendContractByEmail($order, $path);
        } catch (\Throwable $e) {
            report($e);
        }
    }
}
