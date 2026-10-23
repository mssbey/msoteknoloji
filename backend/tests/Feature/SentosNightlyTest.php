<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Console\Scheduling\Schedule;
use Tests\TestCase;

class SentosNightlyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        config(['integrations.sentos.enabled' => true, 'integrations.sentos.base_url' => 'https://sentos.example.test/api',
            'integrations.sentos.api_key' => 'test', 'integrations.sentos.api_secret' => 'test']);
        Http::preventStrayRequests();
    }

    public function test_nightly_updates_local_catalog_and_public_reads_make_no_remote_calls(): void
    {
        $sku = Product::first()->sku;
        Http::fake([
            '*/categories' => Http::response([]),
            '*/products*' => Http::response([['id' => 10, 'sku' => $sku, 'name' => 'Gece güncellenen ürün', 'sale_price' => '120', 'stocks' => []]]),
        ]);
        $this->artisan('sentos:nightly')->assertSuccessful();
        $this->assertDatabaseHas('products', ['sku' => $sku, 'name' => 'Gece güncellenen ürün', 'price' => 120]);
        $count = count(Http::recorded());
        $this->getJson('/api/products')->assertOk();
        $this->getJson('/api/storefront')->assertOk();
        $this->getJson('/api/products/'.Product::first()->slug)->assertOk();
        $this->assertCount($count, Http::recorded());
    }

    public function test_partial_import_rolls_back_and_keeps_previous_catalog(): void
    {
        $product = Product::first();
        Http::fake([
            '*/categories' => Http::response([]),
            '*/products*' => Http::response([
                ['sku' => $product->sku, 'name' => 'Yarım güncelleme', 'sale_price' => '120'],
                ['name' => 'SKU eksik, aktarım başarısız'],
            ]),
        ]);
        $this->artisan('sentos:nightly')->assertFailed();
        $this->assertSame($product->name, $product->fresh()->name);
        $this->assertDatabaseCount('products', 2);
    }

    public function test_schedule_is_once_daily_at_turkey_midnight(): void
    {
        $events = collect(app(Schedule::class)->events())->filter(fn ($event) => str_contains($event->command ?? '', 'sentos:'));
        $this->assertCount(1, $events);
        $event = $events->first();
        $this->assertSame('0 0 * * *', $event->expression);
        $this->assertSame('Europe/Istanbul', $event->timezone);
    }
}
