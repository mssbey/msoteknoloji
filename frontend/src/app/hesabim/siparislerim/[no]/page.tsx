'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, Truck, MapPin, CreditCard, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'
import BankTransferInfo from '@/components/BankTransferInfo'
import { toast } from 'sonner'
import OrderTimeline from '@/components/orders/OrderTimeline'
import { orderStatusBadge } from '@/lib/orderStatus'

export default function OrderDetailPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = use(params)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', no],
    queryFn: () => ordersAPI.show(no),
    select: (res) => res.data.data,
  })

  // PDF yetkili istekle alınır; yeni sekme tıklama anında açılır ki tarayıcı engellemesin.
  async function openDocument(type: string) {
    const tab = window.open('', '_blank')
    try {
      const response = await ordersAPI.document(no, type)
      const url = URL.createObjectURL(response.data)
      if (tab) tab.location.replace(url)
      else window.location.assign(url)
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      tab?.close()
      toast.error('Belge açılamadı. Lütfen tekrar deneyin.')
    }
  }

  if (isLoading) return <div className="glass-card p-12 text-center text-[#8e909b] text-sm">Yükleniyor...</div>
  if (!order) return (
    <div className="glass-card p-12 text-center">
      <p className="text-[#7c7f8a] mb-3">Sipariş bulunamadı</p>
      <Link href="/hesabim/siparislerim" className="btn-ghost text-xs py-2 px-4 rounded-xl inline-flex">Geri Dön</Link>
    </div>
  )

  const trackingUrl: string | undefined = order.cargo_tracking_url
    || (order.items || []).find((item: { cargo_tracking_url?: string }) => item.cargo_tracking_url)?.cargo_tracking_url

  return (
    <div className="space-y-5">
      <Link href="/hesabim/siparislerim" className="inline-flex items-center gap-1.5 text-sm text-[#7c7f8a] hover:text-[#23262b] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Siparişlerime dön
      </Link>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h1 className="text-lg font-black text-[#23262b]">Sipariş #{order.order_number}</h1>
            <p className="text-xs text-[#8e909b] mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${orderStatusBadge(order.status).cls}`}>{orderStatusBadge(order.status).label}</span>
        </div>

        <OrderTimeline status={order.status} histories={order.status_histories || []} />

        {trackingUrl && (
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
            className="btn-primary mt-4 inline-flex items-center gap-2 text-sm py-2.5 px-4 rounded-xl">
            <Truck className="h-4 w-4" />
            Kargom Nerede?
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">(yeni sekmede açılır)</span>
          </a>
        )}
        {order.cargo_tracking_number && (
          <p className="text-xs text-[#7c7f8a] mt-2">{order.cargo_company} · Takip no: {order.cargo_tracking_number}</p>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
          {[['on-bilgilendirme-formu', 'Ön bilgilendirme formu'], ['mesafeli-satis-sozlesmesi', 'Mesafeli satış sözleşmesi']].map(([type, label]) => (
            <button key={type} type="button" onClick={() => openDocument(type)}
              className="inline-flex items-center gap-1.5 text-xs text-[#373071] hover:text-[#2e2862]">
              <FileText className="h-3.5 w-3.5" />
              {label} (PDF)
            </button>
          ))}
        </div>
      </div>

      {order.bank_transfer && order.payment_status === 'pending' && order.status !== 'cancelled' && <BankTransferInfo bank={order.bank_transfer} />}
      {/* Items */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-[#23262b] mb-3 flex items-center gap-2"><Package className="h-4 w-4 text-[#373071]" />Ürünler</h2>
        <div className="space-y-2">
          {(order.items || []).map((item: { id: number; name: string; quantity: number; unit_price: string; cargo_tracking_number?: string; cargo_company?: string; cargo_tracking_url?: string }) => (
            <div key={item.id} className="p-3 rounded-xl bg-[#f6f5fb] border border-[#eeedf5]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#23262b]">{item.name}</p>
                  <p className="text-xs text-[#8e909b] mt-0.5">{item.quantity} adet × {formatPrice(parseFloat(item.unit_price))}</p>
                  {item.cargo_tracking_number && (
                    <a href={item.cargo_tracking_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#373071] hover:text-[#2e2862] mt-2">
                      <Truck className="h-3 w-3" />
                      {item.cargo_company}: {item.cargo_tracking_number}
                    </a>
                  )}
                </div>
                <p className="font-bold text-[#23262b]">{formatPrice(parseFloat(item.unit_price) * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals + shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="font-bold text-[#23262b] mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#7c5e77]" />Teslimat</h2>
          <div className="text-sm text-[#585c68] space-y-1"><p>{order.shipping_address?.first_name} {order.shipping_address?.last_name}</p><p>{order.shipping_address?.phone}</p><p className="whitespace-pre-line">{order.shipping_address?.address}</p><p>{order.shipping_address?.district} / {order.shipping_address?.city}</p></div>
        </div>
        <div className="glass-card p-5">
          <h2 className="font-bold text-[#23262b] mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#373071]" />Ödeme</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[#7c7f8a]">Ara toplam</span><span className="text-[#23262b]">{formatPrice(parseFloat(order.subtotal || '0'))}</span></div>
            <div className="flex justify-between"><span className="text-[#7c7f8a]">Kargo</span><span className="text-[#23262b]">{formatPrice(parseFloat(order.shipping_cost || '0'))}</span></div>
            {parseFloat(order.discount_amount || '0') > 0 && <div className="flex justify-between"><span className="text-[#7c7f8a]">İndirim</span><span className="text-[#b0463c]">-{formatPrice(parseFloat(order.discount_amount))}</span></div>}
            <div className="flex justify-between pt-2 border-t border-[#e6e4f0]"><span className="font-bold text-[#23262b]">Toplam</span><span className="font-black text-[#23262b]">{formatPrice(parseFloat(order.total))}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
