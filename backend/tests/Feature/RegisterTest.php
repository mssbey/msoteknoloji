<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_new_customer_can_register_and_log_in_on_an_unseeded_database(): void
    {
        $this->postJson('/api/auth/register', [
            'name' => 'Yeni Müşteri', 'email' => 'yeni@example.test',
            'password' => 'Gizli-Sifre-2026', 'password_confirmation' => 'Gizli-Sifre-2026',
            'membership_agreement' => true,
        ])->assertCreated();

        $this->assertTrue(User::where('email', 'yeni@example.test')->firstOrFail()->hasRole('customer'));

        $token = $this->postJson('/api/auth/login', ['email' => 'yeni@example.test', 'password' => 'Gizli-Sifre-2026'])
            ->assertOk()->json('data.token');
        $this->withToken($token)->getJson('/api/auth/me')->assertOk();
    }
}
