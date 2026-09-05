'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Onay Bekliyor', cls: 'text-amber-400 bg-amber-500/10' },
  paid: { label: 'Hazırlanıyor', cls: 'text-blue-400 bg-blue-500/10' },
  shipped: { label: 'Kargoda', cls: 'text-purple-400 bg-purple-500/10' },
  delivered: { label: 'Teslim Edildi', cls: 'text-green-400 bg-green-500/10' },
  cancelled: { label: 'İptal', cls: 'text-red-400 bg-red-500/10' },
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
        <h1 className="text-xl font-black text-white">Siparişlerim</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş no ara..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center text-white/40 text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-white/15" />
          <p className="text-white/50 mb-3">Henüz siparişiniz yok</p>
          <Link href="/urunler" className="btn-primary text-xs py-2 px-4 rounded-xl inline-flex">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order: { order_number: string; created_at: string; total: string; status: string; items_count?: number }) => {
            const badge = STATUS_BADGE[order.status] || { label: order.status, cls: 'text-white/60 bg-white/10' }
            return (
              <Link
                key={order.order_number}
                href={`/hesabim/siparislerim/${order.order_number}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:bg-white/6 hover:border-white/12 transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 flex-shrink-0">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-white text-sm">#{order.order_number}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatPrice(parseFloat(order.total))}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-white/30" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
