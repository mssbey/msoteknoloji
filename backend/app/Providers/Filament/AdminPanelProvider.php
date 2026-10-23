<?php

namespace App\Providers\Filament;

use Filament\Http\Middleware\Authenticate;
use Filament\Http\Middleware\AuthenticateSession;
use Filament\Http\Middleware\DisableBladeIconComponents;
use Filament\Http\Middleware\DispatchServingFilamentEvent;
use Filament\Navigation\NavigationItem;
use Filament\Support\Facades\FilamentTimezone;
use Filament\Pages\Dashboard;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Assets\Css;
use Filament\Support\Colors\Color;
use Filament\Enums\ThemeMode;
use Filament\Widgets\AccountWidget;
use Filament\Widgets\FilamentInfoWidget;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\PreventRequestForgery;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\View\Middleware\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            // Vitrinle aynı kimlik: MSO moru (#373071), antrasit, Saira başlık + Manrope gövde.
            ->brandName('MSO Teknoloji Yönetim')
            ->brandLogo(fn () => asset('images/brand/logo.png'))
            ->darkModeBrandLogo(fn () => asset('images/brand/logo-white.png'))
            ->brandLogoHeight('2.75rem')
            ->favicon(fn () => asset('images/brand/favicon.png'))
            ->colors([
                // Otomatik üretilen palet butonlarda açık lila tonu seçiyordu; tonlar vitrinin mor skalasından.
                'primary' => [
                    50 => '#f4f3fa', 100 => '#edebf7', 200 => '#dcd9ef', 300 => '#bfbae0', 400 => '#9a93cb',
                    500 => '#6f67ad', 600 => '#4a4590', 700 => '#373071', 800 => '#2c2660', 900 => '#241e52', 950 => '#171236',
                ],
                'gray' => Color::Slate,
                'success' => Color::hex('#2F7A4E'),
                'danger' => Color::hex('#B0463C'),
                'warning' => Color::hex('#9C7226'),
                'info' => Color::hex('#4A4590'),
            ])
            ->font('Manrope')
            ->assets([Css::make('mso-admin', resource_path('css/mso-admin.css'))])
            ->darkMode(true)
            ->defaultThemeMode(ThemeMode::Light)
            ->sidebarCollapsibleOnDesktop()
            ->bootUsing(function () {
                // Yönetim paneli her zaman Türkçe; tarihler İstanbul saatiyle gösterilir (veritabanı UTC kalır).
                app()->setLocale('tr');
                FilamentTimezone::set('Europe/Istanbul');
            })
            ->navigationGroups(['Sipariş', 'Katalog', 'Müşteriler', 'Pazarlama', 'Pazar Yeri'])
            ->navigationItems([
                NavigationItem::make('Siteye git')->icon('heroicon-o-globe-alt')->sort(100)
                    ->url(fn () => (string) config('app.frontend_url'), shouldOpenInNewTab: true),
            ])
            ->globalSearchKeyBindings(['ctrl+k', 'command+k'])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\Filament\Resources')
            ->discoverPages(in: app_path('Filament/Pages'), for: 'App\Filament\Pages')
            ->pages([
                Dashboard::class,
            ])
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\Filament\Widgets')
            ->widgets([
                AccountWidget::class,
                \App\Filament\Widgets\StatsOverviewWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                PreventRequestForgery::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([
                Authenticate::class,
            ]);
    }
}
