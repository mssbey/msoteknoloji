<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CategoryResource\Pages;
use App\Models\Category;
use Filament\Actions\{DeleteAction, EditAction};
use Filament\Forms\Components\{Select, Textarea, TextInput, Toggle};
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\{Get, Set};
use Filament\Schemas\Schema;
use Filament\Tables\Columns\{TextColumn, ToggleColumn};
use Filament\Tables\Filters\{SelectFilter, TernaryFilter};
use Filament\Tables\Table;
use Illuminate\Support\Str;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;
    protected static ?string $navigationLabel = 'Kategoriler';
    protected static ?string $modelLabel = 'Kategori';
    protected static ?string $pluralModelLabel = 'Kategoriler';
    protected static ?string $recordTitleAttribute = 'name';
    protected static ?int $navigationSort = 2;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-squares-2x2';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Katalog';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make()->columns(2)->schema([
                TextInput::make('name')->label('Kategori adı')->required()->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Get $get, Set $set, ?string $state, string $operation) => $operation === 'create' && blank($get('slug')) ? $set('slug', Str::slug((string) $state)) : null),
                TextInput::make('slug')->label('URL (slug)')->required()->unique(ignoreRecord: true),
                Select::make('parent_id')->label('Üst kategori')->relationship('parent', 'name')->searchable()->preload(),
                TextInput::make('sort_order')->label('Sıra')->numeric()->integer()->default(0),
                Textarea::make('description')->label('Açıklama')->rows(3)->columnSpanFull(),
                TextInput::make('image')->label('Görsel adresi')->url(),
                Toggle::make('is_active')->label('Aktif')->default(true)->inline(false),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('parent')->withCount('products'))
            ->columns([
                TextColumn::make('name')->label('Kategori')->searchable()->sortable(),
                TextColumn::make('parent.name')->label('Üst kategori')->placeholder('-'),
                TextColumn::make('products_count')->label('Ürün')->sortable(),
                TextColumn::make('sort_order')->label('Sıra')->sortable(),
                ToggleColumn::make('is_active')->label('Aktif'),
            ])
            ->filters([
                SelectFilter::make('parent_id')->label('Üst kategori')->relationship('parent', 'name'),
                TernaryFilter::make('is_active')->label('Aktif'),
            ])
            ->recordActions([
                EditAction::make(),
                // Kategoriye bağlı ürün varsa silinemez (veritabanı kısıtı).
                DeleteAction::make()->visible(fn (Category $record) => $record->products_count === 0),
            ])
            ->defaultSort('sort_order');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ManageCategories::route('/'),
        ];
    }
}
