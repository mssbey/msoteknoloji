<?php

namespace App\Listeners;

use App\Events\CartAbandoned;
use App\Jobs\SendCartRecoveryMessageJob;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class TriggerCartAbandonmentFlow implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Sepet terk edildiğinde 1 saat sonra kurtarma mesajını kuyruğa alır.
     */
    public function handle(CartAbandoned $event): void
    {
        if (!$event->user?->phone) {
            return;
        }

        SendCartRecoveryMessageJob::dispatch($event->cart)
            ->delay(now()->addHour());
    }
}
