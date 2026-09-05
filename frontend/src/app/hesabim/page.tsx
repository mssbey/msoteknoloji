'use client'

import { useAuthStore } from '@/stores/authStore'
import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { formatPrice, formatDate } from '@/lib/utils'
import { Package, Star, Heart, ShoppingBag, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function AccountPage() {
  const { user } = useAuthStore()

  const { data: orders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.list(),
    select: (res) => res.data.data?.data || [],
  })

  const stats = [
    { icon: ShoppingBag, label: 'Toplam Sipariş', value: orders?.length ?? 0, color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
    { icon: Star, label: 'Toplam Puan', value: '250', color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]' },
    { icon: Heart, label: 'Favoriler', value: '0', color: 'text-[#b0463c]', bg: 'bg-[#fbeceb] border-[#eec9c5]' },
    { icon: TrendingUp, label: 'Toplam Harcama', value: formatPrice(orders?.reduce((s: number, o: { total: string }) => s + parseFloat(o.total || '0'), 0) ?? 0), color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f6045] to-[#33613f] text-[#f4f8ec] font-black text-2xl shadow-xl shadow-[#244b37]/10">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-[#202c28]">Merhaba, {user?.name}! 👋</h1>
            <p className="text-sm text-[#98a191]">{user?.email}</p>
          </div>
          <div className="ml-auto">
            <span className="badge badge-blue flex items-center gap-1.5">
              <Zap className="h-3 w-3 fill-blue-400" />
              Bronz Üye
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`p-4 rounded-2xl border ${stat.bg} text-center`}
          >
            <stat.icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
            <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-[#98a191] mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#202c28] flex items-center gap-2">
            <Package className="h-4 w-4 text-[#4d7138]" />
            Son Siparişler
          </h2>
          <Link href="/hesabim/siparislerim" className="text-xs text-[#4d7138] hover:text-[#33613f] transition-colors">
            Tümünü gör →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-10 w-10 mx-auto mb-3 text-[#b6bdac]" />
            <p className="text-sm text-[#98a191]">Henüz sipariş vermediniz</p>
            <Link href="/urunler" className="btn-primary text-xs py-2 px-4 rounded-xl mt-3 inline-flex">
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order: { order_number: string; created_at: string; total: string; status: string }) => (
              <Link
                key={order.order_number}
                href={`/hesabim/siparislerim/${order.order_number}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9f6] border border-[#eef0ea] hover:bg-[#f3f5ef] hover:border-[#e3e7dd] transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-[#202c28]">#{order.order_number}</p>
                  <p className="text-xs text-[#98a191]">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#202c28]">{formatPrice(parseFloat(order.total))}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'text-[#4d7138] bg-[#eef3e2]' :
                    order.status === 'shipped' ? 'text-[#4d7138] bg-[#eef3e2]' :
                    order.status === 'cancelled' ? 'text-[#b0463c] bg-[#fbeceb]' :
                    'text-[#9c7226] bg-[#faf3e2]'
                  }`}>
                    {order.status === 'delivered' ? 'Teslim Edildi' :
                     order.status === 'shipped' ? 'Kargoda' :
                     order.status === 'cancelled' ? 'İptal' :
                     order.status === 'processing' ? 'Hazırlanıyor' : 'Bekliyor'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
