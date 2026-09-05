<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SellerResource\Pages;
use App\Models\Seller;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Forms\Components\{TextInput, Select, Section};
use Filament\Tables\Table;
use Filament\Tables\Columns\{TextColumn, IconColumn};
use Filament\Tables\Filters\SelectFilter;
use Filament\Actions\{EditAction, Action, BulkActionGroup, DeleteBulkAction};

class SellerResource extends Resource
{
    protected static ?string $model = Seller::class;
    protected static ?string $navigationLabel = 'Satıcılar';
    protected static ?int $navigationSort = 1;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-building-storefront';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Pazar Yeri';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Firma Bilgileri')
                ->schema([
                    TextInput::make('company_name')->label('Firma Adı')->required(),
                    TextInput::make('tax_number')->label('Vergi No')->required(),
                    TextInput::make('email')->label('E-posta')->email()->required(),
                    TextInput::make('phone')->label('Telefon'),
                    Select::make('status')->label('Durum')
                        ->options(['pending' => 'Onay Bekliyor', 'approved' => 'Onaylı', 'suspended' => 'Askıya Alındı', 'banned' => 'Yasaklandı'])
                        ->required(),
                    Select::make('package')->label('Paket')
                        ->options(['starter' => 'Starter', 'professional' => 'Professional', 'enterprise' => 'Enterprise'])
                        ->required(),
                ])
                ->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('company_name')->label('Firma')->searchable()->sortable(),
                TextColumn::make('user.email')->label('E-posta')->searchable(),
                TextColumn::make('status')->label('Durum')->badge()
                    ->color(fn ($state) => match($state) {
                        'pending' => 'warning', 'approved' => 'success',
                        'suspended', 'banned' => 'danger', default => 'gray',
                    })
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending' => 'Bekliyor', 'approved' => 'Onaylı',
                        'suspended' => 'Askıda', 'banned' => 'Yasaklı',
                        default => $state,
                    }),
                TextColumn::make('package')->label('Paket')->badge()
                    ->color(fn ($state) => match($state) {
                        'starter' => 'gray', 'professional' => 'info', 'enterprise' => 'warning', default => 'gray',
                    }),
                TextColumn::make('balance')->label('Bakiye')->money('TRY')->sortable(),
                TextColumn::make('created_at')->label('Kayıt')->date('d.m.Y')->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')->label('Durum')
                    ->options(['pending' => 'Bekliyor', 'approved' => 'Onaylı', 'suspended' => 'Askıda']),
            ])
            ->actions([
                Action::make('approve')->label('Onayla')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Seller $record) => $record->status === 'pending')
                    ->action(fn (Seller $record) => $record->update(['status' => 'approved', 'approved_at' => now()])),
                EditAction::make(),
            ])
            ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSellers::route('/'),
            'edit' => Pages\EditSeller::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) Seller::where('status', 'pending')->count() ?: null;
    }

    public static function getNavigationBadgeColor(): string
    {
        return 'warning';
    }
}
