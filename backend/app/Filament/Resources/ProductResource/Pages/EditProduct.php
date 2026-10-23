<?php

namespace App\Filament\Resources\ProductResource\Pages;

use App\Filament\Resources\ProductResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('storefront')->label('Sitede gör')->icon('heroicon-o-arrow-top-right-on-square')->color('gray')
                ->url(fn () => rtrim((string) config('app.frontend_url'), '/') . '/urun/' . $this->record->slug, shouldOpenInNewTab: true),
            Actions\DeleteAction::make(),
        ];
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        // Elle yapılan düzenleme gece Sentos aktarımında kaybolmasın; korumayı yalnızca kullanıcı kapatabilir.
        if (!$this->record->admin_locked) $data['admin_locked'] = true;
        return $data;
    }

    protected function afterSave(): void
    {
        ProductResource::syncPrimaryImage($this->record);
    }
}
