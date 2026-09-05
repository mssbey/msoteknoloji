<?php

namespace App\Filament\Widgets;

use App\Models\{Order, Seller, User, Product};
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        $todayRevenue = Order::whereDate('created_at', today())
            ->whereIn('status', ['delivered', 'processing', 'shipped'])
            ->sum('total');

        $todayOrders = Order::whereDate('created_at', today())->count();
        $activeSellers = Seller::where('status', 'approved')->count();
        $totalProducts = Product::where('status', 'approved')->where('is_active', true)->count();

        return [
            Stat::make('Bugünkü Ciro', number_format($todayRevenue, 2, ',', '.') . ' TL')
                ->description('+%12 dün ile karşılaştırma')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),

            Stat::make('Bugünkü Sipariş', $todayOrders)
                ->description('Toplam: ' . Order::count() . ' sipariş')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color('info'),

            Stat::make('Aktif Satıcı', $activeSellers)
                ->description(Seller::where('status', 'pending')->count() . ' onay bekliyor')
                ->descriptionIcon('heroicon-m-building-storefront')
                ->color('warning'),

            Stat::make('Aktif Ürün', number_format($totalProducts))
                ->description(Product::where('status', 'pending')->count() . ' onay bekliyor')
                ->descriptionIcon('heroicon-m-cube')
                ->color('primary'),
        ];
    }
}
