'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { ArrowLeft, Package, Truck, MapPin, CreditCard, FileText } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function OrderDetailPage({ params }: { params: Promise<{ no: string }> }) {
  const { no } = use(params)

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', no],
    queryFn: () => ordersAPI.show(no),
    select: (res) => res.data.data,
  })

  if (isLoading) return <div className="glass-card p-12 text-center text-[#98a191] text-sm">Yükleniyor...</div>
  if (!order) return (
    <div className="glass-card p-12 text-center">
      <p className="text-[#8c958c] mb-3">Sipariş bulunamadı</p>
      <Link href="/hesabim/siparislerim" className="btn-ghost text-xs py-2 px-4 rounded-xl inline-flex">Geri Dön</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      <Link href="/hesabim/siparislerim" className="inline-flex items-center gap-1.5 text-sm text-[#8c958c] hover:text-[#202c28] transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Siparişlerime dön
      </Link>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-black text-[#202c28]">Sipariş #{order.order_number}</h1>
            <p className="text-xs text-[#98a191] mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <span className="badge badge-blue">{order.status}</span>
        </div>

        {order.contract_url && (
          <a href={order.contract_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#4d7138] hover:text-[#33613f]">
            <FileText className="h-3.5 w-3.5" />
            Mesafeli satış sözleşmesi (PDF)
          </a>
        )}
      </div>

      {/* Items */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-[#202c28] mb-3 flex items-center gap-2"><Package className="h-4 w-4 text-[#4d7138]" />Ürünler</h2>
        <div className="space-y-2">
          {(order.items || []).map((item: { id: number; product_name: string; quantity: number; price: string; cargo_tracking_number?: string; cargo_company?: string; cargo_tracking_url?: string }) => (
            <div key={item.id} className="p-3 rounded-xl bg-[#f8f9f6] border border-[#eef0ea]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#202c28]">{item.product_name}</p>
                  <p className="text-xs text-[#98a191] mt-0.5">{item.quantity} adet × {formatPrice(parseFloat(item.price))}</p>
                  {item.cargo_tracking_number && (
                    <a href={item.cargo_tracking_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#4d7138] hover:text-[#33613f] mt-2">
                      <Truck className="h-3 w-3" />
                      {item.cargo_company}: {item.cargo_tracking_number}
                    </a>
                  )}
                </div>
                <p className="font-bold text-[#202c28]">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals + shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="font-bold text-[#202c28] mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-[#7c5e77]" />Teslimat</h2>
          <p className="text-sm text-[#5c6a56] whitespace-pre-line">{order.shipping_address || '—'}</p>
        </div>
        <div className="glass-card p-5">
          <h2 className="font-bold text-[#202c28] mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-[#4d7138]" />Ödeme</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-[#8c958c]">Ara toplam</span><span className="text-[#202c28]">{formatPrice(parseFloat(order.subtotal || '0'))}</span></div>
            <div className="flex justify-between"><span className="text-[#8c958c]">Kargo</span><span className="text-[#202c28]">{formatPrice(parseFloat(order.shipping_cost || '0'))}</span></div>
            {parseFloat(order.discount || '0') > 0 && <div className="flex justify-between"><span className="text-[#8c958c]">İndirim</span><span className="text-[#b0463c]">-{formatPrice(parseFloat(order.discount))}</span></div>}
            <div className="flex justify-between pt-2 border-t border-[#e3e7dd]"><span className="font-bold text-[#202c28]">Toplam</span><span className="font-black text-[#202c28]">{formatPrice(parseFloat(order.total))}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
