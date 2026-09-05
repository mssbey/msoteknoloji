'use client'

import { Users, UserPlus, Mail, MessageSquare, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const SEGMENTS = [
  { name: 'VIP Müşteriler', count: 124, desc: '5+ sipariş + ₺10K üstü harcama', color: 'from-amber-500 to-orange-500' },
  { name: 'Sepet Terk Edenler', count: 487, desc: 'Son 24 saat içinde ödeme yapmayan', color: 'from-red-500 to-rose-500' },
  { name: 'Yeni Lead\'ler', count: 1240, desc: 'Pop-up\'tan kayıt olan ama henüz almayan', color: 'from-blue-500 to-cyan-500' },
  { name: 'Sadık Müşteriler', count: 380, desc: '3+ ay aktif', color: 'from-green-500 to-emerald-500' },
]

const CUSTOMERS = [
  { name: 'Mehmet Yılmaz', email: 'm.yilmaz@email.com', orders: 12, spent: 18400, last: '2 gün önce' },
  { name: 'Ayşe Kaya', email: 'ayse.k@email.com', orders: 8, spent: 9200, last: '5 gün önce' },
  { name: 'Can Demir', email: 'can.d@email.com', orders: 4, spent: 3600, last: '12 gün önce' },
  { name: 'Fatma Yıldız', email: 'fatma@email.com', orders: 23, spent: 45200, last: '1 gün önce' },
]

export default function CrmPage() {
  const [tab, setTab] = useState<'segments' | 'customers'>('segments')

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">CRM</h1>
          <p className="text-sm text-white/40 mt-0.5">Müşteri segmentasyonu ve ilişki yönetimi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Toplam Müşteri', value: '2,847', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
          { icon: UserPlus, label: 'Bu Ay Yeni', value: '+187', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { icon: TrendingUp, label: 'Tekrarlayan', value: '%34', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
          { icon: Mail, label: 'Açık Lead', value: '1,240', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-white/8">
        {[{ k: 'segments', l: 'Segmentler' }, { k: 'customers', l: 'Tüm Müşteriler' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as 'segments' | 'customers')}
            className={`text-sm py-2 px-4 border-b-2 transition-all ${tab === k ? 'border-blue-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'segments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEGMENTS.map((s) => (
            <div key={s.name} className="glass-card p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} mb-3`}>
                <Users className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-bold text-white">{s.name}</h3>
              <p className="text-xs text-white/40 mt-0.5 mb-3">{s.desc}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-white">{s.count}</p>
                <button className="btn-ghost text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3" /> Mesaj Gönder
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-white/40 border-b border-white/8">
                <th className="pb-2 font-medium">Müşteri</th>
                <th className="pb-2 font-medium">Sipariş</th>
                <th className="pb-2 font-medium">Toplam Harcama</th>
                <th className="pb-2 font-medium">Son Aktivite</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/3">
                  <td className="py-3">
                    <p className="font-semibold text-white">{c.name}</p>
                    <p className="text-xs text-white/40">{c.email}</p>
                  </td>
                  <td className="py-3 text-white/70">{c.orders}</td>
                  <td className="py-3 font-bold text-white">₺{c.spent.toLocaleString('tr-TR')}</td>
                  <td className="py-3 text-xs text-white/40">{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
