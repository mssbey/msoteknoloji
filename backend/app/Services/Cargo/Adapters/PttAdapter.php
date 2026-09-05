<?php

namespace App\Services\Cargo\Adapters;

class PttAdapter extends AbstractCargoAdapter
{
    public function code(): string { return 'ptt'; }

    protected function trackingUrl(string $trackingNumber): string
    {
        return "https://gonderitakip.ptt.gov.tr/Track/?q={$trackingNumber}";
    }
}
