'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Onay Bekliyor', cls: 'text-[#9c7226] bg-[#faf3e2]' },
  paid: { label: 'Hazırlanıyor', cls: 'text-[#4d7138] bg-[#eef3e2]' },
  shipped: { label: 'Kargoda', cls: 'text-[#7c5e77] bg-[#f2eaf0]' },
  delivered: { label: 'Teslim Edildi', cls: 'text-[#4d7138] bg-[#eef3e2]' },
  cancelled: { label: 'İptal', cls: 'text-[#b0463c] bg-[#fbeceb]' },
}

export default function OrdersPage() {
  const [search, setSearch] = useState('')
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.list(),
    select: (res) => res.data.data?.data || res.data.data || [],
  })

  const filtered = (orders || []).filter((o: { order_number: string }) =>
    o.order_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-black text-[#202c28]">Siparişlerim</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a8b09f]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş no ara..."
            className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl pl-9 pr-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f] focus:outline-none focus:border-[#8fab6a]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center text-[#98a191] text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-[#b6bdac]" />
          <p className="text-[#8c958c] mb-3">Henüz siparişiniz yok</p>
          <Link href="/urunler" className="btn-primary text-xs py-2 px-4 rounded-xl inline-flex">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order: { order_number: string; created_at: string; total: string; status: string; items_count?: number }) => {
            const badge = STATUS_BADGE[order.status] || { label: order.status, cls: 'text-[#6f7a68] bg-[#f0f2ec]' }
            return (
              <Link
                key={order.order_number}
                href={`/hesabim/siparislerim/${order.order_number}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#f8f9f6] border border-[#e3e7dd] hover:bg-[#f3f5ef] hover:border-[#dfe4d8] transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3e2] text-[#4d7138] flex-shrink-0">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#202c28] text-sm">#{order.order_number}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#98a191] mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#202c28]">{formatPrice(parseFloat(order.total))}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#a8b09f]" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
