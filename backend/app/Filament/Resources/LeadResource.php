<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LeadResource\Pages;
use App\Models\Lead;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Forms\Components\TextInput;
use Filament\Actions\{BulkActionGroup, DeleteBulkAction};
use Filament\Tables\Columns\{IconColumn, TextColumn};
use Filament\Tables\Table;

class LeadResource extends Resource
{
    protected static ?string $model = Lead::class;
    protected static ?string $navigationLabel = 'Lead\'ler';
    protected static ?int $navigationSort = 6;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-user-plus';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Pazarlama';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Ad')->required(),
            TextInput::make('phone')->label('Telefon')->required(),
            TextInput::make('email')->label('E-posta'),
            TextInput::make('coupon_code')->label('Kupon Kodu')->disabled(),
            TextInput::make('source')->label('Kaynak'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('name')->label('Ad')->searchable(),
            TextColumn::make('phone')->label('Telefon')->searchable()->copyable(),
            TextColumn::make('email')->label('E-posta')->searchable(),
            TextColumn::make('coupon_code')->label('Kupon')->copyable(),
            IconColumn::make('coupon_used')->label('Kullanıldı')->boolean(),
            IconColumn::make('kvkk_consent')->label('KVKK')->boolean(),
            IconColumn::make('commercial_consent')->label('Ticari İleti')->boolean(),
            TextColumn::make('utm_source')->label('UTM Kaynak'),
            TextColumn::make('created_at')->label('Tarih')->dateTime('d.m.Y H:i')->sortable(),
        ])
        ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
        ->defaultSort('created_at', 'desc');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListLeads::route('/')];
    }
}
