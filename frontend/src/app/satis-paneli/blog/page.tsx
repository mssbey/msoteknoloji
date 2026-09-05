'use client'

import { FileText, Plus, Edit2, Eye } from 'lucide-react'

const POSTS = [
  { title: 'iPhone 15 Pro Kılıf Seçimi Rehberi', status: 'Yayında', views: 2840, date: '15.05.2026' },
  { title: 'Hızlı Şarj Teknolojisi Nasıl Çalışır?', status: 'Yayında', views: 1240, date: '08.05.2026' },
  { title: 'Galaxy S24 İncelemesi', status: 'Taslak', views: 0, date: '—' },
]

export default function BlogPage() {
  return (
    <div className="space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#202c28]">Blog Yazıları</h1>
          <p className="text-sm text-[#98a191] mt-0.5">SEO için içerik üretimi ve mağaza blog yönetimi</p>
        </div>
        <button className="btn-primary text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Yeni Yazı
        </button>
      </div>

      <div className="space-y-2">
        {POSTS.map((p, i) => (
          <div key={i} className="glass-card p-4 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eef3e2] flex-shrink-0">
              <FileText className="h-4 w-4 text-[#4d7138]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#202c28]">{p.title}</p>
              <div className="flex items-center gap-3 text-xs text-[#98a191] mt-0.5">
                <span>{p.date}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views} okuma</span>
              </div>
            </div>
            <span className={`badge text-[10px] ${p.status === 'Yayında' ? 'badge-green' : 'badge-amber'}`}>{p.status}</span>
            <button className="btn-ghost text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5">
              <Edit2 className="h-3 w-3" /> Düzenle
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
