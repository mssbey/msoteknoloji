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
      <h1 className="text-xl font-black text-white">Güvenlik</h1>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-1 flex items-center gap-2"><Lock className="h-4 w-4 text-blue-400" />Şifre Değiştir</h2>
        <p className="text-xs text-white/40 mb-4">En az 8 karakter, büyük/küçük harf ve rakam içermeli.</p>
        <form onSubmit={change} className="space-y-3 max-w-md">
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required placeholder="Mevcut şifre"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" />
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required placeholder="Yeni şifre"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required placeholder="Yeni şifre (tekrar)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" />
          <button type="submit" disabled={loading} className="btn-primary text-sm py-2 px-5 rounded-xl">
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-1 flex items-center gap-2"><Smartphone className="h-4 w-4 text-purple-400" />2 Adımlı Doğrulama</h2>
        <p className="text-xs text-white/40 mb-4">SMS ile her girişte ek güvenlik kodu doğrulaması.</p>
        <button className="btn-ghost text-sm py-2 px-5 rounded-xl">Aktifleştir</button>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-1 flex items-center gap-2"><Shield className="h-4 w-4 text-green-400" />Aktif Oturumlar</h2>
        <p className="text-xs text-white/40 mb-4">Hesabınıza giriş yapılmış cihazlar.</p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <div>
            <p className="text-sm font-semibold text-white">Bu Cihaz</p>
            <p className="text-xs text-white/40">Aktif şu an</p>
          </div>
          <span className="badge badge-green text-[10px]">Mevcut</span>
        </div>
        <button className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300">
          <LogOut className="h-3.5 w-3.5" /> Diğer cihazlardan çıkış yap
        </button>
      </div>
    </div>
  )
}
