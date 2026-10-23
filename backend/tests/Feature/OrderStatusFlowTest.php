<?php
namespace Tests\Feature;

use App\Events\OrderPlaced;
use App\Jobs\SendOrderEmailJob;
use App\Mail\OrderStatusMail;
use App\Models\{NotificationLog, Order, Product, ProductReturn, User};
use App\Services\Orders\OrderStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\{Event, Mail};
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrderStatusFlowTest extends TestCase
{
    use RefreshDatabase;

    private function placeOrder(User $user): Order
    {
        Sanctum::actingAs($user);
        $address = ['first_name' => 'Deneme', 'last_name' => 'Müşteri', 'phone' => '05550000000', 'city' => 'İstanbul', 'district' => 'Kadıköy', 'address' => 'Deneme Mahallesi Test Sokak No 1'];
        $number = $this->postJson('/api/orders', [
            'billing_address' => $address, 'shipping_address' => $address, 'payment_method' => 'bank_transfer', 'legal_accepted' => true,
            'items' => [['product_id' => Product::orderBy('id')->first()->id, 'quantity' => 1]],
        ])->assertCreated()->json('data.order_number');

        return Order::where('order_number', $number)->firstOrFail();
    }

    private function sentTypes(): array
    {
        return Mail::sent(OrderStatusMail::class)->map(fn ($m) => $m->type)
            ->reject(fn ($type) => $type === 'order_documents')->values()->all();
    }

    public function test_order_moves_through_statuses_with_history_and_single_emails(): void
    {
        $this->seed();
        Mail::fake();
        Event::fake([OrderPlaced::class]);
        $user = User::factory()->create();
        $order = $this->placeOrder($user);
        $service = app(OrderStatusService::class);

        $this->assertSame('pending', $order->status);
        $this->assertSame(['pending'], $order->statusHistories()->pluck('status')->all());
        $this->assertSame([], $this->sentTypes());

        $order->markAsPaid('REF-1', 'bank_transfer', 'admin', 1);
        $order->markAsPaid('REF-1', 'bank_transfer', 'admin', 1);
        $this->assertSame('received', $order->fresh()->status);
        $this->assertSame(['order_received'], $this->sentTypes());

        // Tekrarlanan bildirim ve yeniden çalışan iş mükerrer e-posta üretmez.
        $service->transition($order, 'received');
        SendOrderEmailJob::dispatch($order->id, 'order_received', "order:{$order->id}:order_received");
        $this->assertSame(['order_received'], $this->sentTypes());

        try {
            $service->transition($order, 'shipped');
            $this->fail('Onaylanmamış sipariş kargoya verilememeli.');
        } catch (\DomainException) {
            $this->assertSame('received', $order->fresh()->status);
        }

        $service->transition($order, 'confirmed', 'admin', 1);
        $service->transition($order, 'processing', 'admin', 1);
        $service->transition($order, 'shipped', 'admin', 1, null, [
            'cargo_company' => 'Yurtiçi', 'cargo_tracking_number' => 'YT123', 'cargo_tracking_url' => 'https://kargo.example.test/YT123',
        ]);
        $service->transition($order, 'delivered');

        $this->assertSame(['order_received', 'order_confirmed', 'order_shipped', 'order_delivered'], $this->sentTypes());
        Mail::assertSent(OrderStatusMail::class, fn ($m) => $m->type === 'order_shipped' && str_contains($m->render(), 'https://kargo.example.test/YT123'));
        $this->assertSame('delivered', $order->items()->first()->status);
        $this->assertSame(5, NotificationLog::where('channel', 'email')->where('status', 'sent')->count()); // 4 durum + sözleşmeler

        $response = $this->getJson('/api/orders/' . $order->order_number)->assertOk();
        $this->assertSame(
            ['pending', 'received', 'confirmed', 'processing', 'shipped', 'delivered'],
            array_column($response->json('data.status_histories'), 'status'),
        );
        $response->assertJsonPath('data.cargo_tracking_url', 'https://kargo.example.test/YT123');

        // İade: talep → onay → ücret iadesi
        $return = ProductReturn::create([
            'return_number' => ProductReturn::generateNumber(), 'order_id' => $order->id,
            'order_item_id' => $order->items()->first()->id, 'user_id' => $user->id, 'seller_id' => $order->items()->first()->seller_id,
            'reason' => 'other', 'status' => 'pending',
        ]);
        $this->assertSame('return_requested', $order->fresh()->status);
        $return->update(['status' => 'approved']);
        $return->update(['status' => 'approved', 'admin_note' => 'tekrar']);
        $return->update(['status' => 'refunded', 'refund_amount' => 249]);

        $this->assertSame('refunded', $order->fresh()->status);
        $this->assertSame(
            ['order_received', 'order_confirmed', 'order_shipped', 'order_delivered', 'return_received', 'return_approved', 'return_refunded'],
            $this->sentTypes(),
        );
    }

    public function test_customer_cancel_records_history_and_restocks(): void
    {
        $this->seed();
        Mail::fake();
        $user = User::factory()->create();
        $stock = Product::orderBy('id')->first()->stock;
        $order = $this->placeOrder($user);

        $this->postJson("/api/orders/{$order->id}/cancel")->assertOk()->assertJsonPath('data.status', 'cancelled');
        $this->assertSame($stock, Product::orderBy('id')->first()->stock);
        $this->assertSame(['pending', 'cancelled'], $order->statusHistories()->pluck('status')->all());
        $this->assertSame('customer', $order->statusHistories()->latest('id')->first()->actor_type);
        $this->postJson("/api/orders/{$order->id}/cancel")->assertUnprocessable();
    }

    public function test_failed_email_does_not_block_status_and_is_retried(): void
    {
        $this->seed();
        Event::fake([OrderPlaced::class]);
        $user = User::factory()->create();
        $order = $this->placeOrder($user);

        config(['mail.default' => 'broken', 'mail.mailers.broken' => ['transport' => 'smtp-kapali']]);
        $order->markAsPaid('REF-2', 'bank_transfer');

        $this->assertSame('received', $order->fresh()->status);
        $log = NotificationLog::where('dedupe_key', "order:{$order->id}:order_received")->firstOrFail();
        $this->assertSame('failed', $log->status);
        $this->assertStringContainsString('smtp-kapali', $log->error);

        Mail::fake();
        $this->artisan('orders:retry-emails')->assertSuccessful();
        $this->assertSame('sent', $log->fresh()->status);
        Mail::assertSent(OrderStatusMail::class, 1);

        $this->artisan('orders:retry-emails')->assertSuccessful();
        Mail::assertSent(OrderStatusMail::class, 1);
    }

    public function test_admin_order_pages_render(): void
    {
        $this->seed();
        Event::fake([OrderPlaced::class]);
        Mail::fake();
        $order = $this->placeOrder(User::factory()->create());
        $admin = User::where('email', 'admin@msocommerce.com')->firstOrFail();
        // Sanctum::actingAs varsayılan guard'ı değiştirir; panel web guard'ını kullanır.
        config(['auth.defaults.guard' => 'web']);
        app('auth')->forgetGuards();

        $this->actingAs($admin)->get('/admin/orders')->assertOk()->assertSee($order->order_number);
        $this->actingAs($admin)->get("/admin/orders/{$order->id}")->assertOk()->assertSee('Durum geçmişi')->assertSee('Ödemeyi onayla');
    }

    public function test_order_contracts_are_previewed_archived_and_emailed_once(): void
    {
        $this->seed();
        Mail::fake();
        $user = User::factory()->create(['email' => 'sozlesme@example.test']);
        Sanctum::actingAs($user);
        $product = Product::orderBy('id')->first();
        $address = ['first_name' => 'Ayşe', 'last_name' => 'Yılmaz', 'phone' => '05550000000', 'city' => 'İzmir', 'district' => 'Konak', 'address' => 'Alsancak Mahallesi Kıbrıs Şehitleri Caddesi No 5'];
        $payload = ['billing_address' => $address, 'shipping_address' => $address, 'payment_method' => 'bank_transfer',
            'items' => [['product_id' => $product->id, 'quantity' => 2]]];

        $preview = $this->postJson('/api/orders/legal-preview', $payload)->assertOk()->json('data');
        $this->assertSame(['on-bilgilendirme-formu', 'mesafeli-satis-sozlesmesi'], array_column($preview, 'slug'));
        $html = $preview[1]['html'];
        $this->assertStringContainsString('Ayşe Yılmaz', $html);
        $this->assertStringContainsString('Alsancak Mahallesi Kıbrıs Şehitleri Caddesi No 5, Konak / İzmir', $html);
        $this->assertStringContainsString(e($product->name), $html);
        $this->assertStringNotContainsString('{{', $html);
        $this->assertDatabaseCount('orders', 0);

        $this->postJson('/api/orders', $payload)->assertUnprocessable()->assertJsonValidationErrors('legal_accepted');
        $number = $this->postJson('/api/orders', $payload + ['legal_accepted' => true])->assertCreated()->json('data.order_number');
        $order = Order::where('order_number', $number)->firstOrFail();

        $this->assertSame('v2026.10.22', $order->metadata['legal']['versions']['mesafeli-satis-sozlesmesi']);
        $this->assertSame(2, $order->documents()->count());
        Mail::assertSent(OrderStatusMail::class, fn ($m) => $m->type === 'order_documents' && count($m->attachments()) === 2);

        $pdf = $this->get("/api/orders/{$number}/documents/mesafeli-satis-sozlesmesi")->assertOk();
        $this->assertSame('application/pdf', $pdf->headers->get('Content-Type'));
        $this->assertStringStartsWith('%PDF', $pdf->getContent());
        $this->get("/api/orders/{$number}/documents/bilinmeyen")->assertNotFound();

        // İş tekrar çalışsa da belge ve e-posta çoğalmaz.
        \App\Jobs\GenerateOrderContractJob::dispatch($order->id);
        $this->assertSame(2, $order->documents()->count());
        Mail::assertSent(OrderStatusMail::class, fn ($m) => $m->type === 'order_documents');
        $this->assertSame(1, Mail::sent(OrderStatusMail::class, fn ($m) => $m->type === 'order_documents')->count());

        app('auth')->forgetGuards();
        Sanctum::actingAs(User::factory()->create());
        $this->get("/api/orders/{$number}/documents/mesafeli-satis-sozlesmesi")->assertNotFound();
    }

    public function test_registration_requires_membership_agreement(): void
    {
        $this->seed();
        $data = ['name' => 'Üye Test', 'email' => 'uye@example.test', 'password' => 'Deneme123!', 'password_confirmation' => 'Deneme123!'];
        $this->postJson('/api/auth/register', $data)->assertUnprocessable()->assertJsonValidationErrors('membership_agreement');
        $this->postJson('/api/auth/register', $data + ['membership_agreement' => true])->assertCreated();
        $user = User::where('email', 'uye@example.test')->firstOrFail();
        $this->assertNotNull($user->membership_accepted_at);
        $this->assertSame('v2026.10.22', $user->membership_agreement_version);
    }
}
