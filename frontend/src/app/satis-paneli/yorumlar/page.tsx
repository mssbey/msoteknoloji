'use client'

import { Star, MessageCircle, ThumbsUp, AlertCircle } from 'lucide-react'
import { useState } from 'react'

const REVIEWS = [
  { id: 1, customer: 'Mehmet A.', product: 'iPhone 15 Pro Silikon Kılıf', rating: 5, comment: 'Çok kaliteli, tam oturuyor. Hızlı kargo için teşekkürler.', date: '2 gün önce', replied: true },
  { id: 2, customer: 'Ayşe K.', product: 'Samsung 65W Şarj Cihazı', rating: 4, comment: 'Hızlı şarj ediyor, fiyat performans iyi.', date: '5 gün önce', replied: false },
  { id: 3, customer: 'Can D.', product: 'iPhone 15 Pro Silikon Kılıf', rating: 3, comment: 'Renk kataloğa göre biraz farklı.', date: '1 hafta önce', replied: false },
]

export default function ReviewsPage() {
  const [filter, setFilter] = useState('all')

  return (
    <div className="space-y-5 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-black text-[#202c28]">Yorumlar</h1>
        <p className="text-sm text-[#98a191] mt-0.5">Müşteri yorumlarını yönetin ve yanıtlayın</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4 bg-gradient-to-br from-[#faf3e2] to-[#fdf7f0] border-[#ead9b0]">
          <Star className="h-5 w-5 text-[#9c7226] mb-2 fill-amber-400" />
          <p className="text-2xl font-black text-[#9c7226]">4.8</p>
          <p className="text-xs text-[#98a191]">Ortalama Puan</p>
        </div>
        <div className="glass-card p-4">
          <MessageCircle className="h-5 w-5 text-[#4d7138] mb-2" />
          <p className="text-2xl font-black text-[#4d7138]">237</p>
          <p className="text-xs text-[#98a191]">Toplam Yorum</p>
        </div>
        <div className="glass-card p-4">
          <AlertCircle className="h-5 w-5 text-[#b0463c] mb-2" />
          <p className="text-2xl font-black text-[#b0463c]">12</p>
          <p className="text-xs text-[#98a191]">Yanıt Bekleyen</p>
        </div>
        <div className="glass-card p-4">
          <ThumbsUp className="h-5 w-5 text-[#4d7138] mb-2" />
          <p className="text-2xl font-black text-[#4d7138]">%92</p>
          <p className="text-xs text-[#98a191]">Olumlu Oranı</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex gap-1 mb-4">
          {['all', 'pending', 'replied', '5', '4', '3'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`text-xs py-1.5 px-3 rounded-lg transition-all ${filter === f ? 'bg-[#e9f0dd] text-[#4d7138] border border-[#c8d9ae]' : 'text-[#8c958c] hover:text-[#202c28] hover:bg-[#f6f7f3]'}`}>
              {f === 'all' ? 'Tümü' : f === 'pending' ? 'Yanıtlanmadı' : f === 'replied' ? 'Yanıtlandı' : `${f}★`}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {REVIEWS.map((r) => (
            <div key={r.id} className="p-4 rounded-xl bg-[#f8f9f6] border border-[#eef0ea]">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#202c28] text-sm">{r.customer}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className={`h-3 w-3 ${i <= r.rating ? 'text-[#9c7226] fill-amber-400' : 'text-[#b6bdac]'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-[#98a191] mt-0.5">{r.product} · {r.date}</p>
                </div>
                {r.replied ? <span className="badge badge-green text-[10px]">Yanıtlandı</span> : <span className="badge badge-amber text-[10px]">Bekliyor</span>}
              </div>
              <p className="text-sm text-[#3d4a3a] leading-relaxed">{r.comment}</p>
              {!r.replied && (
                <button className="mt-3 text-xs text-[#4d7138] hover:text-[#33613f] font-bold">+ Yanıt yaz</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
