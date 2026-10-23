<?php

namespace Tests\Feature;

use App\Filament\Resources\ProductResource\Pages\{CreateProduct, EditProduct};
use App\Filament\Resources\ProductResource\RelationManagers\VariantsRelationManager;
use App\Models\{Category, Order, Product, ProductVariant, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;
use Tests\TestCase;

class AdminPanelTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->admin = User::role('super_admin')->firstOrFail();

        $customer = User::factory()->create(['name' => 'Deneme Müşteri', 'phone' => '05550000000']);
        $product = Product::orderBy('id')->firstOrFail();
        $address = ['first_name' => 'Deneme', 'last_name' => 'Müşteri', 'phone' => '05550000000', 'city' => 'İstanbul', 'district' => 'Kadıköy', 'address' => 'Deneme Mahallesi Test Sokak No 1'];
        $this->order = Order::create([
            'uuid' => (string) \Illuminate\Support\Str::uuid(), 'order_number' => 'MSO-TEST-1', 'user_id' => $customer->id,
            'billing_address' => $address, 'shipping_address' => $address,
            'subtotal' => 100, 'shipping_cost' => 0, 'total' => 100, 'status' => 'received', 'payment_status' => 'paid',
            'payment_method' => 'bank_transfer', 'coupon_code' => 'HOSGELDIN', 'coupon_discount' => 10,
        ]);
        $this->order->items()->create([
            'seller_id' => $product->seller_id, 'store_id' => $product->store_id, 'product_id' => $product->id,
            'name' => $product->name, 'sku' => $product->sku, 'quantity' => 1, 'unit_price' => 100, 'total_price' => 100,
            'variant_options' => ['model' => ['name' => 'Renk', 'value' => 'Bordo']],
        ]);
        $this->actingAs($this->admin);
    }

    public function test_every_admin_page_renders_in_turkish(): void
    {
        $product = Product::orderBy('id')->first();
        $customer = $this->order->user;

        $pages = [
            '/admin', '/admin/products', '/admin/products/create', "/admin/products/{$product->id}/edit",
            '/admin/categories', '/admin/users', "/admin/users/{$customer->id}", "/admin/users/{$customer->id}/edit",
            '/admin/orders', "/admin/orders/{$this->order->id}",
            '/admin/coupons', '/admin/coupons/create', '/admin/sellers', '/admin/stores', '/admin/product-returns', '/admin/leads',
        ];
        foreach ($pages as $page) {
            $this->get($page)->assertOk();
        }

        $this->get("/admin/orders/{$this->order->id}")
            ->assertSee('Deneme Mahallesi Test Sokak No 1')->assertSee('Kadıköy / İstanbul')
            ->assertSee('Renk: Bordo')->assertSee('HOSGELDIN')->assertSee('Havale / EFT');
        $this->get('/admin/users')->assertSee('Deneme Müşteri');
        $this->get('/admin/products')->assertSee('Ürünler')->assertSee('Kategori');
        $this->assertSame('tr', app()->getLocale());
    }

    public function test_editing_a_product_saves_and_protects_it_from_nightly_sentos_sync(): void
    {
        $product = Product::orderBy('id')->first();

        Livewire::test(EditProduct::class, ['record' => $product->getRouteKey()])
            ->fillForm(['name' => 'Panelden düzenlenen ürün', 'price' => 250, 'sale_price' => 199, 'stock' => 7])
            ->call('save')
            ->assertHasNoFormErrors();

        $product->refresh();
        $this->assertSame('Panelden düzenlenen ürün', $product->name);
        $this->assertSame('199.00', $product->sale_price);
        $this->assertTrue($product->admin_locked);

        config(['integrations.sentos.enabled' => true, 'integrations.sentos.base_url' => 'https://sentos.example.test/api',
            'integrations.sentos.api_key' => 'test', 'integrations.sentos.api_secret' => 'test']);
        Http::preventStrayRequests();
        Http::fake([
            '*/categories' => Http::response([]),
            '*/products*' => Http::response([['id' => 10, 'sku' => $product->sku, 'name' => 'Sentos adı', 'sale_price' => '120', 'stocks' => [['stock' => 3]]]]),
        ]);
        $this->artisan('sentos:nightly')->assertSuccessful();

        $product->refresh();
        $this->assertSame('Panelden düzenlenen ürün', $product->name);
        $this->assertSame('250.00', $product->price);
    }

    public function test_admin_can_create_a_product_with_an_image_and_a_variant(): void
    {
        Livewire::test(CreateProduct::class)
            ->fillForm([
                'name' => 'Yeni panel ürünü', 'slug' => 'yeni-panel-urunu', 'sku' => 'PANEL-1',
                'category_id' => Category::first()->id, 'status' => 'approved', 'price' => 99.9, 'stock' => 4,
                'images' => [['url' => 'https://cdn.example.test/a.jpg', 'is_primary' => true]],
            ])
            ->call('create')
            ->assertHasNoFormErrors();

        $product = Product::where('sku', 'PANEL-1')->firstOrFail();
        $this->assertSame('https://cdn.example.test/a.jpg', $product->og_image);
        $this->assertSame('Yeni panel ürünü', $product->images()->first()->alt_text);
        $this->assertTrue($product->admin_locked);

        Livewire::test(VariantsRelationManager::class, ['ownerRecord' => $product, 'pageClass' => EditProduct::class])
            ->callTableAction('create', data: ['sku' => 'PANEL-1-BRD', 'price' => 99.9, 'stock' => 2, 'attributes' => ['model' => ['name' => 'Renk', 'value' => 'Bordo']]])
            ->assertHasNoTableActionErrors();

        $variant = ProductVariant::where('sku', 'PANEL-1-BRD')->firstOrFail();
        $this->assertSame('Bordo', VariantsRelationManager::optionLabel($variant));
    }

    public function test_customers_cannot_open_the_panel(): void
    {
        $this->actingAs($this->order->user)->get('/admin')->assertForbidden();
    }
}
