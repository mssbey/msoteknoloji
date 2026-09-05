'use client'

import { Users, UserPlus, Mail, MessageSquare, TrendingUp } from 'lucide-react'
import { useState } from 'react'

const SEGMENTS = [
  { name: 'VIP Müşteriler', count: 124, desc: '5+ sipariş + ₺10K üstü harcama', color: 'from-[#c99a3f] to-[#a4652c]' },
  { name: 'Sepet Terk Edenler', count: 487, desc: 'Son 24 saat içinde ödeme yapmayan', color: 'from-[#b0463c] to-[#b0463c]' },
  { name: 'Yeni Lead\'ler', count: 1240, desc: 'Pop-up\'tan kayıt olan ama henüz almayan', color: 'from-[#2f6045] to-[#3f7a6a]' },
  { name: 'Sadık Müşteriler', count: 380, desc: '3+ ay aktif', color: 'from-[#4d7138] to-[#4d7138]' },
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
          <h1 className="text-xl font-black text-[#202c28]">CRM</h1>
          <p className="text-sm text-[#98a191] mt-0.5">Müşteri segmentasyonu ve ilişki yönetimi</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, label: 'Toplam Müşteri', value: '2,847', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
          { icon: UserPlus, label: 'Bu Ay Yeni', value: '+187', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
          { icon: TrendingUp, label: 'Tekrarlayan', value: '%34', color: 'text-[#7c5e77]', bg: 'bg-[#f2eaf0] border-[#e4d5e1]' },
          { icon: Mail, label: 'Açık Lead', value: '1,240', color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#98a191]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 border-b border-[#e3e7dd]">
        {[{ k: 'segments', l: 'Segmentler' }, { k: 'customers', l: 'Tüm Müşteriler' }].map(({ k, l }) => (
          <button key={k} onClick={() => setTab(k as 'segments' | 'customers')}
            className={`text-sm py-2 px-4 border-b-2 transition-all ${tab === k ? 'border-[#4d7138] text-[#202c28]' : 'border-transparent text-[#98a191] hover:text-[#5c6a56]'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'segments' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SEGMENTS.map((s) => (
            <div key={s.name} className="glass-card p-5">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} mb-3`}>
                <Users className="h-4 w-4 text-[#202c28]" />
              </div>
              <h3 className="font-bold text-[#202c28]">{s.name}</h3>
              <p className="text-xs text-[#98a191] mt-0.5 mb-3">{s.desc}</p>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-black text-[#202c28]">{s.count}</p>
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
              <tr className="text-left text-xs text-[#98a191] border-b border-[#e3e7dd]">
                <th className="pb-2 font-medium">Müşteri</th>
                <th className="pb-2 font-medium">Sipariş</th>
                <th className="pb-2 font-medium">Toplam Harcama</th>
                <th className="pb-2 font-medium">Son Aktivite</th>
              </tr>
            </thead>
            <tbody>
              {CUSTOMERS.map((c, i) => (
                <tr key={i} className="border-b border-[#eef0ea] hover:bg-[#f8f9f6]">
                  <td className="py-3">
                    <p className="font-semibold text-[#202c28]">{c.name}</p>
                    <p className="text-xs text-[#98a191]">{c.email}</p>
                  </td>
                  <td className="py-3 text-[#5c6a56]">{c.orders}</td>
                  <td className="py-3 font-bold text-[#202c28]">₺{c.spent.toLocaleString('tr-TR')}</td>
                  <td className="py-3 text-xs text-[#98a191]">{c.last}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
