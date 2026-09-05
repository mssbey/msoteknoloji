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
      <h1 className="text-xl font-black text-[#202c28] flex items-center gap-2"><Settings className="h-5 w-5 text-[#4d7138]" />Ayarlar</h1>

      <div className="flex gap-1 border-b border-[#e3e7dd] overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`text-sm py-2 px-4 border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === key ? 'border-[#4d7138] text-[#202c28]' : 'border-transparent text-[#98a191] hover:text-[#5c6a56]'}`}>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6 max-w-2xl">
        {tab === 'profile' && (
          <div className="space-y-4">
            <h2 className="font-bold text-[#202c28]">Hesap Bilgileri</h2>
            <input className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28]" placeholder="Ad Soyad" defaultValue="TechStore Demo" />
            <input className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28]" placeholder="E-posta" defaultValue="seller@msocommerce.com" />
            <input className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28]" placeholder="Telefon" defaultValue="0555 123 45 67" />
            <button onClick={() => toast.success('Profil güncellendi')} className="btn-primary text-sm py-2 px-5 rounded-xl">Kaydet</button>
          </div>
        )}
        {tab === 'store' && (
          <div className="space-y-4">
            <h2 className="font-bold text-[#202c28]">Mağaza Ayarları</h2>
            <p className="text-sm text-[#8c958c]">Logo, renk, banner ve mağaza tasarımı için <Link href="/satis-paneli/tema-editoru" className="text-[#4d7138] hover:text-[#33613f]">Tema Editörü</Link>&apos;nü kullanın.</p>
          </div>
        )}
        {tab === 'subscription' && (
          <div className="space-y-4">
            <h2 className="font-bold text-[#202c28]">Aboneliğiniz</h2>
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#f2eaf0] to-[#f4f7ec] border border-[#e4d5e1]">
              <p className="text-xs text-[#6f7a68] mb-1">Mevcut Paket</p>
              <p className="text-xl font-black text-[#7c5e77]">Professional</p>
              <p className="text-xs text-[#98a191] mt-1">2000 ürün limit · 699 TL/ay · 0% komisyon</p>
              <p className="text-xs text-[#8c958c] mt-3">Bir sonraki yenileme: <span className="text-[#202c28]">15 Temmuz 2026</span></p>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm py-2 px-4 rounded-xl">Paketi Yükselt</button>
              <button className="btn-ghost text-sm py-2 px-4 rounded-xl">Faturalandırma</button>
            </div>
          </div>
        )}
        {tab === 'integrations' && (
          <div className="space-y-4">
            <h2 className="font-bold text-[#202c28]">Entegrasyonlar</h2>
            {[
              { name: 'Sentos', desc: 'Ürün, stok ve sipariş senkronu', status: 'Bağlı' },
              { name: 'Meta Ads', desc: 'Pixel + Conversions API', status: 'Bağlı' },
              { name: 'Google Analytics 4', desc: 'Trafik ve dönüşüm', status: 'Yapılandırma Gerekiyor' },
              { name: 'PayTR', desc: 'Ödeme alımı', status: 'Bağlı' },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9f6] border border-[#eef0ea]">
                <div>
                  <p className="font-semibold text-[#202c28]">{i.name}</p>
                  <p className="text-xs text-[#98a191]">{i.desc}</p>
                </div>
                <span className={`badge text-[10px] ${i.status === 'Bağlı' ? 'badge-green' : 'badge-amber'}`}>{i.status}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="font-bold text-[#202c28]">Bildirim Tercihleri</h2>
            <p className="text-sm text-[#8c958c]">Yeni sipariş, düşük stok, yorum bildirimleri ve diğer satıcı uyarıları.</p>
          </div>
        )}
      </div>
    </div>
  )
}
