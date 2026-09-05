<?php

namespace App\Services\Cargo\Adapters;

class DhlAdapter extends AbstractCargoAdapter
{
    public function code(): string { return 'dhl'; }

    protected function trackingUrl(string $trackingNumber): string
    {
        return "https://www.dhl.com/tr-tr/home/tracking/tracking-express.html?tracking-id={$trackingNumber}";
    }
}
