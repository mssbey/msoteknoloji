<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use App\Models\Store;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        // Tek mağazalı kurulum: panelden eklenen ürün MSO mağazasına bağlanır.
        $store = Store::where('slug', 'mso-teknoloji')->first() ?? Store::query()->orderBy('id')->firstOrFail();

        // Sentos'ta olmayan ürün gece aktarımında değişmesin.
        $data['admin_locked'] = true;

        return $data + [
            'seller_id' => $store->seller_id,
            'store_id' => $store->id,
            'uuid' => (string) Str::uuid(),
            'approved_at' => ($data['status'] ?? null) === 'approved' ? now() : null,
            'approved_by' => ($data['status'] ?? null) === 'approved' ? auth()->id() : null,
        ];
    }

    protected function afterCreate(): void
    {
        ProductResource::syncPrimaryImage($this->record);
    }
}
