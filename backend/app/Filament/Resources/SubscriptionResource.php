<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SubscriptionResource\Pages;
use App\Models\Subscription;
use Filament\Forms\Components\{DateTimePicker, Select, TextInput, Toggle};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\{TextColumn};
use Filament\Tables\Table;

class SubscriptionResource extends Resource
{
    protected static ?string $model = Subscription::class;
    protected static ?string $navigationLabel = 'Abonelikler';
    protected static ?int $navigationSort = 4;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-credit-card';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Pazar Yeri';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('package')->required()->options([
                'starter' => 'Starter (500 ürün)',
                'professional' => 'Professional (2000 ürün)',
                'enterprise' => 'Enterprise (sınırsız)',
            ]),
            Select::make('billing_cycle')->required()->options([
                'monthly' => 'Aylık', 'yearly' => 'Yıllık',
            ]),
            TextInput::make('price')->numeric()->required(),
            Select::make('status')->required()->options([
                'active' => 'Aktif', 'trial' => 'Deneme',
                'past_due' => 'Vadesi Geçti', 'cancelled' => 'İptal',
                'expired' => 'Süresi Doldu',
            ]),
            DateTimePicker::make('current_period_start')->required(),
            DateTimePicker::make('current_period_end')->required(),
            Toggle::make('auto_renew')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('seller.company_name')->label('Satıcı')->searchable(),
            TextColumn::make('package')->label('Paket')->badge()
                ->color(fn ($s) => match($s) { 'starter' => 'gray', 'professional' => 'info', 'enterprise' => 'warning', default => 'gray' }),
            TextColumn::make('billing_cycle')->label('Cycle'),
            TextColumn::make('price')->money('TRY'),
            TextColumn::make('status')->badge()
                ->color(fn ($s) => match($s) { 'active' => 'success', 'trial' => 'info', 'past_due' => 'warning', 'cancelled', 'expired' => 'danger', default => 'gray' }),
            TextColumn::make('current_period_end')->label('Bitiş')->dateTime('d.m.Y')->sortable(),
        ])
        ->actions([EditAction::make()])
        ->defaultSort('current_period_end', 'desc');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSubscriptions::route('/'),
            'edit' => Pages\EditSubscription::route('/{record}/edit'),
        ];
    }
}
