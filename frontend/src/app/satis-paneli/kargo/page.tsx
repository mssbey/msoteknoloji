'use client'

import { Truck, Package, CheckCircle, Clock } from 'lucide-react'
import { useState } from 'react'

const SHIPMENTS = [
  { order: 'MSO260601', customer: 'Mehmet A.', company: 'Yurtiçi', code: 'YK4523912', status: 'Yolda', updated: '2 saat önce' },
  { order: 'MSO260600', customer: 'Ayşe K.', company: 'Aras', code: 'AR8821044', status: 'Teslim Edildi', updated: '1 gün önce' },
  { order: 'MSO260599', customer: 'Can D.', company: 'MNG', code: 'MNG6612301', status: 'Kargoya Verildi', updated: '5 saat önce' },
  { order: 'MSO260598', customer: 'Fatma Y.', company: 'PTT', code: 'PTT3398812', status: 'Şubede', updated: '3 saat önce' },
]

const STATUS_COLORS: Record<string, string> = {
  'Teslim Edildi': 'text-[#4d7138] bg-[#eef3e2]',
  'Yolda': 'text-[#4d7138] bg-[#eef3e2]',
  'Şubede': 'text-[#7c5e77] bg-[#f2eaf0]',
  'Kargoya Verildi': 'text-[#9c7226] bg-[#faf3e2]',
}

export default function CargoPage() {
  const [filter, setFilter] = useState('all')

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#202c28]">Kargo Yönetimi</h1>
          <p className="text-sm text-[#98a191] mt-0.5">Yurtiçi, Aras, MNG, PTT, DHL entegrasyonu</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock, label: 'Hazırlanıyor', value: 12, color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]' },
          { icon: Package, label: 'Kargoya Verildi', value: 8, color: 'text-[#7c5e77]', bg: 'bg-[#f2eaf0] border-[#e4d5e1]' },
          { icon: Truck, label: 'Yolda', value: 24, color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
          { icon: CheckCircle, label: 'Teslim Edildi', value: 187, color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
        ].map((s) => (
          <div key={s.label} className={`p-4 rounded-2xl border ${s.bg}`}>
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#98a191]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#202c28]">Aktif Gönderiler</h2>
          <div className="flex gap-1">
            {['all', 'preparing', 'shipped', 'delivered'].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs py-1.5 px-3 rounded-lg transition-all ${filter === f ? 'bg-[#e9f0dd] text-[#4d7138] border border-[#c8d9ae]' : 'text-[#8c958c] hover:text-[#202c28] hover:bg-[#f6f7f3]'}`}>
                {f === 'all' ? 'Tümü' : f === 'preparing' ? 'Hazırlanıyor' : f === 'shipped' ? 'Yolda' : 'Teslim'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[#98a191] border-b border-[#e3e7dd]">
                <th className="pb-2 font-medium">Sipariş</th>
                <th className="pb-2 font-medium">Müşteri</th>
                <th className="pb-2 font-medium">Kargo</th>
                <th className="pb-2 font-medium">Takip No</th>
                <th className="pb-2 font-medium">Durum</th>
                <th className="pb-2 font-medium">Güncellendi</th>
              </tr>
            </thead>
            <tbody>
              {SHIPMENTS.map((s, i) => (
                <tr key={i} className="border-b border-[#eef0ea] hover:bg-[#f8f9f6] transition-colors">
                  <td className="py-3 font-bold text-[#202c28]">#{s.order}</td>
                  <td className="py-3 text-[#5c6a56]">{s.customer}</td>
                  <td className="py-3 text-[#5c6a56]">{s.company}</td>
                  <td className="py-3"><code className="text-xs text-[#4d7138]">{s.code}</code></td>
                  <td className="py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status]}`}>{s.status}</span></td>
                  <td className="py-3 text-xs text-[#98a191]">{s.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
