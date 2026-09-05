<?php

namespace App\Services\Legal;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class LegalDocumentService
{
    public function generateSalesContract(Order $order): string
    {
        $order->load(['items', 'user']);

        $seller = $order->items->first()?->seller;
        $shippingAddress = $order->shipping_address;

        $pdf = Pdf::loadView('legal.mesafeli-satis-sozlesmesi', [
            'order' => $order,
            'seller' => $seller,
            'buyer' => [
                'name' => $shippingAddress['first_name'] . ' ' . $shippingAddress['last_name'],
                'phone' => $shippingAddress['phone'],
                'email' => $order->user->email,
                'address' => $shippingAddress['address_line'],
                'district' => $shippingAddress['district'],
                'city' => $shippingAddress['city'],
            ],
        ])->setPaper('a4', 'portrait');

        $filename = 'legal/contracts/' . $order->order_number . '-sozlesme.pdf';

        Storage::put($filename, $pdf->output());

        // Siparişe link kaydet
        $order->update(['contract_url' => Storage::url($filename)]);

        return $filename;
    }

    public function generatePreInformationForm(Order $order): string
    {
        // Ön Bilgilendirme Formu - benzer şekilde blade template
        return $this->generateSalesContract($order); // Şimdilik aynı
    }

    public function sendContractByEmail(Order $order, string $pdfPath): void
    {
        $order->user->notify(
            new \App\Notifications\SalesContractNotification($order, $pdfPath)
        );
    }
}
