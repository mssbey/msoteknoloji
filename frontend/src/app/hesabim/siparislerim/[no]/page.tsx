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

  if (isLoading) return <div className="glass-card p-12 text-center text-white/40 text-sm">Yükleniyor...</div>
  if (!order) return (
    <div className="glass-card p-12 text-center">
      <p className="text-white/50 mb-3">Sipariş bulunamadı</p>
      <Link href="/hesabim/siparislerim" className="btn-ghost text-xs py-2 px-4 rounded-xl inline-flex">Geri Dön</Link>
    </div>
  )

  return (
    <div className="space-y-5">
      <Link href="/hesabim/siparislerim" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Siparişlerime dön
      </Link>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-lg font-black text-white">Sipariş #{order.order_number}</h1>
            <p className="text-xs text-white/40 mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <span className="badge badge-blue">{order.status}</span>
        </div>

        {order.contract_url && (
          <a href={order.contract_url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300">
            <FileText className="h-3.5 w-3.5" />
            Mesafeli satış sözleşmesi (PDF)
          </a>
        )}
      </div>

      {/* Items */}
      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-3 flex items-center gap-2"><Package className="h-4 w-4 text-blue-400" />Ürünler</h2>
        <div className="space-y-2">
          {(order.items || []).map((item: { id: number; product_name: string; quantity: number; price: string; cargo_tracking_number?: string; cargo_company?: string; cargo_tracking_url?: string }) => (
            <div key={item.id} className="p-3 rounded-xl bg-white/3 border border-white/6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">{item.product_name}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.quantity} adet × {formatPrice(parseFloat(item.price))}</p>
                  {item.cargo_tracking_number && (
                    <a href={item.cargo_tracking_url} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 mt-2">
                      <Truck className="h-3 w-3" />
                      {item.cargo_company}: {item.cargo_tracking_number}
                    </a>
                  )}
                </div>
                <p className="font-bold text-white">{formatPrice(parseFloat(item.price) * item.quantity)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals + shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-purple-400" />Teslimat</h2>
          <p className="text-sm text-white/70 whitespace-pre-line">{order.shipping_address || '—'}</p>
        </div>
        <div className="glass-card p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2"><CreditCard className="h-4 w-4 text-green-400" />Ödeme</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-white/50">Ara toplam</span><span className="text-white">{formatPrice(parseFloat(order.subtotal || '0'))}</span></div>
            <div className="flex justify-between"><span className="text-white/50">Kargo</span><span className="text-white">{formatPrice(parseFloat(order.shipping_cost || '0'))}</span></div>
            {parseFloat(order.discount || '0') > 0 && <div className="flex justify-between"><span className="text-white/50">İndirim</span><span className="text-red-400">-{formatPrice(parseFloat(order.discount))}</span></div>}
            <div className="flex justify-between pt-2 border-t border-white/8"><span className="font-bold text-white">Toplam</span><span className="font-black text-white">{formatPrice(parseFloat(order.total))}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
