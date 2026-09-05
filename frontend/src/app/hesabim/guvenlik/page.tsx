'use client'

import { useState } from 'react'
import { Lock, Smartphone, Shield, LogOut } from 'lucide-react'
import { toast } from 'sonner'

export default function SecurityPage() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const change = async (e: React.FormEvent) => {
    e.preventDefault()
    if (next !== confirm) return toast.error('Yeni şifreler eşleşmiyor')
    if (next.length < 8) return toast.error('Şifre en az 8 karakter olmalı')
    setLoading(true)
    setTimeout(() => {
      toast.success('Şifre güncellendi')
      setCurrent(''); setNext(''); setConfirm('')
      setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-[#202c28]">Güvenlik</h1>

      <div className="glass-card p-5">
        <h2 className="font-bold text-[#202c28] mb-1 flex items-center gap-2"><Lock className="h-4 w-4 text-[#4d7138]" />Şifre Değiştir</h2>
        <p className="text-xs text-[#98a191] mb-4">En az 8 karakter, büyük/küçük harf ve rakam içermeli.</p>
        <form onSubmit={change} className="space-y-3 max-w-md">
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required placeholder="Mevcut şifre"
            className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f] focus:outline-none focus:border-[#8fab6a]" />
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required placeholder="Yeni şifre"
            className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f] focus:outline-none focus:border-[#8fab6a]" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Yeni şifre (tekrar)"
            className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f] focus:outline-none focus:border-[#8fab6a]" />
          <button type="submit" disabled={loading} className="btn-primary text-sm py-2 px-5 rounded-xl">
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-[#202c28] mb-1 flex items-center gap-2"><Smartphone className="h-4 w-4 text-[#7c5e77]" />2 Adımlı Doğrulama</h2>
        <p className="text-xs text-[#98a191] mb-4">SMS ile her girişte ek güvenlik kodu doğrulaması.</p>
        <button className="btn-ghost text-sm py-2 px-5 rounded-xl">Aktifleştir</button>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-[#202c28] mb-1 flex items-center gap-2"><Shield className="h-4 w-4 text-[#4d7138]" />Aktif Oturumlar</h2>
        <p className="text-xs text-[#98a191] mb-4">Hesabınıza giriş yapılmış cihazlar.</p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f9f6] border border-[#eef0ea]">
          <div>
            <p className="text-sm font-semibold text-[#202c28]">Bu Cihaz</p>
            <p className="text-xs text-[#98a191]">Aktif şu an</p>
          </div>
          <span className="badge badge-green text-[10px]">Mevcut</span>
        </div>
        <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#b0463c] hover:text-[#b0463c]">
          <LogOut className="h-3.5 w-3.5" /> Diğer cihazlardan çıkış yap
        </button>
      </div>
    </div>
  )
}
