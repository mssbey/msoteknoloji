<?php
namespace Tests\Feature;

use App\Events\OrderPlaced;
use App\Mail\OrderStatusMail;
use App\Models\{IntegrationEvent, Order, Product, User};
use App\Services\Integrations\Kargonomi\{KargonomiException, KargonomiShipmentService};
use App\Services\Orders\OrderStatusService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as HttpRequest;
use Illuminate\Support\Facades\{Event, Http, Mail};
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KargonomiTest extends TestCase
{
    use RefreshDatabase;

    private const BASE = 'https://app.kargonomi.com.tr/api/v1';

    protected function setUp(): void
    {
        parent::setUp();
        config([
            'integrations.kargonomi.enabled' => true,
            'integrations.kargonomi.token' => 'test-token',
            'integrations.kargonomi.webhook_secret' => 'gizli',
            'integrations.kargonomi.warehouse_id' => 12,
        ]);
        $this->seed();
        Mail::fake();
        Event::fake([OrderPlaced::class]);
    }

    private function confirmedOrder(): Order
    {
        Sanctum::actingAs(User::factory()->create());
        $address = ['first_name' => 'Deneme', 'last_name' => 'Müşteri', 'phone' => '+90 555 000 00 00', 'city' => 'İSTANBUL', 'district' => 'Kadıköy', 'address' => 'Deneme Mahallesi Test Sokak No 1'];
        $number = $this->postJson('/api/orders', [
            'billing_address' => $address, 'shipping_address' => $address, 'payment_method' => 'bank_transfer', 'legal_accepted' => true,
            'items' => [['product_id' => Product::first()->id, 'quantity' => 2]],
        ])->assertCreated()->json('data.order_number');
        $order = Order::where('order_number', $number)->firstOrFail();
        $order->markAsPaid('REF', 'bank_transfer');
        app(OrderStatusService::class)->transition($order, 'confirmed', 'admin', 1);

        return $order->fresh();
    }

    private function fakeApi(array $confirmResponse): void
    {
        Http::fake([
            self::BASE . '/states' => Http::response(['data' => [['id' => 6, 'name' => 'Ankara'], ['id' => 34, 'name' => 'İstanbul']]]),
            self::BASE . '/cities/34' => Http::response(['data' => [['id' => 440, 'name' => 'KADIKÖY'], ['id' => 441, 'name' => 'Üsküdar']]]),
            self::BASE . '/shipments' => Http::response(['data' => ['id' => 77, 'status' => 'draft']], 201),
            self::BASE . '/confirm-shipping-price' => Http::response(['data' => $confirmResponse]),
            self::BASE . '/shipments/77' => Http::response(['data' => ['id' => 77, 'status' => 'webservice_shipment_delivered', 'shipping_provider_slug' => 'aras', 'shipping_webservice_tracking_code' => 'ARS1']]),
        ]);
    }

    private function webhook(array $shipment, string $key, ?string $signature = null)
    {
        $body = json_encode(['meta' => ['idempotency_key' => $key, 'attempt_number' => 1, 'webhook' => ['event_type' => 'shipment.updated']], 'shipment' => $shipment]);

        return $this->call('POST', '/api/webhooks/kargonomi', [], [], [], [
            'CONTENT_TYPE' => 'application/json',
            'HTTP_X_WEBHOOK_SIGNATURE' => $signature ?? hash_hmac('sha256', $body, 'gizli'),
        ], $body);
    }

    private function sentTypes(): array
    {
        return Mail::sent(OrderStatusMail::class)->map(fn ($m) => $m->type)
            ->reject(fn ($t) => $t === 'order_documents')->values()->all();
    }

    public function test_barcode_creation_does_not_mark_order_as_shipped(): void
    {
        $order = $this->confirmedOrder();
        $this->fakeApi(['id' => 77, 'status' => 'webservice_order_created', 'shipping_provider_name' => 'Aras Kargo',
            'shipping_provider_slug' => 'aras', 'shipping_webservice_tracking_code' => 'ARS1']);

        $order = app(KargonomiShipmentService::class)->createShipment($order, 1);

        $this->assertSame('processing', $order->status);
        $this->assertSame(77, (int) $order->kargonomi_shipment_id);
        $this->assertSame('webservice_order_created', $order->cargo_status);
        $this->assertSame('Aras Kargo', $order->cargo_company);
        $this->assertSame('ARS1', $order->cargo_tracking_number);
        $this->assertSame('https://kargotakip.araskargo.com.tr/mainpage.aspx?code=ARS1', $order->cargo_tracking_url);
        $this->assertNotContains('order_shipped', $this->sentTypes());

        Http::assertSent(function (HttpRequest $request) {
            if ($request->url() !== self::BASE . '/shipments') return false;
            $s = $request['shipment'];
            return $request->hasHeader('Authorization', 'Bearer test-token')
                && $s['buyer_state_id'] === 34 && $s['buyer_city_id'] === 440
                && $s['buyer_phone'] === '5550000000' && $s['warehouse_id'] === 12
                && $s['packages'][0]['desi'] >= 2 && $s['buyer_name'] === 'Deneme Müşteri';
        });
        Http::assertSent(fn (HttpRequest $r) => str_ends_with($r->url(), '/confirm-shipping-price') && $r['shipping_provider_id'] == -1);

        $this->expectException(KargonomiException::class);
        app(KargonomiShipmentService::class)->createShipment($order, 1);
    }

    public function test_webhook_moves_order_on_carrier_pickup_and_delivery_once(): void
    {
        $order = $this->confirmedOrder();
        $this->fakeApi(['id' => 77, 'status' => 'webservice_order_created', 'shipping_provider_slug' => 'otomatik']);
        app(KargonomiShipmentService::class)->createShipment($order, 1);

        $this->webhook(['id' => 77, 'status' => 'webservice_shipment_started'], 'k1', 'yanlis')->assertUnauthorized();
        $this->assertSame('processing', $order->fresh()->status);

        $picked = ['id' => 77, 'status' => 'webservice_shipment_started', 'shipping_provider_name' => 'Sürat Kargo',
            'shipping_provider_slug' => 'surat', 'shipping_webservice_tracking_code' => 'SRT9'];
        $this->webhook($picked, 'k1')->assertOk();
        $this->webhook($picked, 'k1')->assertOk()->assertJsonPath('message', 'Daha önce işlendi.');

        $order->refresh();
        $this->assertSame('shipped', $order->status);
        $this->assertSame('Sürat Kargo', $order->cargo_company);
        $this->assertStringContainsString('SRT9', $order->cargo_tracking_url);
        $this->assertSame(1, collect($this->sentTypes())->filter(fn ($t) => $t === 'order_shipped')->count());
        Mail::assertSent(OrderStatusMail::class, fn ($m) => $m->type === 'order_shipped' && str_contains($m->render(), 'SRT9'));
        $this->assertSame('integration', $order->statusHistories()->where('status', 'shipped')->first()->actor_type);

        $this->webhook(['id' => 77, 'status' => 'webservice_shipment_delivered'], 'k2')->assertOk();
        $this->assertSame('delivered', $order->fresh()->status);
        $this->assertSame(2, IntegrationEvent::where('status', 'processed')->count());

        $this->webhook(['id' => 999, 'status' => 'webservice_shipment_started'], 'k3')->assertOk();
        $this->assertSame('ignored', IntegrationEvent::where('idempotency_key', 'kargonomi:k3')->value('status'));
    }

    public function test_sync_command_catches_up_missed_webhooks(): void
    {
        $order = $this->confirmedOrder();
        $this->fakeApi(['id' => 77, 'status' => 'webservice_order_created', 'shipping_provider_slug' => 'aras']);
        app(KargonomiShipmentService::class)->createShipment($order, 1);

        // Taşıyıcı alım bildirimi kaçmış, doğrudan teslim durumu geliyor.
        $this->artisan('kargonomi:sync')->assertSuccessful();

        $this->assertSame('delivered', $order->fresh()->status);
        $this->assertSame(['processing', 'shipped', 'delivered'], $order->statusHistories()->whereIn('status', ['processing', 'shipped', 'delivered'])->pluck('status')->all());
    }

    public function test_unmatched_district_gives_clear_error(): void
    {
        $order = $this->confirmedOrder();
        $order->update(['shipping_address' => ['district' => 'Olmayan'] + $order->shipping_address]);
        $this->fakeApi([]);

        try {
            app(KargonomiShipmentService::class)->createShipment($order, 1);
            $this->fail('Hata bekleniyordu');
        } catch (KargonomiException $e) {
            $this->assertStringContainsString('Olmayan', $e->getMessage());
        }
        $this->assertNull($order->fresh()->kargonomi_shipment_id);
        $this->assertSame('confirmed', $order->fresh()->status);
    }
}
