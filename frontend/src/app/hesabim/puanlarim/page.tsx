'use client'

import { Star, Gift, TrendingUp, Award } from 'lucide-react'

const TRANSACTIONS = [
  { date: '01.06.2026', type: 'kazanım', desc: 'Sipariş #MSO260601 — 1299 TL', points: 129 },
  { date: '28.05.2026', type: 'kazanım', desc: 'Ürün yorumu — Silikon Kılıf', points: 25 },
  { date: '15.05.2026', type: 'harcama', desc: '50 TL indirim kuponuna çevrildi', points: -500 },
]

export default function PointsPage() {
  const total = 250

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-[#202c28]">Puanlarım</h1>

      {/* Hero */}
      <div className="glass-card p-6 bg-gradient-to-br from-[#faf3e2] to-[#fbf1e4] border-[#ead9b0]">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#d6ab52] to-[#a4652c] shadow-xl shadow-[#9c7226]/15">
            <Star className="h-7 w-7 text-[#202c28] fill-white" />
          </div>
          <div>
            <p className="text-xs text-[#6f7a68] mb-0.5">TOPLAM PUANINIZ</p>
            <p className="text-3xl font-black text-[#9c7226]">{total}</p>
            <p className="text-xs text-[#98a191] mt-0.5">≈ {(total / 10).toFixed(0)} TL değerinde</p>
          </div>
          <button className="ml-auto btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5" /> Kuponla Değiştir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass-card p-4">
          <Award className="h-5 w-5 text-[#4d7138] mb-2" />
          <p className="text-lg font-black text-[#202c28]">Bronz</p>
          <p className="text-xs text-[#98a191]">Mevcut seviyeniz</p>
        </div>
        <div className="glass-card p-4">
          <TrendingUp className="h-5 w-5 text-[#4d7138] mb-2" />
          <p className="text-lg font-black text-[#202c28]">750</p>
          <p className="text-xs text-[#98a191]">Gümüş&apos;e kalan puan</p>
        </div>
        <div className="glass-card p-4">
          <Gift className="h-5 w-5 text-[#7c5e77] mb-2" />
          <p className="text-lg font-black text-[#202c28]">%2</p>
          <p className="text-xs text-[#98a191]">Her alışverişten puan</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-[#202c28] mb-3">Puan Geçmişi</h2>
        <div className="space-y-1.5">
          {TRANSACTIONS.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9f6] border border-[#eef0ea]">
              <div>
                <p className="text-sm text-[#202c28]">{t.desc}</p>
                <p className="text-xs text-[#98a191]">{t.date}</p>
              </div>
              <p className={`font-black ${t.points > 0 ? 'text-[#4d7138]' : 'text-[#b0463c]'}`}>
                {t.points > 0 ? '+' : ''}{t.points}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
