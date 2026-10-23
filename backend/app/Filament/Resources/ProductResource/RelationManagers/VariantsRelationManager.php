<?php

namespace App\Filament\Resources\ProductResource\RelationManagers;

use App\Models\ProductVariant;
use Filament\Actions\{BulkActionGroup, CreateAction, DeleteAction, DeleteBulkAction, EditAction};
use Filament\Forms\Components\{TextInput, Toggle};
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\{ImageColumn, TextColumn, ToggleColumn};
use Filament\Tables\Table;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';
    protected static ?string $title = 'Varyantlar';
    protected static ?string $modelLabel = 'Varyant';
    protected static ?string $pluralModelLabel = 'Varyantlar';

    public static function optionLabel(ProductVariant $variant): string
    {
        $attributes = $variant->getAttribute('attributes') ?? [];
        $model = $attributes['model'] ?? null;
        $value = is_array($model) ? ($model['value'] ?? null) : $model;
        return collect([$value, $attributes['color'] ?? null, $attributes['size'] ?? null])->filter()->implode(' / ') ?: '-';
    }

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            Grid::make(2)->schema([
                TextInput::make('sku')->label('Stok kodu (SKU)')->required()->maxLength(100),
                TextInput::make('barcode')->label('Barkod')->maxLength(100),
                TextInput::make('attributes.model.name')->label('Seçenek adı')->placeholder('Örn. Model, Renk, Beden'),
                TextInput::make('attributes.model.value')->label('Seçenek değeri')->placeholder('Örn. Bordo'),
                TextInput::make('attributes.color')->label('Renk'),
                TextInput::make('image')->label('Görsel adresi')->url()->maxLength(255),
                TextInput::make('price')->label('Fiyat')->numeric()->prefix('₺')->required()
                    ->default(fn () => $this->getOwnerRecord()->price),
                TextInput::make('sale_price')->label('İndirimli fiyat')->numeric()->prefix('₺'),
                TextInput::make('cost_price')->label('Alış fiyatı')->numeric()->prefix('₺'),
                TextInput::make('stock')->label('Stok')->numeric()->integer()->default(0)->required(),
                TextInput::make('sort_order')->label('Sıra')->numeric()->integer()->default(0),
                Toggle::make('is_active')->label('Satışta')->default(true)->inline(false),
            ]),
        ]);
    }

    public function table(Table $table): Table
    {
        $lockOwner = fn () => $this->getOwnerRecord()->admin_locked ?: $this->getOwnerRecord()->update(['admin_locked' => true]);

        return $table
            ->recordTitleAttribute('sku')
            ->columns([
                ImageColumn::make('image')->label('')->square()->imageSize(40),
                TextColumn::make('sku')->label('SKU')->searchable()->copyable(),
                TextColumn::make('option')->label('Seçenek')->state(fn (ProductVariant $record) => static::optionLabel($record)),
                TextColumn::make('barcode')->label('Barkod')->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('price')->label('Fiyat')->money('TRY')->sortable(),
                TextColumn::make('sale_price')->label('İndirimli')->money('TRY')->placeholder('-'),
                TextColumn::make('stock')->label('Stok')->sortable()
                    ->color(fn ($state) => $state <= 0 ? 'danger' : null),
                ToggleColumn::make('is_active')->label('Satışta')->afterStateUpdated($lockOwner),
            ])
            ->defaultSort('sort_order')
            ->headerActions([CreateAction::make()->after($lockOwner)])
            ->recordActions([EditAction::make()->after($lockOwner), DeleteAction::make()])
            ->toolbarActions([BulkActionGroup::make([DeleteBulkAction::make()])]);
    }
}
