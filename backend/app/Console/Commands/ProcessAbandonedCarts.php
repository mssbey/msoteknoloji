<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('carts:process-abandoned')]
#[Description('30 dakikadan uzun süre terk edilmiş sepetleri işaretler ve WhatsApp bildirim akışını tetikler')]
class ProcessAbandonedCarts extends Command
{
    public function handle(): void
    {
        // 30 dakika önce güncellenmiş, sipariş verilmemiş ve henüz abandoned olmayan sepetler
        $carts = \App\Models\Cart::where('updated_at', '<=', now()->subMinutes(30))
            ->where('is_abandoned', false)
            ->where('recovered', false)
            ->whereNotNull('items')
            ->get();

        $count = 0;
        foreach ($carts as $cart) {
            if (!empty($cart->items)) {
                $cart->markAbandoned();
                $count++;
            }
        }

        // Recovery: 24 saat önce abandoned olan ve mesaj gönderilmemiş sepetler
        // (İkinci adım: kupon gönder)
        $recoveryCandidates = \App\Models\Cart::where('is_abandoned', true)
            ->where('recovery_sent', false)
            ->where('recovered', false)
            ->where('abandoned_at', '<=', now()->subHours(24))
            ->whereNotNull('user_id')
            ->with('user')
            ->get();

        foreach ($recoveryCandidates as $cart) {
            // WhatsApp recovery mesajı gönder (queue'ya ekle)
            if ($cart->user?->phone) {
                \App\Jobs\SendCartRecoveryMessageJob::dispatchIf(
                    class_exists(\App\Jobs\SendCartRecoveryMessageJob::class),
                    $cart
                );
                $cart->update(['recovery_sent' => true, 'recovery_sent_at' => now()]);
            }
        }

        $this->info("✅ {$count} sepet abandoned olarak işaretlendi.");
        $this->info("📱 {$recoveryCandidates->count()} recovery mesajı kuyruğa alındı.");
    }
}
