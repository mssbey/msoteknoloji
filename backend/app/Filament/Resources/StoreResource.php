<?php

namespace App\Filament\Resources;

use App\Filament\Resources\StoreResource\Pages;
use App\Models\Store;
use Filament\Forms\Components\{TextInput, Textarea, Toggle, ColorPicker, Section};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Actions\{BulkActionGroup, DeleteBulkAction, EditAction};
use Filament\Tables\Columns\{IconColumn, TextColumn};
use Filament\Tables\Table;

class StoreResource extends Resource
{
    protected static ?string $model = Store::class;
    protected static ?string $navigationLabel = 'Mağazalar';
    protected static ?int $navigationSort = 2;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-shopping-bag';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Pazar Yeri';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Kimlik')->columns(2)->schema([
                TextInput::make('name')->label('Mağaza Adı')->required()->maxLength(120),
                TextInput::make('slug')->label('Slug')->required()->unique(ignoreRecord: true),
                TextInput::make('custom_domain')->label('Özel Domain')->placeholder('magaza.com.tr'),
                TextInput::make('whatsapp_number')->label('Mağaza WhatsApp')->tel(),
                Textarea::make('description')->label('Açıklama')->rows(2)->columnSpanFull(),
            ]),

            Section::make('Görsel Kimlik')->columns(3)->schema([
                TextInput::make('logo')->label('Logo URL'),
                TextInput::make('banner')->label('Banner URL'),
                TextInput::make('favicon')->label('Favicon URL'),
                ColorPicker::make('theme_color')->label('Ana Renk'),
                ColorPicker::make('accent_color')->label('Vurgu Rengi'),
                ColorPicker::make('text_color')->label('Yazı Rengi'),
            ]),

            Section::make('Duyuru Şeridi')->columns(3)->schema([
                Toggle::make('announcement_active')->label('Aktif'),
                TextInput::make('announcement_text')->label('Metin')->columnSpan(2),
                ColorPicker::make('announcement_bg')->label('Arkaplan'),
            ]),

            Section::make('SEO')->columns(2)->schema([
                TextInput::make('seo_title')->label('SEO Başlık'),
                TextInput::make('seo_description')->label('SEO Açıklama'),
            ]),

            Section::make('Durum')->columns(2)->schema([
                Toggle::make('is_active')->label('Aktif')->default(true),
                Toggle::make('is_featured')->label('Öne Çıkan'),
                Toggle::make('welcome_coupon_active')->label('Mağaza Hoş Geldin Kuponu'),
                TextInput::make('welcome_coupon_percent')->label('Kupon %')->numeric()->minValue(1)->maxValue(50),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('name')->label('Mağaza')->searchable()->sortable(),
            TextColumn::make('seller.company_name')->label('Satıcı')->searchable(),
            TextColumn::make('total_products')->label('Ürün')->sortable(),
            TextColumn::make('rating')->label('Puan')->sortable(),
            IconColumn::make('is_active')->label('Aktif')->boolean(),
            TextColumn::make('is_featured')->label('Vitrin')->badge()
                ->color(fn ($s) => $s ? 'warning' : 'gray')
                ->formatStateUsing(fn ($s) => $s ? 'Öne çıkan' : '—'),
            TextColumn::make('created_at')->label('Kayıt')->date('d.m.Y')->sortable(),
        ])
        ->actions([EditAction::make()])
        ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
        ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStores::route('/'),
            'edit' => Pages\EditStore::route('/{record}/edit'),
        ];
    }
}
