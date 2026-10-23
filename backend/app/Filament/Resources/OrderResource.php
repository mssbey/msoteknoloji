<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OrderResource\Pages;
use App\Models\Order;
use App\Services\Integrations\Kargonomi\KargonomiClient;
use App\Services\Integrations\Kargonomi\KargonomiException;
use App\Services\Integrations\Kargonomi\KargonomiShipmentService;
use App\Services\Orders\OrderStatusService;
use Filament\Actions\{Action, ActionGroup, BulkAction, BulkActionGroup, ViewAction};
use Filament\Forms\Components\{Textarea, TextInput};
use Filament\Infolists\Components\{RepeatableEntry, TextEntry};
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Collection;

class OrderResource extends Resource
{
    protected static ?string $model = Order::class;
    protected static ?string $navigationLabel = 'Siparişler';
    protected static ?string $modelLabel = 'Sipariş';
    protected static ?string $pluralModelLabel = 'Siparişler';
    protected static ?int $navigationSort = 1;

    public static function getNavigationIcon(): string|\BackedEnum|null
    {
        return 'heroicon-o-shopping-bag';
    }

    public static function getNavigationGroup(): ?string
    {
        return 'Sipariş';
    }

    public static function getNavigationBadge(): ?string
    {
        return (string) Order::where('status', 'received')->count() ?: null;
    }

