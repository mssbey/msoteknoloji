<?php

namespace App\Services\Cargo\Adapters;

class YurtIciAdapter extends AbstractCargoAdapter
{
    public function code(): string { return 'yurtici'; }

    protected function trackingUrl(string $trackingNumber): string
    {
        return "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code={$trackingNumber}";
    }
}
