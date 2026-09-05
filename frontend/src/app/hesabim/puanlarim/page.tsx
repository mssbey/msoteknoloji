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
      <h1 className="text-xl font-black text-white">Puanlarım</h1>

      {/* Hero */}
      <div className="glass-card p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30">
            <Star className="h-7 w-7 text-white fill-white" />
          </div>
          <div>
            <p className="text-xs text-white/60 mb-0.5">TOPLAM PUANINIZ</p>
            <p className="text-3xl font-black text-amber-400">{total}</p>
            <p className="text-xs text-white/40 mt-0.5">≈ {(total / 10).toFixed(0)} TL değerinde</p>
          </div>
          <button className="ml-auto btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5">
            <Gift className="h-3.5 w-3.5" /> Kuponla Değiştir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="glass-card p-4">
          <Award className="h-5 w-5 text-blue-400 mb-2" />
          <p className="text-lg font-black text-white">Bronz</p>
          <p className="text-xs text-white/40">Mevcut seviyeniz</p>
        </div>
        <div className="glass-card p-4">
          <TrendingUp className="h-5 w-5 text-green-400 mb-2" />
          <p className="text-lg font-black text-white">750</p>
          <p className="text-xs text-white/40">Gümüş&apos;e kalan puan</p>
        </div>
        <div className="glass-card p-4">
          <Gift className="h-5 w-5 text-purple-400 mb-2" />
          <p className="text-lg font-black text-white">%2</p>
          <p className="text-xs text-white/40">Her alışverişten puan</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-3">Puan Geçmişi</h2>
        <div className="space-y-1.5">
          {TRANSACTIONS.map((t, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
              <div>
                <p className="text-sm text-white">{t.desc}</p>
                <p className="text-xs text-white/40">{t.date}</p>
              </div>
              <p className={`font-black ${t.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {t.points > 0 ? '+' : ''}{t.points}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
