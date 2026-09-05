<?php

namespace App\Services\Cargo\Adapters;

class ArasAdapter extends AbstractCargoAdapter
{
    public function code(): string { return 'aras'; }

    protected function trackingUrl(string $trackingNumber): string
    {
        return "https://kargotakip.araskargo.com.tr/mainpage.aspx?code={$trackingNumber}";
    }
}
