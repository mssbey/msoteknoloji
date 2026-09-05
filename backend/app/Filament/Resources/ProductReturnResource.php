<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductReturnResource\Pages;
use App\Models\ProductReturn;
use Filament\Forms\Components\{Select, Textarea, TextInput};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Actions\{BulkActionGroup, DeleteBulkAction, EditAction};
use Filament\Tables\Columns\{TextColumn};
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ProductReturnResource extends Resource
{
    protected static ?string $model = ProductReturn::class;
    protected static ?string $navigationLabel = 'İadeler';
    protected static ?int $navigationSort = 3;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-arrow-uturn-left';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Sipariş';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('return_number')->label('İade No')->disabled(),
            Select::make('status')->label('Durum')->required()
                ->options([
                    'pending' => 'Bekliyor',
                    'approved' => 'Onaylı',
                    'rejected' => 'Reddedildi',
                    'shipped_back' => 'Geri Kargoda',
                    'received' => 'Teslim Alındı',
                    'refunded' => 'İade Edildi',
                ]),
            TextInput::make('cargo_company')->label('Kargo Firması'),
            TextInput::make('cargo_code')->label('Kargo Kodu')->copyable(),
            TextInput::make('refund_amount')->label('İade Tutarı')->numeric(),
            Textarea::make('admin_note')->label('Admin Notu')->rows(3),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('return_number')->label('İade No')->searchable()->copyable(),
            TextColumn::make('order.order_number')->label('Sipariş')->searchable(),
            TextColumn::make('user.name')->label('Müşteri')->searchable(),
            TextColumn::make('reason')->label('Sebep'),
            TextColumn::make('status')->label('Durum')->badge()
                ->color(fn ($s) => match($s) {
                    'pending' => 'warning',
                    'approved', 'shipped_back' => 'info',
                    'received', 'refunded' => 'success',
                    'rejected' => 'danger',
                    default => 'gray',
                }),
            TextColumn::make('cargo_code')->label('Kargo Kodu')->copyable(),
            TextColumn::make('created_at')->label('Tarih')->dateTime('d.m.Y')->sortable(),
        ])
        ->filters([
            SelectFilter::make('status')->options([
                'pending' => 'Bekliyor', 'approved' => 'Onaylı', 'rejected' => 'Reddedildi',
                'shipped_back' => 'Geri Kargoda', 'received' => 'Teslim Alındı', 'refunded' => 'İade Edildi',
            ]),
        ])
        ->actions([EditAction::make()])
        ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
        ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProductReturns::route('/'),
            'edit' => Pages\EditProductReturn::route('/{record}/edit'),
        ];
    }
}
