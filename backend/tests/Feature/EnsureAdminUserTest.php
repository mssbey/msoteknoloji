<?php
namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EnsureAdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_and_updates_admin_from_config(): void
    {
        $this->artisan('admin:ensure')->assertSuccessful();
        $this->assertDatabaseCount('users', 0);

        config(['app.admin.email' => 'yonetici@example.test', 'app.admin.password' => 'kisa']);
        $this->artisan('admin:ensure')->assertFailed();

        config(['app.admin.password' => 'Ilk-Sifre-2026']);
        $this->artisan('admin:ensure')->assertSuccessful();
        $user = User::where('email', 'yonetici@example.test')->firstOrFail();
        $this->assertTrue($user->hasRole('super_admin'));
        $this->assertTrue(Hash::check('Ilk-Sifre-2026', $user->password));
        $this->assertTrue($user->canAccessPanel(\Filament\Facades\Filament::getPanel('admin')));

        config(['app.admin.password' => 'Yeni-Sifre-2026']);
        $this->artisan('admin:ensure')->assertSuccessful();
        $this->assertTrue(Hash::check('Yeni-Sifre-2026', $user->fresh()->password));
        $this->assertSame(1, User::count());
    }
}
