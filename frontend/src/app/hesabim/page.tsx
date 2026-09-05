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
    { icon: ShoppingBag, label: 'Toplam Sipariş', value: orders?.length ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: Star, label: 'Toplam Puan', value: '250', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { icon: Heart, label: 'Favoriler', value: '0', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    { icon: TrendingUp, label: 'Toplam Harcama', value: formatPrice(orders?.reduce((s: number, o: { total: string }) => s + parseFloat(o.total || '0'), 0) ?? 0), color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-black text-2xl shadow-xl shadow-blue-500/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Merhaba, {user?.name}! 👋</h1>
            <p className="text-sm text-white/40">{user?.email}</p>
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
            <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-400" />
            Son Siparişler
          </h2>
          <Link href="/hesabim/siparislerim" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
            Tümünü gör →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-10 w-10 mx-auto mb-3 text-white/15" />
            <p className="text-sm text-white/40">Henüz sipariş vermediniz</p>
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
                className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/6 hover:border-white/10 transition-all"
              >
                <div>
                  <p className="text-sm font-bold text-white">#{order.order_number}</p>
                  <p className="text-xs text-white/40">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatPrice(parseFloat(order.total))}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.status === 'delivered' ? 'text-green-400 bg-green-500/10' :
                    order.status === 'shipped' ? 'text-blue-400 bg-blue-500/10' :
                    order.status === 'cancelled' ? 'text-red-400 bg-red-500/10' :
                    'text-amber-400 bg-amber-500/10'
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
