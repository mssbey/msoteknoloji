<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProductResource\Pages;
use App\Filament\Resources\ProductResource\RelationManagers\VariantsRelationManager;
use App\Models\Product;
use Filament\Actions\{Action, BulkAction, BulkActionGroup, DeleteBulkAction, EditAction};
use Filament\Forms\Components\{FileUpload, Placeholder, Repeater, RichEditor, Select, Textarea, TextInput, Toggle};
use Filament\Resources\Resource;
use Filament\Schemas\Components\{Grid, Image, Section, Tabs};
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Components\Utilities\{Get, Set};
use Filament\Schemas\Schema;
use Filament\Tables\Columns\{ImageColumn, TextColumn, ToggleColumn};
use Filament\Tables\Filters\{SelectFilter, TernaryFilter};
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductResource extends Resource
{
    protected static ?string $model = Product::class;
    protected static ?string $navigationLabel = 'Ürünler';
    protected static ?string $modelLabel = 'Ürün';
    protected static ?string $pluralModelLabel = 'Ürünler';
    protected static ?string $recordTitleAttribute = 'name';
    protected static ?int $navigationSort = 1;

    public const STATUS_LABELS = [
        'draft' => 'Taslak', 'pending' => 'Onay bekliyor', 'approved' => 'Yayında',
        'rejected' => 'Reddedildi', 'archived' => 'Arşivlendi',
    ];

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-cube';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Katalog';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'sku', 'barcode'];
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Tabs::make('Ürün')->columnSpanFull()->persistTabInQueryString()->tabs([
                Tab::make('Genel')->icon('heroicon-o-information-circle')->schema([
                    Grid::make(2)->schema([
                        TextInput::make('name')->label('Ürün adı')->required()->maxLength(500)->columnSpanFull()
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Get $get, Set $set, ?string $state, string $operation) => $operation === 'create' && blank($get('slug')) ? $set('slug', Str::slug((string) $state)) : null),
                        TextInput::make('slug')->label('URL (slug)')->required()->maxLength(500)
                            ->helperText('Ürün sayfasının adresi: /urun/slug'),
                        TextInput::make('sku')->label('Stok kodu (SKU)')->required()->maxLength(100),
                        TextInput::make('barcode')->label('Barkod')->maxLength(100),
                        Select::make('category_id')->label('Kategori')->relationship('category', 'name')
                            ->searchable()->preload()->required(),
                        Select::make('brand_id')->label('Marka')->relationship('brand', 'name')
                            ->searchable()->preload()
                            ->createOptionForm([TextInput::make('name')->label('Marka adı')->required()])
                            ->createOptionUsing(fn (array $data) => \App\Models\Brand::firstOrCreate(
                                ['slug' => Str::slug($data['name'])], ['name' => $data['name']],
                            )->getKey()),
                        Select::make('status')->label('Durum')->options(static::STATUS_LABELS)->default('approved')->required(),
                    ]),
                    Grid::make(3)->schema([
                        Toggle::make('is_active')->label('Satışta')->default(true)
                            ->helperText('Kapalıysa ürün sitede görünmez.'),
                        Toggle::make('is_featured')->label('Öne çıkan'),
                        Toggle::make('free_shipping')->label('Ücretsiz kargo'),
                    ]),
                    Section::make('Sentos senkronu')->compact()->schema([
                        Toggle::make('admin_locked')->label('Gece Sentos güncellemesi bu ürünün içeriğini değiştirmesin')
                            ->helperText('Paneldeki düzenlemeler korunur, stok Sentos\'tan güncellenmeye devam eder. Kaydettiğinizde otomatik açılır; kapatırsanız ürün bir sonraki gece Sentos\'taki haline döner.'),
                        Placeholder::make('last_synced_at')->label('Son Sentos güncellemesi')
                            ->content(fn (?Product $record) => $record?->last_synced_at ? \Illuminate\Support\Carbon::parse($record->last_synced_at)->format('d.m.Y H:i') : 'Sentos\'tan gelmedi'),
                    ])->columns(2),
                ]),

                Tab::make('Fiyat ve stok')->icon('heroicon-o-banknotes')->schema([
                    Grid::make(3)->schema([
                        TextInput::make('price')->label('Satış fiyatı')->numeric()->minValue(0)->prefix('₺')->required(),
                        TextInput::make('sale_price')->label('İndirimli fiyat')->numeric()->minValue(0)->prefix('₺')
                            ->lt('price')->helperText('Boş bırakılırsa indirim uygulanmaz.'),
                        TextInput::make('cost_price')->label('Alış fiyatı')->numeric()->minValue(0)->prefix('₺'),
                        TextInput::make('tax_rate')->label('KDV oranı')->numeric()->suffix('%')->default(20),
                        Toggle::make('tax_included')->label('Fiyata KDV dahil')->default(true)->inline(false),
                        TextInput::make('currency')->label('Para birimi')->default('TRY')->maxLength(10),
                        TextInput::make('stock')->label('Stok')->numeric()->integer()->default(0)
                            ->helperText('Varyantlı üründe stok varyantlardan izlenir.'),
                        TextInput::make('min_stock_alert')->label('Kritik stok uyarısı')->numeric()->integer()->default(5),
                        Toggle::make('allow_backorder')->label('Stok yokken satışa izin ver')->inline(false),
                    ]),
                    Grid::make(4)->schema([
                        TextInput::make('weight')->label('Ağırlık / desi')->numeric(),
                        TextInput::make('width')->label('Genişlik (cm)')->numeric(),
                        TextInput::make('height')->label('Yükseklik (cm)')->numeric(),
                        TextInput::make('depth')->label('Derinlik (cm)')->numeric(),
                    ]),
                ]),

                Tab::make('Açıklama')->icon('heroicon-o-document-text')->schema([
                    Textarea::make('short_description')->label('Kısa açıklama')->rows(3)->maxLength(1000),
                    RichEditor::make('description')->label('Ürün açıklaması')
                        ->fileAttachmentsDisk('public')->fileAttachmentsDirectory('products/descriptions')->fileAttachmentsVisibility('public'),
                ]),

                Tab::make('Görseller')->icon('heroicon-o-photo')->schema([
                    Repeater::make('images')->hiddenLabel()->relationship('images')
                        ->orderColumn('position')->reorderable()->collapsible()
                        ->grid(2)->addActionLabel('Görsel ekle')
                        ->itemLabel(fn (array $state) => ($state['is_primary'] ?? false) ? 'Kapak görseli' : ($state['alt_text'] ?? null))
                        ->schema([
                            Image::make(fn (Get $get) => $get('url') ?: asset('images/product-unavailable.svg'), 'Ürün görseli')
                                ->imageHeight('10rem'),
                            FileUpload::make('upload')->label('Bilgisayardan yükle')->image()->maxSize(8192)
                                ->disk('public')->directory('products')->visibility('public'),
                            TextInput::make('url')->label('veya görsel adresi')->url()->maxLength(500)
                                ->requiredWithout('upload'),
                            TextInput::make('alt_text')->label('Alternatif metin')->maxLength(255),
                            Toggle::make('is_primary')->label('Kapak görseli'),
                        ])
                        ->mutateRelationshipDataBeforeCreateUsing(fn (array $data, Get $get) => static::imageData($data, (string) $get('name')))
                        ->mutateRelationshipDataBeforeSaveUsing(fn (array $data, Get $get) => static::imageData($data, (string) $get('name'))),
                ]),

                Tab::make('SEO')->icon('heroicon-o-magnifying-glass')->schema([
                    TextInput::make('seo_title')->label('SEO başlığı')->maxLength(255),
                    Textarea::make('seo_description')->label('SEO açıklaması')->rows(3),
                    TextInput::make('seo_keywords')->label('Anahtar kelimeler'),
                ]),
            ]),
        ]);
    }

    /** Yüklenen dosyayı kalıcı adrese çevirir; Sentos görselleri adresiyle kalır. */
    public static function imageData(array $data, string $productName): array
    {
        $upload = $data['upload'] ?? null;
        if (is_array($upload)) $upload = reset($upload) ?: null;
        if ($upload) {
            $data['path'] = $upload;
            $data['url'] = Storage::disk('public')->url($upload);
        }
        unset($data['upload']);
        $data['path'] = $data['path'] ?? $data['url'] ?? '';
        $data['alt_text'] = filled($data['alt_text'] ?? null) ? $data['alt_text'] : $productName;
        return $data;
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['category', 'brand'])->withCount('variants'))
            ->columns([
                ImageColumn::make('og_image')->label('')->square()->imageSize(48)
                    ->defaultImageUrl(asset('images/product-unavailable.svg')),
                TextColumn::make('name')->label('Ürün')->searchable()->sortable()->limit(50)->wrap()
                    ->description(fn (Product $record) => $record->sku),
                TextColumn::make('sku')->label('SKU')->searchable()->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('barcode')->label('Barkod')->searchable()->toggleable(isToggledHiddenByDefault: true),
                // Sentos kategori adını tam yol olarak verir ("A > B > C"); listede son halka yeterli.
                TextColumn::make('category.name')->label('Kategori')->sortable()->toggleable()
                    ->formatStateUsing(fn (?string $state) => trim((string) \Illuminate\Support\Str::afterLast((string) $state, '>')))
                    ->tooltip(fn (Product $record) => $record->category?->name),
                TextColumn::make('brand.name')->label('Marka')->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('price')->label('Fiyat')->money('TRY')->sortable()
                    ->description(fn (Product $record) => $record->sale_price ? 'İndirimli: ₺' . number_format((float) $record->sale_price, 2, ',', '.') : null),
                TextColumn::make('stock')->label('Stok')->numeric()->sortable()
                    ->color(fn (Product $record) => $record->stock <= 0 ? 'danger' : ($record->stock <= $record->min_stock_alert ? 'warning' : null)),
                TextColumn::make('variants_count')->label('Varyant')->sortable()->toggleable(),
                ToggleColumn::make('is_active')->label('Satışta'),
                TextColumn::make('status')->label('Durum')->badge()
                    ->formatStateUsing(fn ($state) => static::STATUS_LABELS[$state] ?? $state)
                    ->color(fn ($state) => match ($state) {
                        'approved' => 'success', 'pending' => 'warning', 'rejected' => 'danger', default => 'gray',
                    }),
                TextColumn::make('admin_locked')->label('Sentos')->badge()->toggleable()
                    ->formatStateUsing(fn ($state) => $state ? 'Korunuyor' : 'Senkron')
                    ->color(fn ($state) => $state ? 'warning' : 'gray'),
                TextColumn::make('updated_at')->label('Güncellendi')->dateTime('d.m.Y H:i')->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category_id')->label('Kategori')->relationship('category', 'name')->searchable()->preload(),
                SelectFilter::make('brand_id')->label('Marka')->relationship('brand', 'name')->searchable()->preload(),
                SelectFilter::make('status')->label('Durum')->options(static::STATUS_LABELS),
                TernaryFilter::make('is_active')->label('Satışta'),
                TernaryFilter::make('stock')->label('Stok durumu')
                    ->trueLabel('Stokta var')->falseLabel('Stokta yok')
                    ->queries(
                        true: fn (Builder $q) => $q->where('stock', '>', 0),
                        false: fn (Builder $q) => $q->where('stock', '<=', 0),
                    ),
                TernaryFilter::make('admin_locked')->label('Sentos koruması'),
            ])
            ->recordActions([
                Action::make('storefront')->label('Sitede gör')->icon('heroicon-o-arrow-top-right-on-square')->color('gray')
                    ->url(fn (Product $record) => rtrim((string) config('app.frontend_url'), '/') . '/urun/' . $record->slug, shouldOpenInNewTab: true),
                Action::make('approve')->label('Onayla')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Product $record) => $record->status === 'pending')
                    ->action(fn (Product $record) => $record->update(['status' => 'approved', 'approved_at' => now(), 'approved_by' => auth()->id()])),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('activate')->label('Satışa aç')->icon('heroicon-o-eye')
                        ->action(fn (Collection $records) => $records->each->update(['is_active' => true]))->deselectRecordsAfterCompletion(),
                    BulkAction::make('deactivate')->label('Satıştan kaldır')->icon('heroicon-o-eye-slash')
                        ->action(fn (Collection $records) => $records->each->update(['is_active' => false]))->deselectRecordsAfterCompletion(),
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('updated_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [VariantsRelationManager::class];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProducts::route('/'),
            'create' => Pages\CreateProduct::route('/create'),
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

    /** Kapak görseli tek olsun ve vitrin kartlarında kullanılan og_image ile eşleşsin. */
    public static function syncPrimaryImage(Product $product): void
    {
        $images = $product->images()->get();
        $primary = $images->firstWhere('is_primary', true) ?? $images->first();
        if ($primary) {
            $product->images()->whereKeyNot($primary->getKey())->where('is_primary', true)->update(['is_primary' => false]);
            if (!$primary->is_primary) $primary->update(['is_primary' => true]);
        }
        $url = $primary?->url;
        if ($product->og_image !== $url) $product->forceFill(['og_image' => $url])->saveQuietly();
    }
}