    public static function statusColor(?string $status): string
    {
        return match ($status) {
            'pending', 'return_requested' => 'warning',
            'received' => 'info',
            'confirmed', 'processing', 'shipped' => 'primary',
            'delivered' => 'success',
            'payment_failed', 'cancelled', 'refunded' => 'danger',
            default => 'gray',
        };
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Sipariş')->columns(3)->schema([
                TextEntry::make('order_number')->label('Sipariş No')->copyable(),
                TextEntry::make('status')->label('Durum')->badge()
                    ->formatStateUsing(fn ($state) => Order::STATUS_LABELS[$state] ?? $state)
                    ->color(fn ($state) => static::statusColor($state)),
                TextEntry::make('payment_status')->label('Ödeme')->badge(),
                TextEntry::make('buyer_name')->label('Müşteri'),
                TextEntry::make('customer_email')->label('E-posta'),
                TextEntry::make('buyer_phone')->label('Telefon'),
                TextEntry::make('total')->label('Toplam')->money('TRY'),
                TextEntry::make('payment_method')->label('Ödeme yöntemi'),
                TextEntry::make('created_at')->label('Tarih')->dateTime('d.m.Y H:i'),
                TextEntry::make('cargo_company')->label('Kargo firması')->placeholder('-'),
                TextEntry::make('cargo_tracking_number')->label('Takip no')->placeholder('-')->copyable(),
                TextEntry::make('cargo_status')->label('Kargonomi durumu')->placeholder('-')
                    ->formatStateUsing(fn ($state) => KargonomiShipmentService::STATUS_LABELS[$state] ?? $state),
                TextEntry::make('kargonomi_shipment_id')->label('Kargonomi gönderi no')->placeholder('-')->copyable(),
                TextEntry::make('customer_note')->label('Müşteri notu')->placeholder('-'),
            ]),
            Section::make('Ürünler')->schema([
                RepeatableEntry::make('items')->hiddenLabel()->columns(4)->schema([
                    TextEntry::make('name')->label('Ürün'),
                    TextEntry::make('sku')->label('SKU')->placeholder('-'),
                    TextEntry::make('quantity')->label('Adet'),
                    TextEntry::make('total_price')->label('Tutar')->money('TRY'),
                ]),
            ]),
            Section::make('Durum geçmişi')->schema([
                RepeatableEntry::make('statusHistories')->hiddenLabel()->columns(4)->schema([
                    TextEntry::make('status')->label('Durum')->badge()
                        ->formatStateUsing(fn ($state) => Order::STATUS_LABELS[$state] ?? $state)
                        ->color(fn ($state) => static::statusColor($state)),
                    TextEntry::make('created_at')->label('Tarih')->dateTime('d.m.Y H:i'),
                    TextEntry::make('actor_type')->label('İşlemi yapan')
                        ->formatStateUsing(fn ($state) => ['system' => 'Sistem', 'admin' => 'Yönetici', 'customer' => 'Müşteri', 'integration' => 'Entegrasyon'][$state] ?? $state),
                    TextEntry::make('note')->label('Not')->placeholder('-'),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('order_number')->label('Sipariş No')->searchable()->copyable(),
            TextColumn::make('user.name')->label('Müşteri')->searchable(),
            TextColumn::make('total')->label('Toplam')->money('TRY')->sortable(),
            TextColumn::make('status')->label('Durum')->badge()
                ->formatStateUsing(fn ($state) => Order::STATUS_LABELS[$state] ?? $state)
                ->color(fn ($state) => static::statusColor($state)),
            TextColumn::make('payment_status')->label('Ödeme')->badge()
                ->color(fn ($state) => match ($state) { 'paid' => 'success', 'failed', 'refunded' => 'danger', default => 'warning' }),
            TextColumn::make('cargo_status')->label('Kargo')->badge()->placeholder('-')->toggleable()
                ->formatStateUsing(fn ($state) => KargonomiShipmentService::STATUS_LABELS[$state] ?? $state),
            TextColumn::make('created_at')->label('Tarih')->dateTime('d.m.Y H:i')->sortable(),
        ])
        ->filters([
            SelectFilter::make('status')->label('Durum')->options(Order::STATUS_LABELS),
            SelectFilter::make('payment_status')->label('Ödeme')
                ->options(['pending' => 'Bekliyor', 'paid' => 'Ödendi', 'failed' => 'Başarısız', 'refunded' => 'İade edildi']),
            SelectFilter::make('cargo_status')->label('Kargo durumu')->options(KargonomiShipmentService::STATUS_LABELS),
        ])
        ->recordActions([
            ViewAction::make(),
            ActionGroup::make(static::statusActions()),
        ])
        ->toolbarActions([
            BulkActionGroup::make([
                static::bulkTransition('bulk_confirm', 'Seçilenleri onayla', 'confirmed'),
                static::bulkTransition('bulk_processing', 'Seçilenleri hazırlanıyor yap', 'processing'),
            ]),
        ])
        ->defaultSort('created_at', 'desc');
    }

    /** Hem liste hem detay sayfasında kullanılan durum aksiyonları */
    public static function statusActions(): array
    {
        $service = fn () => app(OrderStatusService::class);

        return [
            Action::make('markPaid')->label('Ödemeyi onayla')->icon('heroicon-o-banknotes')->color('success')
                ->visible(fn (Order $record) => $record->payment_status !== 'paid' && in_array($record->status, ['pending', 'payment_failed'], true))
                ->schema([TextInput::make('reference')->label('Ödeme referansı')->required()->default(fn (Order $record) => $record->order_number)])
                ->action(fn (Order $record, array $data) => static::run(fn () => $record->markAsPaid($data['reference'], $record->payment_method ?? 'manual', 'admin', auth()->id()))),

            static::transitionAction('confirm', 'Onayla', 'confirmed', 'heroicon-o-check-circle', 'success'),
            static::transitionAction('processing', 'Hazırlanıyor', 'processing', 'heroicon-o-archive-box', 'primary'),

            Action::make('kargonomiCreate')->label('Kargonomi gönderisi oluştur')->icon('heroicon-o-qr-code')->color('primary')
                ->visible(fn (Order $record) => app(KargonomiClient::class)->enabled() && app(KargonomiShipmentService::class)->canCreate($record))
                ->requiresConfirmation()
                ->modalDescription('Barkod oluşturulur ve sipariş "Hazırlanıyor" durumuna alınır. Sipariş, kargo firması paketi teslim aldığında otomatik olarak "Kargoya verildi" olur.')
                ->action(fn (Order $record) => static::runKargonomi(fn () => app(KargonomiShipmentService::class)->createShipment($record, auth()->id()))),

            Action::make('kargonomiBarcode')->label('Kargo barkodu (PDF)')->icon('heroicon-o-printer')->color('gray')
                ->visible(fn (Order $record) => (bool) $record->kargonomi_shipment_id)
                ->action(function (Order $record) {
                    try {
                        $pdf = app(KargonomiShipmentService::class)->barcodePdf($record);
                    } catch (KargonomiException $e) {
                        Notification::make()->title($e->getMessage())->danger()->send();
                        return null;
                    }
                    return response()->streamDownload(fn () => print($pdf), "barkod-{$record->order_number}.pdf", ['Content-Type' => 'application/pdf']);
                }),

            Action::make('kargonomiRefresh')->label('Kargo durumunu güncelle')->icon('heroicon-o-arrow-path')->color('gray')
                ->visible(fn (Order $record) => (bool) $record->kargonomi_shipment_id && app(KargonomiClient::class)->enabled())
                ->action(fn (Order $record) => static::runKargonomi(fn () => app(KargonomiShipmentService::class)->refresh($record))),

            // Kargonomi gönderisi olan siparişlerde durum taşıyıcı bildirimiyle değişir.
            Action::make('ship')->label('Kargoya verildi')->icon('heroicon-o-truck')->color('primary')
                ->visible(fn (Order $record) => !$record->kargonomi_shipment_id && $service()->canTransition($record, 'shipped'))
                ->modalDescription('Kargo entegrasyonu bağlanana kadar elle kullanılır. Yalnızca kargo taşıyıcıya teslim edildiğinde işaretleyin.')
                ->schema([
                    TextInput::make('cargo_company')->label('Kargo firması')->required()->maxLength(50),
                    TextInput::make('cargo_tracking_number')->label('Takip numarası')->required()->maxLength(100),
                    TextInput::make('cargo_tracking_url')->label('Takip bağlantısı')->url()->maxLength(500),
                ])
                ->action(fn (Order $record, array $data) => static::run(fn () => $service()->transition(
                    $record, 'shipped', 'admin', auth()->id(), 'Elle kargoya verildi', $data,
                ))),

            static::transitionAction('deliver', 'Teslim edildi', 'delivered', 'heroicon-o-home', 'success'),

            Action::make('cancel')->label('İptal et')->icon('heroicon-o-x-circle')->color('danger')
                ->visible(fn (Order $record) => $service()->canTransition($record, 'cancelled'))
                ->requiresConfirmation()
                ->modalDescription('Sipariş iptal edilir ve stoklar geri eklenir. Ödeme alındıysa ücret iadesini ayrıca yapmanız gerekir.')
                ->schema([Textarea::make('note')->label('İptal nedeni')->maxLength(500)])
                ->action(fn (Order $record, array $data) => static::run(fn () => $service()->transition(
                    $record, 'cancelled', 'admin', auth()->id(), $data['note'] ?? null,
                ))),
        ];
    }

    private static function transitionAction(string $name, string $label, string $to, string $icon, string $color): Action
    {
        return Action::make($name)->label($label)->icon($icon)->color($color)
            ->visible(fn (Order $record) => app(OrderStatusService::class)->canTransition($record, $to))
            ->requiresConfirmation()
            ->action(fn (Order $record) => static::run(fn () => app(OrderStatusService::class)->transition($record, $to, 'admin', auth()->id())));
    }

    private static function bulkTransition(string $name, string $label, string $to): BulkAction
    {
        return BulkAction::make($name)->label($label)->requiresConfirmation()
            ->action(function (Collection $records) use ($to) {
                $done = 0;
                $skipped = [];
                foreach ($records as $order) {
                    try {
                        app(OrderStatusService::class)->transition($order, $to, 'admin', auth()->id(), 'Toplu işlem');
                        $done++;
                    } catch (\DomainException) {
                        $skipped[] = $order->order_number;
                    }
                }
                Notification::make()
                    ->title("{$done} sipariş güncellendi")
                    ->body($skipped ? 'Uygun durumda olmadığı için atlananlar: ' . implode(', ', $skipped) : null)
                    ->{$skipped ? 'warning' : 'success'}()
                    ->send();
            })
            ->deselectRecordsAfterCompletion();
    }

    private static function runKargonomi(callable $callback): void
    {
        try {
            $callback();
            Notification::make()->title('Kargo bilgileri güncellendi')->success()->send();
        } catch (KargonomiException | \DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    private static function run(callable $callback): void
    {
        try {
            $callback();
            Notification::make()->title('Sipariş güncellendi')->success()->send();
        } catch (\DomainException $e) {
            Notification::make()->title($e->getMessage())->danger()->send();
        }
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOrders::route('/'),
            'view' => Pages\ViewOrder::route('/{record}'),
        ];
    }
}
