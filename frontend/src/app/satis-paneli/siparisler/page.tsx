'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { sellerAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Bekliyor', icon: Clock, color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]' },
  processing: { label: 'Hazırlanıyor', icon: Package, color: 'text-[#373071]', bg: 'bg-[#edebf7] border-[#d6d3ee]' },
  shipped: { label: 'Kargoda', icon: Truck, color: 'text-[#7c5e77]', bg: 'bg-[#f2eaf0] border-[#e4d5e1]' },
  delivered: { label: 'Teslim Edildi', icon: CheckCircle, color: 'text-[#373071]', bg: 'bg-[#edebf7] border-[#d6d3ee]' },
  cancelled: { label: 'İptal', icon: XCircle, color: 'text-[#b0463c]', bg: 'bg-[#fbeceb] border-[#eec9c5]' },
}

export default function SellerOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQ, setSearchQ] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', { statusFilter, searchQ, page }],
    queryFn: () => sellerAPI.orders.list({ status: statusFilter !== 'all' ? statusFilter : '', q: searchQ, page }),
    select: (res) => res.data.data,
  })

  const orders = data?.data || []
  const total = data?.total || 0

  const statCounts = [
    { label: 'Tümü', value: 'all', count: total },
    { label: 'Bekliyor', value: 'pending', count: 12 },
    { label: 'Hazırlanıyor', value: 'processing', count: 34 },
    { label: 'Kargoda', value: 'shipped', count: 89 },
    { label: 'Teslim', value: 'delivered', count: 112 },
  ]

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#23262b]">Siparişler</h1>
          <p className="text-sm text-[#8e909b]">{total.toLocaleString()} sipariş</p>
        </div>
        <button className="btn-ghost py-2 px-3.5 text-sm rounded-xl flex items-center gap-2">
          <Download className="h-4 w-4" />
          Excel İndir
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {statCounts.map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border',
              statusFilter === s.value
                ? 'bg-[#e9e7f5] text-[#373071] border-[#a19bcc]'
                : 'text-[#7c7f8a] border-[#e6e4f0] hover:text-[#3d404b] hover:bg-[#f4f3f9]'
            )}
          >
            {s.label}
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full', statusFilter === s.value ? 'bg-[#cfcbea]' : 'bg-[#f3f2f8]')}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 p-3 rounded-2xl border border-[#e6e4f0] bg-[#f6f5fb]">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-[#e6e4f0] bg-[#f4f3f9] px-3 py-2">
          <Search className="h-4 w-4 text-[#a3a5b0]" />
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Sipariş no veya müşteri ara..."
            className="flex-1 bg-transparent text-sm text-[#23262b] placeholder-[#a3a5b0] outline-none"
          />
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 skeleton rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-[#b4b6c1]" />
          <h3 className="text-lg font-bold text-[#23262b] mb-2">Sipariş bulunamadı</h3>
          <p className="text-sm text-[#8e909b]">Henüz bu kriterde sipariş yok</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e6e4f0]">
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase">Sipariş</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase hidden md:table-cell">Müşteri</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase">Tutar</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase">Durum</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase hidden lg:table-cell">Tarih</th>
                <th className="text-right py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: { order_number: string; user?: { name: string }; total: string; status: string; created_at: string }, i: number) => {
                const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
                const Icon = statusCfg.icon
                return (
                  <motion.tr
                    key={order.order_number}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-[#eeedf5] hover:bg-[#f6f5fb] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-[#23262b]">#{order.order_number}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-sm text-[#585c68]">{order.user?.name || 'Misafir'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-[#23262b]">{formatPrice(parseFloat(order.total))}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', statusCfg.bg, statusCfg.color)}>
                        <Icon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <p className="text-xs text-[#8e909b]">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-xs text-[#373071] hover:text-[#2e2862] transition-colors">İncele</button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
