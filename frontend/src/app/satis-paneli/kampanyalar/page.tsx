'use client'

import { Megaphone, Plus, Calendar, Zap, Target, TrendingUp } from 'lucide-react'

const CAMPAIGNS = [
  { name: 'Yaz Indirimleri', type: 'Sezon', discount: '%30 indirim', products: 47, status: 'Aktif', impressions: '24.2K', clicks: 1840, start: '01.06.2026', end: '31.07.2026' },
  { name: 'Black Friday Erken Kuş', type: 'Özel Gün', discount: '%50 indirim', products: 120, status: 'Planlandı', impressions: '0', clicks: 0, start: '20.11.2026', end: '30.11.2026' },
  { name: 'Hafta Sonu Fırsatı', type: 'Flash Sale', discount: '%20 indirim', products: 23, status: 'Aktif', impressions: '8.7K', clicks: 612, start: '31.05.2026', end: '02.06.2026' },
]

export default function CampaignsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#202c28]">Kampanyalar</h1>
          <p className="text-sm text-[#98a191] mt-0.5">Sezon, flash sale ve özel gün kampanyalarını yönetin</p>
        </div>
        <button className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Yeni Kampanya
        </button>
      </div>

      <div className="space-y-3">
        {CAMPAIGNS.map((c, i) => (
          <div key={i} className="glass-card p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5c7a4c] to-[#a4658a] shadow-lg shadow-[#244b37]/10 flex-shrink-0">
                <Megaphone className="h-5 w-5 text-[#202c28]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-black text-[#202c28]">{c.name}</h3>
                  <span className={`badge text-[10px] ${c.status === 'Aktif' ? 'badge-green' : 'badge-amber'}`}>{c.status}</span>
                  <span className="text-[10px] text-[#98a191]">· {c.type}</span>
                </div>
                <p className="text-sm text-[#4d7138] font-semibold">{c.discount} · {c.products} ürün</p>

                <div className="flex items-center gap-4 mt-3 text-xs text-[#8c958c] flex-wrap">
                  <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3" />{c.start} → {c.end}</span>
                  <span className="flex items-center gap-1.5"><Target className="h-3 w-3" />{c.impressions} gösterim</span>
                  <span className="flex items-center gap-1.5"><Zap className="h-3 w-3" />{c.clicks} tıklama</span>
                  <span className="flex items-center gap-1.5"><TrendingUp className="h-3 w-3 text-[#4d7138]" />CTR %{((c.clicks / Math.max(parseFloat(c.impressions.replace('K', '')) * 1000, 1)) * 100).toFixed(1)}</span>
                </div>
              </div>
              <button className="btn-ghost text-xs py-1.5 px-3 rounded-lg">Düzenle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
