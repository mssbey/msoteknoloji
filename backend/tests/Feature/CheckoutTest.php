<?php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\{Product, User};

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_registration_login_order_and_stock_validation(): void
    {
        $this->seed();
        $credentials = ['name' => 'Sipariş Test', 'email' => 'checkout@example.test', 'password' => 'Deneme123!', 'password_confirmation' => 'Deneme123!', 'membership_agreement' => true];
        $this->postJson('/api/auth/register', $credentials)->assertCreated();
        $this->postJson('/api/auth/register', $credentials)->assertUnprocessable();
        $this->postJson('/api/auth/login', ['email' => $credentials['email'], 'password' => 'wrong'])->assertUnauthorized();
        $login = $this->postJson('/api/auth/login', $credentials)->assertOk();
        auth('web')->logout();
        app('auth')->forgetGuards();
        $headers = ['Authorization' => 'Bearer '.$login->json('data.token')];
        $this->getJson('/api/auth/me', $headers)->assertOk()->assertJsonPath('data.email', $credentials['email']);
        $address = ['first_name' => 'Deneme', 'last_name' => 'Müşteri', 'phone' => '05550000000', 'city' => 'İstanbul', 'district' => 'Kadıköy', 'address' => 'Deneme Mahallesi Test Sokak No 1'];
        $payload = ['billing_address' => $address, 'shipping_address' => $address, 'payment_method' => 'bank_transfer', 'legal_accepted' => true, 'items' => [['product_id' => Product::first()->id, 'quantity' => 999]]];
        $this->postJson('/api/orders', $payload, $headers)->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
        $payload['items'][0]['quantity'] = 1;
        $bad = $payload; $bad['shipping_address'] = [];
        $this->postJson('/api/orders', $bad, $headers)->assertUnprocessable();
        $bad = $payload; $bad['payment_method'] = 'paid';
        $this->postJson('/api/orders', $bad, $headers)->assertUnprocessable();
        $order = $this->postJson('/api/orders', $payload, $headers)->assertCreated()->assertJsonPath('data.payment_status', 'pending');
        $number = $order->json('data.order_number');
        $this->assertSame($number, $order->json('data.bank_transfer.reference'));
        $this->assertEquals(278.90, $order->json('data.total'));
        $this->assertSame(46, Product::first()->stock);
        $this->getJson('/api/orders/'.$number, $headers)->assertOk()->assertJsonPath('data.items.0.name', Product::first()->name);
        $this->getJson('/api/orders', $headers)->assertOk()->assertJsonPath('data.data.0.order_number', $number);
        $other = User::factory()->create();
        app('auth')->forgetGuards();
        $this->getJson('/api/orders/'.$number, ['Authorization' => 'Bearer '.$other->createToken('other')->plainTextToken])->assertNotFound();
        app('auth')->forgetGuards();
        $this->postJson('/api/orders/'.$order->json('data.id').'/cancel', [], $headers)->assertOk();
        $this->assertSame(47, Product::first()->stock);
        $this->postJson('/api/orders/'.$order->json('data.id').'/cancel', [], $headers)->assertUnprocessable();
        $this->assertSame(47, Product::first()->stock);
        $this->postJson('/api/auth/logout', [], $headers)->assertOk();
        $this->assertDatabaseMissing('personal_access_tokens', ['id' => explode('|', $login->json('data.token'))[0]]);
    }

    public function test_guests_cannot_order(): void
    {
        $this->postJson('/api/orders', [])->assertUnauthorized();
    }
}
