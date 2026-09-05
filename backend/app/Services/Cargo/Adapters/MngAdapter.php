<?php

namespace App\Services\Cargo\Adapters;

class MngAdapter extends AbstractCargoAdapter
{
    public function code(): string { return 'mng'; }

    protected function trackingUrl(string $trackingNumber): string
    {
        return "https://kargotakip.mngkargo.com.tr/?Barkod={$trackingNumber}";
    }
}
