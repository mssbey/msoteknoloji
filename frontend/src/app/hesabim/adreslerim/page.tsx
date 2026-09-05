'use client'

import { useState } from 'react'
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from 'lucide-react'

interface Address {
  id: number
  title: string
  type: 'home' | 'office'
  full_name: string
  phone: string
  city: string
  district: string
  address: string
  is_default: boolean
}

const SAMPLE: Address[] = [
  {
    id: 1, title: 'Ev', type: 'home',
    full_name: 'Mehmet Yılmaz', phone: '0555 123 45 67',
    city: 'İstanbul', district: 'Kadıköy',
    address: 'Caferağa Mah. Moda Cad. No:42 D:5',
    is_default: true,
  },
]

export default function AddressesPage() {
  const [addresses] = useState<Address[]>(SAMPLE)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black text-white">Adreslerim</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Yeni Adres
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MapPin className="h-12 w-12 mx-auto mb-3 text-white/15" />
          <p className="text-white/50">Kayıtlı adresiniz yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="glass-card p-5 relative">
              {a.is_default && <span className="absolute top-3 right-3 badge badge-blue text-[10px]">Varsayılan</span>}
              <div className="flex items-center gap-2 mb-2">
                {a.type === 'home' ? <Home className="h-4 w-4 text-blue-400" /> : <Briefcase className="h-4 w-4 text-purple-400" />}
                <h3 className="font-bold text-white">{a.title}</h3>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{a.full_name}<br />{a.address}<br />{a.district} / {a.city}<br /><span className="text-white/40">{a.phone}</span></p>
              <div className="flex gap-2 mt-4">
                <button className="btn-ghost text-xs py-1.5 px-3 rounded-lg flex items-center gap-1"><Edit2 className="h-3 w-3" /> Düzenle</button>
                <button className="text-xs py-1.5 px-3 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-1"><Trash2 className="h-3 w-3" /> Sil</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass-card p-6 w-full max-w-md">
            <h2 className="text-lg font-black text-white mb-4">Yeni Adres</h2>
            <div className="space-y-3">
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" placeholder="Adres başlığı (Ev / İş)" />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" placeholder="Ad Soyad" />
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" placeholder="Telefon" />
              <div className="grid grid-cols-2 gap-2">
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" placeholder="Şehir" />
                <input className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" placeholder="İlçe" />
              </div>
              <textarea rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" placeholder="Açık adres" />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 btn-ghost text-sm py-2 rounded-xl">İptal</button>
              <button onClick={() => setShowForm(false)} className="flex-1 btn-primary text-sm py-2 rounded-xl">Kaydet</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
