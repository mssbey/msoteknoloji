<?php

namespace App\Filament\Widgets;

use App\Models\{Order, User, Product};
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverviewWidget extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        // Ödemesi alınmış ve iptal/iade edilmemiş siparişler ciroya sayılır. Gün sınırı İstanbul saatine göre.
        $paid = ['received', 'confirmed', 'processing', 'shipped', 'delivered'];
        $day = fn (int $daysAgo) => [
            now('Europe/Istanbul')->subDays($daysAgo)->startOfDay()->utc(),
            now('Europe/Istanbul')->subDays($daysAgo)->endOfDay()->utc(),
        ];
        $revenue = fn (int $daysAgo) => (float) Order::whereBetween('created_at', $day($daysAgo))->whereIn('status', $paid)->sum('total');
        $todayRevenue = $revenue(0);
        $yesterdayRevenue = $revenue(1);
        $change = $yesterdayRevenue > 0 ? round(($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue * 100) : null;

        $todayOrders = Order::whereBetween('created_at', $day(0))->count();
        $awaiting = Order::whereIn('status', ['pending', 'received'])->count();
        $newUsers = User::whereBetween('created_at', $day(0))->count();
        $activeProducts = Product::where('status', 'approved')->where('is_active', true)->count();
        $outOfStock = Product::where('status', 'approved')->where('is_active', true)->where('stock', '<=', 0)->count();

        return [
            Stat::make('Bugünkü ciro', '₺' . number_format($todayRevenue, 2, ',', '.'))
                ->description($change === null ? 'Dün: ₺' . number_format($yesterdayRevenue, 2, ',', '.') : ($change >= 0 ? '+' : '') . "%{$change} düne göre")
                ->descriptionIcon($change !== null && $change < 0 ? 'heroicon-m-arrow-trending-down' : 'heroicon-m-arrow-trending-up')
                ->color($change !== null && $change < 0 ? 'danger' : 'success'),

            Stat::make('Bugünkü sipariş', $todayOrders)
                ->description($awaiting . ' sipariş işlem bekliyor')
                ->descriptionIcon('heroicon-m-shopping-bag')
                ->color($awaiting ? 'warning' : 'info'),

            Stat::make('Bugün kayıt olan', $newUsers)
                ->description('Toplam ' . number_format(User::count(), 0, ',', '.') . ' kullanıcı')
                ->descriptionIcon('heroicon-m-users')
                ->color('info'),

            Stat::make('Satıştaki ürün', number_format($activeProducts, 0, ',', '.'))
                ->description($outOfStock . ' ürün stokta yok')
                ->descriptionIcon('heroicon-m-cube')
                ->color($outOfStock ? 'warning' : 'primary'),
        ];
    }
}
