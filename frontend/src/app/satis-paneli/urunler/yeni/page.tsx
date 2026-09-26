'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bot, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      toast.success('Ürün başarıyla oluşturuldu')
      setLoading(false)
      router.push('/satis-paneli/urunler')
    }, 600)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/satis-paneli/urunler" className="inline-flex items-center gap-1.5 text-sm text-[#7c7f8a] hover:text-[#23262b]">
        <ArrowLeft className="h-4 w-4" />Ürünlerime dön
      </Link>

      <h1 className="text-xl font-black text-[#23262b]">Yeni Ürün Ekle</h1>

      <form onSubmit={submit} className="space-y-5">
        <div className="glass-card p-5 space-y-4">
          <h2 className="font-bold text-[#23262b]">Temel Bilgiler</h2>

          <div>
            <label className="text-xs text-[#646773] block mb-1.5">Ürün Adı *</label>
            <input required className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" placeholder="iPhone 15 Pro Silikon Kılıf" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#646773] block mb-1.5">SKU *</label>
              <input required className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" placeholder="APKL-IP15-BLK" />
            </div>
            <div>
              <label className="text-xs text-[#646773] block mb-1.5">Kategori *</label>
              <select required className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] focus:outline-none focus:border-[#7d77c4]">
                <option className="bg-[#f4f3f9]">Seçiniz</option>
                <option className="bg-[#f4f3f9]">Elektronik / Telefon Aksesuar</option>
                <option className="bg-[#f4f3f9]">Elektronik / Şarj Cihazları</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[#646773] block mb-1.5">Kısa Açıklama</label>
            <input className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" placeholder="Premium silikon koruma" />
          </div>

          <div>
            <label className="text-xs text-[#646773] block mb-1.5">Detaylı Açıklama</label>
            <textarea rows={5} className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" placeholder="Ürün özelliklerini detaylı açıklayın..." />
          </div>

          <button type="button" className="inline-flex items-center gap-1.5 text-xs text-[#373071] hover:text-[#2e2862] font-bold">
            <Bot className="h-3.5 w-3.5" /> AI ile içerik üret (Claude)
          </button>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h2 className="font-bold text-[#23262b]">Fiyat & Stok</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-[#646773] block mb-1.5">Fiyat *</label>
              <input required type="number" className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b]" placeholder="299" />
            </div>
            <div>
              <label className="text-xs text-[#646773] block mb-1.5">İndirimli Fiyat</label>
              <input type="number" className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b]" placeholder="249" />
            </div>
            <div>
              <label className="text-xs text-[#646773] block mb-1.5">Maliyet</label>
              <input type="number" className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b]" placeholder="80" />
            </div>
            <div>
              <label className="text-xs text-[#646773] block mb-1.5">Stok *</label>
              <input required type="number" className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b]" placeholder="100" />
            </div>
          </div>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h2 className="font-bold text-[#23262b]">Görseller</h2>
          <div className="border-2 border-dashed border-[#e6e4f0] rounded-2xl p-8 text-center hover:border-[#a19bcc] transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto text-[#a3a5b0] mb-2" />
            <p className="text-sm text-[#646773]">Sürükle-bırak veya tıkla</p>
            <p className="text-xs text-[#8e909b] mt-1">PNG, JPG, WEBP — Maks 5 MB</p>
          </div>
          <p className="text-xs text-[#9c7226]">⚠️ SEO için her görsele alt-text zorunludur.</p>
        </div>

        <div className="glass-card p-5 space-y-4">
          <h2 className="font-bold text-[#23262b]">SEO</h2>
          <div>
            <label className="text-xs text-[#646773] block mb-1.5">SEO Başlığı</label>
            <input className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" placeholder="iPhone 15 Pro Silikon Kılıf Siyah" />
          </div>
          <div>
            <label className="text-xs text-[#646773] block mb-1.5">SEO Açıklama</label>
            <textarea rows={2} className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" placeholder="155 karakter altında özet" />
          </div>
        </div>

        <div className="flex justify-end gap-2 sticky bottom-4">
          <Link href="/satis-paneli/urunler" className="btn-ghost text-sm py-2.5 px-5 rounded-xl">İptal</Link>
          <button type="submit" disabled={loading} className="btn-primary text-sm py-2.5 px-5 rounded-xl flex items-center gap-1.5">
            <Save className="h-4 w-4" />
            {loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
          </button>
        </div>
      </form>
    </div>
  )
}
