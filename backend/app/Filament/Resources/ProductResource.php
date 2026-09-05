<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Models\Product;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Forms\Components\{TextInput, Textarea, Select, Section};
use Filament\Tables\Table;
use Filament\Tables\Columns\{TextColumn};
use Filament\Tables\Filters\SelectFilter;
use Filament\Actions\{EditAction, Action, BulkActionGroup, DeleteBulkAction};

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationLabel = 'Ürünler';
    protected static ?int $navigationSort = 2;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-cube';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Pazar Yeri';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Temel Bilgiler')
                ->schema([
                    TextInput::make('name')->label('Ürün Adı')->required()->columnSpanFull(),
                    TextInput::make('sku')->label('SKU')->required(),
                    TextInput::make('price')->label('Fiyat')->numeric()->prefix('₺')->required(),
                    TextInput::make('sale_price')->label('İndirimli Fiyat')->numeric()->prefix('₺'),
                    TextInput::make('stock')->label('Stok')->numeric()->default(0),
                    Select::make('status')->label('Durum')
                        ->options(['draft' => 'Taslak', 'pending' => 'Onay Bekliyor', 'approved' => 'Onaylı', 'rejected' => 'Reddedildi'])
                        ->required(),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Ürün')->searchable()->sortable()->limit(40),
                TextColumn::make('seller.company_name')->label('Satıcı')->searchable(),
                TextColumn::make('price')->label('Fiyat')->money('TRY')->sortable(),
                TextColumn::make('stock')->label('Stok')->sortable(),
                TextColumn::make('ai_score')->label('AI')->suffix('/100')->sortable(),
                TextColumn::make('status')->label('Durum')->badge()
                    ->color(fn ($state) => match($state) {
                        'draft' => 'gray', 'pending' => 'warning',
                        'approved' => 'success', 'rejected' => 'danger', default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'draft' => 'Taslak', 'pending' => 'Bekliyor',
                        'approved' => 'Onaylı', 'rejected' => 'Reddedildi',
                        default => $state,
                    }),
                TextColumn::make('created_at')->label('Tarih')->date('d.m.Y')->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->label('Durum')
                    ->options(['draft' => 'Taslak', 'pending' => 'Bekliyor', 'approved' => 'Onaylı', 'rejected' => 'Reddedildi']),
            ])
            ->actions([
                Action::make('approve')->label('Onayla')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Product $record) => $record->status === 'pending')
                    ->action(fn (Product $record) => $record->update(['status' => 'approved', 'approved_at' => now()])),
                Action::make('reject')->label('Reddet')->icon('heroicon-o-x-circle')->color('danger')
                    ->visible(fn (Product $record) => $record->status === 'pending')
                    ->action(fn (Product $record) => $record->update(['status' => 'rejected'])),
                EditAction::make(),
            ])
            ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'edit' => Pages\EditProduct::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) Product::where('status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string
    {
        return 'warning';
    }
}
