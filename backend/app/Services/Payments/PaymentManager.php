<?php

namespace App\Services\Payments;

use App\Services\Payments\Contracts\PaymentGateway;
use App\Services\Payments\Gateways\IyzicoGateway;
use App\Services\Payments\Gateways\PayTrGateway;
use InvalidArgumentException;

class PaymentManager
{
    /** @var array<string, PaymentGateway> */
    private array $resolved = [];

    public function driver(?string $name = null): PaymentGateway
    {
        $name = $name ?? config('payments.default');
        return $this->resolved[$name] ??= $this->resolve($name);
    }

    private function resolve(string $name): PaymentGateway
    {
        $config = config("payments.providers.{$name}");
        if (!$config) {
            throw new InvalidArgumentException("Payment provider [{$name}] yapılandırılmamış.");
        }

        return match ($name) {
            'iyzico' => new IyzicoGateway($config),
            'paytr' => new PayTrGateway($config),
            default => throw new InvalidArgumentException("Bilinmeyen ödeme sürücüsü: {$name}"),
        };
    }
}
