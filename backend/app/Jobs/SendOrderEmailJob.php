<?php

namespace App\Jobs;

use App\Mail\OrderStatusMail;
use App\Models\NotificationLog;
use App\Models\Order;
use App\Models\ProductReturn;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

/**
 * Sipariş/iade e-postasını gönderir. dedupe_key sayesinde aynı işlem için
 * e-posta bir kez gönderilir; başarısız gönderimler kuyruk tarafından yeniden denenir.
 */
class SendOrderEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public array $backoff = [60, 300, 900, 3600];

    public function __construct(
        public readonly int $orderId,
        public readonly string $type,
        public readonly string $dedupeKey,
        public readonly ?int $returnId = null,
    ) {}

    public function handle(): void
    {
        $order = Order::with(['items', 'user'])->find($this->orderId);
        $to = $order?->customer_email;
        if (!$to) return;
        $return = $this->returnId ? ProductReturn::with('orderItem')->find($this->returnId) : null;

        $log = $this->claimLog($order, $to);
        if (!$log) return;

        // Aynı anahtar için eşzamanlı iki işin ikisinin de göndermesini engeller.
        $lock = Cache::lock('order-email:' . $this->dedupeKey, 120);
        if (!$lock->get()) {
            $this->release(30);
            return;
        }

        try {
            if ($log->refresh()->status === 'sent') return;
            $mail = new OrderStatusMail($order, $this->type, $return);
            Mail::to($to)->send($mail);
            $log->update(['status' => 'sent', 'sent_at' => now(), 'error' => null, 'content' => $mail->subjectLine()]);
        } catch (\Throwable $e) {
            $log->update(['status' => 'failed', 'error' => mb_substr($e->getMessage(), 0, 2000)]);
            throw $e;
        } finally {
            $lock->release();
        }
    }

    private function claimLog(Order $order, string $to): ?NotificationLog
    {
        $attributes = [
            'channel' => 'email',
            'provider' => config('mail.default'),
            'to' => $to,
            'template' => $this->type,
            'status' => 'queued',
            'related_type' => $this->returnId ? ProductReturn::class : Order::class,
            'related_id' => $this->returnId ?? $order->id,
            'payload' => ['order_id' => $order->id, 'return_id' => $this->returnId],
        ];
        try {
            // Savepoint: PostgreSQL'de benzersizlik hatası dış transaction'ı bozmasın.
            $log = DB::transaction(fn () => NotificationLog::firstOrCreate(['dedupe_key' => $this->dedupeKey], $attributes));
        } catch (UniqueConstraintViolationException) {
            $log = NotificationLog::where('dedupe_key', $this->dedupeKey)->first();
        }

        return $log && $log->status !== 'sent' ? $log : null;
    }
}
