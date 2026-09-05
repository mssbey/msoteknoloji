<?php

namespace App\Providers;

use App\Events\CartAbandoned;
use App\Events\OrderDelivered;
use App\Events\OrderPlaced;
use App\Events\OrderShipped;
use App\Listeners\SendOrderDeliveredNotifications;
use App\Listeners\SendOrderPlacedNotifications;
use App\Listeners\SendOrderShippedNotifications;
use App\Listeners\TriggerCartAbandonmentFlow;
use App\Services\Cargo\CargoManager;
use App\Services\Notifications\Contracts\SmsProvider;
use App\Services\Notifications\Contracts\WhatsAppProvider;
use App\Services\Notifications\Providers\LogSmsProvider;
use App\Services\Notifications\Providers\LogWhatsAppProvider;
use App\Services\Notifications\Providers\MetaWhatsAppProvider;
use App\Services\Notifications\Providers\NetgsmSmsProvider;
use App\Services\Payments\PaymentManager;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // SMS sürücüsü — credential yoksa log'a düşer
        $this->app->singleton(SmsProvider::class, function ($app) {
            $driver = config('notifications.sms.driver', 'log');
            if ($driver === 'netgsm') {
                $cfg = config('notifications.sms.netgsm', []);
                if (empty($cfg['usercode']) || empty($cfg['password'])) {
                    return new LogSmsProvider();
                }
                return new NetgsmSmsProvider($cfg);
            }
            return new LogSmsProvider();
        });

        // WhatsApp sürücüsü — credential yoksa log'a düşer
        $this->app->singleton(WhatsAppProvider::class, function ($app) {
            $driver = config('notifications.whatsapp.driver', 'log');
            if ($driver === 'meta_cloud') {
                $cfg = config('notifications.whatsapp.meta_cloud', []);
                $phoneId = (string) config('notifications.whatsapp.phone_id');
                if (empty($cfg['access_token']) || empty($phoneId)) {
                    return new LogWhatsAppProvider();
                }
                return new MetaWhatsAppProvider($cfg, $phoneId);
            }
            return new LogWhatsAppProvider();
        });

        $this->app->singleton(CargoManager::class);
        $this->app->singleton(PaymentManager::class);
    }

    public function boot(): void
    {
        Event::listen(CartAbandoned::class, TriggerCartAbandonmentFlow::class);
        Event::listen(OrderPlaced::class, SendOrderPlacedNotifications::class);
        Event::listen(OrderShipped::class, SendOrderShippedNotifications::class);
        Event::listen(OrderDelivered::class, SendOrderDeliveredNotifications::class);
    }
}
