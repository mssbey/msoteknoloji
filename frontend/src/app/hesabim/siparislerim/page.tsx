'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { orderStatusBadge } from '@/lib/orderStatus'


export default function OrdersPage() {
  const userId = useAuthStore(s => s.user?.id)
  const [search, setSearch] = useState('')
  const { data: orders, isLoading } = useQuery({
    queryKey: ['my-orders', userId],
    queryFn: () => ordersAPI.list(),
    select: (res) => res.data.data?.data || res.data.data || [],
  })

  const filtered = (orders || []).filter((o: { order_number: string }) =>
    o.order_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-black text-[#23262b]">Siparişlerim</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a3a5b0]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş no ara..."
            className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl pl-9 pr-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card p-12 text-center text-[#8e909b] text-sm">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-[#b4b6c1]" />
          <p className="text-[#7c7f8a] mb-3">Henüz siparişiniz yok</p>
          <Link href="/urunler" className="btn-primary text-xs py-2 px-4 rounded-xl inline-flex">
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((order: { order_number: string; created_at: string; total: string; status: string; items_count?: number }) => {
            const badge = orderStatusBadge(order.status)
            return (
              <Link
                key={order.order_number}
                href={`/hesabim/siparislerim/${order.order_number}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-[#f6f5fb] border border-[#e6e4f0] hover:bg-[#f3f2f8] hover:border-[#d9d8e4] transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edebf7] text-[#373071] flex-shrink-0">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-[#23262b] text-sm">#{order.order_number}</p>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e909b] mt-0.5">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#23262b]">{formatPrice(parseFloat(order.total))}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[#a3a5b0]" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
