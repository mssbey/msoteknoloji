'use client'

import { useState } from 'react'
import { Settings, Store, CreditCard, Plug, Bell, User } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

const TABS = [
  { key: 'profile', label: 'Profil', icon: User },
  { key: 'store', label: 'Mağaza', icon: Store },
  { key: 'subscription', label: 'Abonelik', icon: CreditCard },
  { key: 'integrations', label: 'Entegrasyonlar', icon: Plug },
  { key: 'notifications', label: 'Bildirimler', icon: Bell },
] as const

export default function SettingsPage() {
  const [tab, setTab] = useState<typeof TABS[number]['key']>('profile')

  return (
    <div className="space-y-5 max-w-[1400px]">
      <h1 className="text-xl font-black text-white flex items-center gap-2"><Settings className="h-5 w-5 text-blue-400" />Ayarlar</h1>

      <div className="flex gap-1 border-b border-white/8 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`text-sm py-2 px-4 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === key ? 'border-blue-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'}`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 max-w-2xl">
        {tab === 'profile' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Hesap Bilgileri</h2>
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Ad Soyad" defaultValue="TechStore Demo" />
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="E-posta" defaultValue="seller@msocommerce.com" />
            <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Telefon" defaultValue="0555 123 45 67" />
            <button onClick={() => toast.success('Profil güncellendi')} className="btn-primary text-sm py-2 px-5 rounded-xl">Kaydet</button>
          </div>
        )}
        {tab === 'store' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Mağaza Ayarları</h2>
            <p className="text-sm text-white/50">Logo, renk, banner ve mağaza tasarımı için <Link href="/satis-paneli/tema-editoru" className="text-blue-400 hover:text-blue-300">Tema Editörü</Link>&apos;nü kullanın.</p>
          </div>
        )}
        {tab === 'subscription' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Aboneliğiniz</h2>
            <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
              <p className="text-xs text-white/60 mb-1">Mevcut Paket</p>
              <p className="text-xl font-black text-purple-400">Professional</p>
              <p className="text-xs text-white/40 mt-1">2000 ürün limit · 699 TL/ay · 0% komisyon</p>
              <p className="text-xs text-white/50 mt-3">Bir sonraki yenileme: <span className="text-white">15 Temmuz 2026</span></p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-2 px-4 rounded-xl">Paketi Yükselt</button>
              <button className="btn-ghost text-sm py-2 px-4 rounded-xl">Faturalandırma</button>
            </div>
          </div>
        )}
        {tab === 'integrations' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Entegrasyonlar</h2>
            {[
              { name: 'Sentos', desc: 'Ürün, stok ve sipariş senkronu', status: 'Bağlı' },
              { name: 'Meta Ads', desc: 'Pixel + Conversions API', status: 'Bağlı' },
              { name: 'Google Analytics 4', desc: 'Trafik ve dönüşüm', status: 'Yapılandırma Gerekiyor' },
              { name: 'PayTR', desc: 'Ödeme alımı', status: 'Bağlı' },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
                <div>
                  <p className="font-semibold text-white">{i.name}</p>
                  <p className="text-xs text-white/40">{i.desc}</p>
                </div>
                <span className={`badge text-[10px] ${i.status === 'Bağlı' ? 'badge-green' : 'badge-amber'}`}>{i.status}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="font-bold text-white">Bildirim Tercihleri</h2>
            <p className="text-sm text-white/50">Yeni sipariş, düşük stok, yorum bildirimleri ve diğer satıcı uyarıları.</p>
          </div>
        )}
      </div>
    </div>
  )
}
