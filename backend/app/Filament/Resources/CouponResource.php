<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CouponResource\Pages;
use App\Models\Coupon;
use Filament\Forms\Components\{TextInput, Select, Toggle, DateTimePicker, Section};
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Actions\{BulkActionGroup, DeleteBulkAction, EditAction};
use Filament\Tables\Columns\{IconColumn, TextColumn};
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class CouponResource extends Resource
{
    protected static ?string $model = Coupon::class;
    protected static ?string $navigationLabel = 'Kuponlar';
    protected static ?int $navigationSort = 5;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-ticket';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Pazarlama';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Kupon')->columns(2)->schema([
                TextInput::make('code')->label('Kod')->required()->unique(ignoreRecord: true),
                Select::make('source')->label('Kaynak')->required()
                    ->options([
                        'welcome_popup' => 'Pop-up (%15)',
                        'box_insert' => 'Kutu İçi',
                        'cart_recovery' => 'Sepet Kurtarma',
                        'review_reward' => 'Yorum Ödülü',
                        'campaign' => 'Kampanya',
                        'manual' => 'Manuel',
                        'affiliate' => 'Affiliate',
                    ]),
                Select::make('discount_type')->label('İndirim Tipi')
                    ->options(['percent' => 'Yüzde', 'fixed' => 'Sabit TL'])
                    ->required(),
                TextInput::make('amount')->label('Tutar')->numeric()->required(),
                TextInput::make('min_order_amount')->label('Min. Sepet')->numeric()->default(0),
                TextInput::make('max_discount_amount')->label('Max. İndirim')->numeric(),
                TextInput::make('usage_limit')->label('Toplam Limit')->numeric()->default(1),
                TextInput::make('per_user_limit')->label('Kullanıcı Başı')->numeric()->default(1),
                TextInput::make('campaign_name')->label('Kampanya Adı')->columnSpanFull(),
            ]),

            Section::make('Geçerlilik')->columns(3)->schema([
                Toggle::make('is_active')->label('Aktif')->default(true),
                Toggle::make('first_order_only')->label('Sadece İlk Sipariş'),
                DateTimePicker::make('starts_at')->label('Başlangıç'),
                DateTimePicker::make('expires_at')->label('Bitiş'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('code')->label('Kod')->searchable()->copyable(),
            TextColumn::make('source')->label('Kaynak')->badge(),
            TextColumn::make('discount_type')->label('Tip')
                ->formatStateUsing(fn ($s) => $s === 'percent' ? '%' : 'TL'),
            TextColumn::make('amount')->label('Tutar')->sortable(),
            TextColumn::make('used_count')->label('Kullanım')->sortable(),
            TextColumn::make('usage_limit')->label('Limit'),
            IconColumn::make('is_active')->label('Aktif')->boolean(),
            TextColumn::make('expires_at')->label('Bitiş')->dateTime('d.m.Y H:i')->sortable(),
        ])
        ->filters([
            SelectFilter::make('source')->label('Kaynak')->options([
                'welcome_popup' => 'Pop-up',
                'box_insert' => 'Kutu İçi',
                'cart_recovery' => 'Sepet Kurtarma',
                'review_reward' => 'Yorum Ödülü',
                'campaign' => 'Kampanya',
                'manual' => 'Manuel',
            ]),
        ])
        ->actions([EditAction::make()])
        ->bulkActions([BulkActionGroup::make([DeleteBulkAction::make()])])
        ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array { return []; }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListCoupons::route('/'),
            'create' => Pages\CreateCoupon::route('/create'),
            'edit' => Pages\EditCoupon::route('/{record}/edit'),
        ];
    }
}
