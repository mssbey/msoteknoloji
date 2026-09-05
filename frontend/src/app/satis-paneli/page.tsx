'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  TrendingUp, ShoppingBag, Wallet, Package, ArrowUpRight,
  Star, AlertTriangle, Bot, Zap, CheckCircle, Clock,
  BarChart3, Users,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { sellerAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import Link from 'next/link'

const SALES_DATA = [
  { gun: 'Pzt', satis: 4200, siparis: 18 },
  { gun: 'Sal', satis: 3800, siparis: 15 },
  { gun: 'Çar', satis: 5600, siparis: 24 },
  { gun: 'Per', satis: 4900, siparis: 20 },
  { gun: 'Cum', satis: 7200, siparis: 31 },
  { gun: 'Cmt', satis: 6100, siparis: 26 },
  { gun: 'Paz', satis: 5300, siparis: 22 },
]

const AI_SUGGESTIONS = [
  { type: 'warning', icon: AlertTriangle, text: '3 ürünün stoğu kritik seviyede', action: 'Stok Ekle', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { type: 'tip', icon: TrendingUp, text: '"Gaming Mouse" bu hafta %240 trend', action: 'Ürün Ekle', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { type: 'success', icon: CheckCircle, text: 'SEO skorunuz geçen haftaya göre +8 puan arttı', action: 'Detaylar', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
]

const RECENT_ORDERS = [
  { no: '#MSO260601', customer: 'Mehmet A.', amount: 1299, status: 'Hazırlanıyor', time: '5 dk önce' },
  { no: '#MSO260600', customer: 'Ayşe K.', amount: 449, status: 'Kargoda', time: '1 saat önce' },
  { no: '#MSO260599', customer: 'Can D.', amount: 2890, status: 'Teslim Edildi', time: '3 saat önce' },
  { no: '#MSO260598', customer: 'Fatma Y.', amount: 320, status: 'Teslim Edildi', time: '6 saat önce' },
]

function StatCard({ icon: Icon, label, value, change, color, bg, delay = 0 }: {
  icon: React.ElementType; label: string; value: string; change?: string; color: string; bg: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`rounded-2xl border p-5 ${bg}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-current/10 ${color}`}>
          <Icon className="h-5 w-5" style={{ color: 'inherit' }} />
        </div>
        {change && (
          <span className="flex items-center gap-1 text-xs font-bold text-green-400">
            <ArrowUpRight className="h-3 w-3" />
            {change}
          </span>
        )}
      </div>
      <p className={`text-2xl font-black ${color} mb-0.5`}>{value}</p>
      <p className="text-xs text-white/45">{label}</p>
    </motion.div>
  )
}

export default function SellerDashboardPage() {
  const { user } = useAuthStore()

  return (
    <div className="space-y-6 max-w-[1400px]">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">
            Merhaba, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm text-white/40 mt-0.5">Bugün işler nasıl gidiyor?</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <Link href="/satis-paneli/urunler/yeni"
            className="btn-primary py-2.5 px-5 text-sm rounded-xl flex items-center gap-2">
            <Package className="h-4 w-4" />
            Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wallet} label="Bugünkü Ciro" value="₺8,420" change="+18%" color="text-blue-400" bg="border-blue-500/20 bg-blue-500/5" delay={0} />
        <StatCard icon={ShoppingBag} label="Yeni Siparişler" value="24" change="+5" color="text-green-400" bg="border-green-500/20 bg-green-500/5" delay={0.06} />
        <StatCard icon={Package} label="Toplam Ürün" value="1,247" color="text-purple-400" bg="border-purple-500/20 bg-purple-500/5" delay={0.12} />
        <StatCard icon={Star} label="Mağaza Puanı" value="4.8 ★" color="text-amber-400" bg="border-amber-500/20 bg-amber-500/5" delay={0.18} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                Haftalık Satış
              </h3>
              <p className="text-xs text-white/40 mt-0.5">Son 7 gün</p>
            </div>
            <span className="badge badge-green flex items-center gap-1">
              <TrendingUp className="h-2.5 w-2.5" />
              +23% bu hafta
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={SALES_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="gun" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A1A22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F8FAFC', fontSize: 12 }}
                formatter={(val) => [`₺${Number(val ?? 0).toLocaleString('tr-TR')}`, 'Ciro']}
              />
              <Area type="monotone" dataKey="satis" stroke="#3B82F6" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ fill: '#3B82F6', r: 3, strokeWidth: 0 }} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar Chart - Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-5"
        >
          <h3 className="font-bold text-white flex items-center gap-2 mb-1">
            <Users className="h-4 w-4 text-purple-400" />
            Sipariş Dağılımı
          </h3>
          <p className="text-xs text-white/40 mb-4">Günlük sipariş sayısı</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={SALES_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="gun" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F8FAFC', fontSize: 12 }} />
              <Bar dataKey="siparis" fill="#7C3AED" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-green-400" />
              Son Siparişler
            </h3>
            <Link href="/satis-paneli/siparisler" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Tümünü gör →
            </Link>
          </div>
          <div className="space-y-2">
            {RECENT_ORDERS.map((order) => (
              <div key={order.no} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                <div>
                  <p className="text-sm font-bold text-white">{order.no}</p>
                  <p className="text-xs text-white/40">{order.customer} · {order.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{formatPrice(order.amount)}</p>
                  <span className={`text-xs font-medium ${
                    order.status === 'Teslim Edildi' ? 'text-green-400' :
                    order.status === 'Kargoda' ? 'text-blue-400' : 'text-amber-400'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-400" />
              AI Asistan Önerileri
            </h3>
            <Link href="/satis-paneli/ai" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              Tümünü gör →
            </Link>
          </div>

          {/* Optimization Score */}
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/60">MAĞAZA OPTİMİZASYON SKORU</span>
              <span className="text-lg font-black text-blue-400">78/100</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '78%' }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            {AI_SUGGESTIONS.map((s, i) => (
              <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${s.bg}`}>
                <div className="flex items-center gap-2.5">
                  <s.icon className={`h-4 w-4 flex-shrink-0 ${s.color}`} />
                  <p className="text-xs text-white/70">{s.text}</p>
                </div>
                <button className={`text-xs font-bold flex-shrink-0 ml-2 ${s.color} hover:opacity-80 transition-opacity`}>
                  {s.action}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
