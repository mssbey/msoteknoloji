'use client'

import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Users, ShoppingBag, Eye, MousePointerClick } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const TRAFFIC = [
  { day: '24', ziyaret: 1240, dönüsüm: 32 },
  { day: '25', ziyaret: 1580, dönüsüm: 41 },
  { day: '26', ziyaret: 2100, dönüsüm: 58 },
  { day: '27', ziyaret: 1820, dönüsüm: 49 },
  { day: '28', ziyaret: 2240, dönüsüm: 67 },
  { day: '29', ziyaret: 2680, dönüsüm: 81 },
  { day: '30', ziyaret: 2980, dönüsüm: 94 },
]

const SOURCES = [
  { name: 'Google', value: 42, color: '#3B82F6' },
  { name: 'Direct', value: 28, color: '#7C3AED' },
  { name: 'Social', value: 18, color: '#F59E0B' },
  { name: 'Email', value: 12, color: '#10B981' },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-black text-[#202c28]">Analizler</h1>
        <p className="text-sm text-[#98a191] mt-0.5">Mağaza performans raporu — Son 7 gün</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Eye, label: 'Sayfa Görüntüleme', value: '14.6K', change: '+18%', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
          { icon: Users, label: 'Tekil Ziyaretçi', value: '8.2K', change: '+12%', color: 'text-[#7c5e77]', bg: 'bg-[#f2eaf0] border-[#e4d5e1]' },
          { icon: MousePointerClick, label: 'Dönüşüm Oranı', value: '%3.2', change: '+0.4', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
          { icon: ShoppingBag, label: 'Toplam Sipariş', value: '422', change: '+89', color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`p-4 rounded-2xl border ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-[#98a191]">{s.label}</p>
              <span className="text-[10px] font-bold text-[#4d7138]">{s.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h2 className="font-bold text-[#202c28] flex items-center gap-2 mb-4"><BarChart3 className="h-4 w-4 text-[#4d7138]" />Trafik & Dönüşüm</h2>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={TRAFFIC} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1A1A22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F8FAFC', fontSize: 12 }} />
              <Area type="monotone" dataKey="ziyaret" stroke="#3B82F6" fill="url(#g1)" strokeWidth={2} />
              <Line type="monotone" dataKey="dönüsüm" stroke="#10B981" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h2 className="font-bold text-[#202c28] flex items-center gap-2 mb-4"><TrendingUp className="h-4 w-4 text-[#7c5e77]" />Trafik Kaynakları</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={SOURCES} innerRadius={45} outerRadius={75} dataKey="value">
                {SOURCES.map((s, i) => <Cell key={i} fill={s.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {SOURCES.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-[#5c6a56]"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.name}</span>
                <span className="font-bold text-[#202c28]">%{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
