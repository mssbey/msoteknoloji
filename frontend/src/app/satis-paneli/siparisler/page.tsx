'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter, Download, Package, Truck, CheckCircle, Clock, XCircle } from 'lucide-react'
import { sellerAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  pending: { label: 'Bekliyor', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  processing: { label: 'Hazırlanıyor', icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  shipped: { label: 'Kargoda', icon: Truck, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  delivered: { label: 'Teslim Edildi', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  cancelled: { label: 'İptal', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
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
          <h1 className="text-xl font-black text-white">Siparişler</h1>
          <p className="text-sm text-white/40">{total.toLocaleString()} sipariş</p>
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
                ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                : 'text-white/50 border-white/8 hover:text-white/80 hover:bg-white/5'
            )}
          >
            {s.label}
            <span className={cn('text-xs px-1.5 py-0.5 rounded-full', statusFilter === s.value ? 'bg-blue-500/25' : 'bg-white/8')}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 p-3 rounded-2xl border border-white/8 bg-white/3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-white/30" />
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Sipariş no veya müşteri ara..."
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
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
          <Package className="h-12 w-12 mx-auto mb-3 text-white/15" />
          <h3 className="text-lg font-bold text-white mb-2">Sipariş bulunamadı</h3>
          <p className="text-sm text-white/40">Henüz bu kriterde sipariş yok</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left py-3.5 px-4 text-xs font-bold text-white/40 uppercase">Sipariş</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-white/40 uppercase hidden md:table-cell">Müşteri</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-white/40 uppercase">Tutar</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-white/40 uppercase">Durum</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-white/40 uppercase hidden lg:table-cell">Tarih</th>
                <th className="text-right py-3.5 px-4 text-xs font-bold text-white/40 uppercase">İşlem</th>
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
                    className="border-b border-white/5 hover:bg-white/3 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-white">#{order.order_number}</p>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <p className="text-sm text-white/70">{order.user?.name || 'Misafir'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-bold text-white">{formatPrice(parseFloat(order.total))}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', statusCfg.bg, statusCfg.color)}>
                        <Icon className="h-3 w-3" />
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <p className="text-xs text-white/40">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">İncele</button>
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
