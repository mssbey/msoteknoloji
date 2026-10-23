<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Filament\Resources\UserResource\RelationManagers\OrdersRelationManager;
use App\Models\User;
use Filament\Actions\{EditAction, ViewAction};
use Filament\Forms\Components\{Select, TextInput, Toggle};
use Filament\Infolists\Components\{IconEntry, TextEntry};
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\{IconColumn, TextColumn};
use Filament\Tables\Filters\{Filter, SelectFilter, TernaryFilter};
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationLabel = 'Kullanıcılar';
    protected static ?string $modelLabel = 'Kullanıcı';
    protected static ?string $pluralModelLabel = 'Kullanıcılar';
    protected static ?string $recordTitleAttribute = 'name';
    protected static ?int $navigationSort = 1;

    public const ROLE_LABELS = [
        'super_admin' => 'Süper yönetici', 'admin' => 'Yönetici', 'seller' => 'Satıcı', 'customer' => 'Müşteri',
    ];

    /** Siparişlerde sayılan tutar: ödemesi alınmış ve iptal/iade edilmemiş siparişler. */
    private const SPENT_STATUSES = ['received', 'confirmed', 'processing', 'shipped', 'delivered'];

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-users';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Müşteriler';
    }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'email', 'phone'];
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->with('roles')
            ->withCount('orders')
            ->withSum(['orders as orders_total' => fn (Builder $q) => $q->whereIn('status', self::SPENT_STATUSES)], 'total')
            ->withMax('orders as last_order_at', 'created_at');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Hesap bilgileri')->columns(2)->schema([
                TextInput::make('name')->label('Ad soyad')->required()->maxLength(255),
                TextInput::make('email')->label('E-posta')->email()->required()->unique(ignoreRecord: true),
                TextInput::make('phone')->label('Telefon')->tel()->maxLength(20),
                Select::make('roles')->label('Roller')->multiple()->preload()
                    ->relationship('roles', 'name')
                    ->getOptionLabelFromRecordUsing(fn ($record) => static::ROLE_LABELS[$record->name] ?? $record->name),
                TextInput::make('password')->label('Yeni şifre')->password()->revealable()->minLength(8)
                    ->dehydrated(fn (?string $state) => filled($state))
                    ->required(fn (string $operation) => $operation === 'create')
                    ->helperText('Değiştirmek istemiyorsanız boş bırakın.'),
            ]),
            Section::make('İletişim izinleri')->columns(2)->schema([
                Toggle::make('sms_opt_in')->label('SMS ile bilgilendirme'),
                Toggle::make('whatsapp_opt_in')->label('WhatsApp ile bilgilendirme'),
            ]),
        ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Kullanıcı')->columns(3)->schema([
                TextEntry::make('name')->label('Ad soyad'),
                TextEntry::make('email')->label('E-posta')->copyable(),
                TextEntry::make('phone')->label('Telefon')->placeholder('-')->copyable(),
                TextEntry::make('roles.name')->label('Roller')->badge()
                    ->formatStateUsing(fn ($state) => static::ROLE_LABELS[$state] ?? $state)->placeholder('Müşteri'),
                TextEntry::make('created_at')->label('Kayıt tarihi')->dateTime('d.m.Y H:i'),
                TextEntry::make('email_verified_at')->label('E-posta doğrulama')->dateTime('d.m.Y H:i')->placeholder('Doğrulanmadı'),
            ]),
            Section::make('Alışveriş özeti')->columns(3)->schema([
                TextEntry::make('orders_count')->label('Sipariş sayısı'),
                TextEntry::make('orders_total')->label('Toplam harcama')->money('TRY')->placeholder('₺0,00'),
                TextEntry::make('last_order_at')->label('Son sipariş')->dateTime('d.m.Y H:i')->placeholder('-'),
            ]),
            Section::make('Sözleşme ve izinler')->columns(4)->schema([
                TextEntry::make('membership_accepted_at')->label('Üyelik sözleşmesi')->dateTime('d.m.Y H:i')->placeholder('-'),
                TextEntry::make('kvkk_informed_at')->label('KVKK aydınlatma')->dateTime('d.m.Y H:i')->placeholder('-'),
                IconEntry::make('sms_opt_in')->label('SMS izni')->boolean(),
                IconEntry::make('whatsapp_opt_in')->label('WhatsApp izni')->boolean(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label('Ad soyad')->searchable()->sortable(),
                TextColumn::make('email')->label('E-posta')->searchable()->copyable(),
                TextColumn::make('phone')->label('Telefon')->searchable()->placeholder('-')->toggleable(),
                TextColumn::make('roles.name')->label('Rol')->badge()
                    ->formatStateUsing(fn ($state) => static::ROLE_LABELS[$state] ?? $state)->placeholder('Müşteri'),
                TextColumn::make('orders_count')->label('Sipariş')->sortable(),
                TextColumn::make('orders_total')->label('Harcama')->money('TRY')->sortable()->placeholder('₺0,00'),
                TextColumn::make('last_order_at')->label('Son sipariş')->dateTime('d.m.Y')->sortable()->placeholder('-')->toggleable(),
                IconColumn::make('email_verified_at')->label('Doğrulandı')->boolean()
                    ->state(fn (User $record) => (bool) $record->email_verified_at)->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('created_at')->label('Kayıt')->dateTime('d.m.Y H:i')->sortable(),
            ])
            ->filters([
                SelectFilter::make('roles')->label('Rol')->relationship('roles', 'name')
                    ->getOptionLabelFromRecordUsing(fn ($record) => static::ROLE_LABELS[$record->name] ?? $record->name),
                TernaryFilter::make('has_orders')->label('Sipariş')
                    ->trueLabel('Siparişi olanlar')->falseLabel('Siparişi olmayanlar')
                    ->queries(true: fn (Builder $q) => $q->has('orders'), false: fn (Builder $q) => $q->doesntHave('orders')),
                Filter::make('recent')->label('Son 30 günde kayıt olanlar')
                    ->query(fn (Builder $q) => $q->where('created_at', '>=', now()->subDays(30))),
            ])
            ->recordActions([ViewAction::make(), EditAction::make()])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [OrdersRelationManager::class];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListUsers::route('/'),
            'view' => Pages\ViewUser::route('/{record}'),
            'edit' => Pages\EditUser::route('/{record}/edit'),
        ];
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) User::where('created_at', '>=', today())->count() ?: null;
    }

    public static function getNavigationBadgeTooltip(): ?string
    {
        return 'Bugün kayıt olanlar';
    }
}
