<?php

namespace App\Services\Cargo;

use App\Services\Cargo\Adapters\ArasAdapter;
use App\Services\Cargo\Adapters\DhlAdapter;
use App\Services\Cargo\Adapters\MngAdapter;
use App\Services\Cargo\Adapters\PttAdapter;
use App\Services\Cargo\Adapters\YurtIciAdapter;
use App\Services\Cargo\Contracts\CargoProvider;
use InvalidArgumentException;

class CargoManager
{
    /** @var array<string, CargoProvider> */
    private array $resolved = [];

    public function driver(?string $name = null): CargoProvider
    {
        $name = $name ?? config('cargo.default');
        return $this->resolved[$name] ??= $this->resolve($name);
    }

    public function defaultDriver(): CargoProvider
    {
        return $this->driver();
    }

    public function returnDriver(): CargoProvider
    {
        return $this->driver(config('cargo.return_provider'));
    }

    private function resolve(string $name): CargoProvider
    {
        $config = config("cargo.providers.{$name}");
        if (!$config) {
            throw new InvalidArgumentException("Cargo driver [{$name}] yapılandırılmamış.");
        }

        return match ($config['driver']) {
            'yurtici' => new YurtIciAdapter($config),
            'aras' => new ArasAdapter($config),
            'mng' => new MngAdapter($config),
            'ptt' => new PttAdapter($config),
            'dhl' => new DhlAdapter($config),
            default => throw new InvalidArgumentException("Bilinmeyen kargo sürücüsü: {$config['driver']}"),
        };
    }
}
