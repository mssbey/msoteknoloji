'use client'

import { Tag, Plus, Copy, Calendar } from 'lucide-react'
import { toast } from 'sonner'

const COUPONS = [
  { code: 'YAZ2026', type: 'percent', amount: 15, used: 124, limit: 500, expires: '31.08.2026', active: true },
  { code: 'WELCOME15', type: 'percent', amount: 15, used: 89, limit: 10000, expires: '—', active: true, kaynak: 'Pop-up' },
  { code: 'KARGO50', type: 'fixed', amount: 50, used: 312, limit: 1000, expires: '15.07.2026', active: true },
  { code: 'YORUM25', type: 'fixed', amount: 25, used: 47, limit: 5000, expires: '—', active: true, kaynak: 'Yorum Ödülü' },
]

export default function CouponsPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Kuponlar</h1>
          <p className="text-sm text-white/40 mt-0.5">Pop-up, kutu içi, yorum ödülü ve manuel kupon yönetimi</p>
        </div>
        <button className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Yeni Kupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {COUPONS.map((c) => (
          <div key={c.code} className="glass-card p-4 relative">
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
                <Tag className="h-4 w-4 text-blue-400" />
              </div>
              {c.active ? <span className="badge badge-green text-[10px]">Aktif</span> : <span className="badge badge-amber text-[10px]">Pasif</span>}
            </div>

            <div className="flex items-center gap-1.5 mb-1">
              <code className="text-lg font-black text-white">{c.code}</code>
              <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Kupon kodu kopyalandı') }}
                className="text-white/30 hover:text-blue-400 transition-colors">
                <Copy className="h-3 w-3" />
              </button>
            </div>
            {c.kaynak && <p className="text-[10px] text-white/40 mb-2">{c.kaynak}</p>}

            <p className="text-xl font-black text-blue-400">{c.type === 'percent' ? `%${c.amount}` : `${c.amount} TL`}</p>
            <p className="text-xs text-white/40">indirim</p>

            <div className="mt-3 pt-3 border-t border-white/8 text-xs text-white/50 space-y-0.5">
              <p>Kullanım: <span className="text-white">{c.used} / {c.limit}</span></p>
              <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />Bitiş: <span className="text-white">{c.expires}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
