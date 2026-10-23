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
use Filament\Support\Colors\Color;
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
            ->brandName('MSO Teknoloji Yönetim')
            ->brandLogo(null)
            ->favicon(null)
            ->colors([
                'primary' => Color::Blue,
                'gray' => Color::Zinc,
            ])
            ->darkMode(true)
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
