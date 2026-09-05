'use client'

import { useState } from 'react'

export default function CookiesPage() {
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(false)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-[#202c28]">Cerez Politikasi</h1>
      <section className="glass-card p-6 space-y-4 text-sm text-[#4a563f] leading-relaxed">
        <p>Zorunlu cerezler sitenin temel islevleri icin gereklidir. Analitik ve pazarlama cerezleri acik rizaniza baglidir.</p>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#f6f7f3] border border-[#e3e7dd]">
            <span>Zorunlu Cerezler</span>
            <span className="text-xs text-[#4d7138]">Her zaman acik</span>
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#f6f7f3] border border-[#e3e7dd]">
            <span>Analitik Cerezler</span>
            <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
          </label>
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#f6f7f3] border border-[#e3e7dd]">
            <span>Pazarlama Cerezleri</span>
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
          </label>
        </div>
      </section>
    </main>
  )
}
