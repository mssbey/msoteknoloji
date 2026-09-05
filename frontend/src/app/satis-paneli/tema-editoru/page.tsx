'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Paintbrush, Megaphone, Gift, MessageCircle, Search, Eye, Save, RotateCcw, Check } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { resolveApiBaseUrl } from '@/lib/apiBase'

interface ThemeState {
  theme_color: string
  accent_color: string
  text_color: string
  announcement_text: string
  announcement_bg: string
  announcement_active: boolean
  whatsapp_number: string
  welcome_coupon_active: boolean
  welcome_coupon_percent: number
  seo_title: string
  seo_description: string
}

const DEFAULTS: ThemeState = {
  theme_color: '#3B82F6',
  accent_color: '#8B5CF6',
  text_color: '#FFFFFF',
  announcement_text: '',
  announcement_bg: '#1E40AF',
  announcement_active: false,
  whatsapp_number: '',
  welcome_coupon_active: false,
  welcome_coupon_percent: 10,
  seo_title: '',
  seo_description: '',
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#5c6a56]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-[#98a191]">{value}</span>
        <label className="relative cursor-pointer">
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <div
            className="h-8 w-10 rounded-lg border-2 border-[#d4ddc6] shadow-md"
            style={{ backgroundColor: value }}
          />
        </label>
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e3e7dd] bg-[#f8f9f6] p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e4edd4]">
          <Icon className="h-3.5 w-3.5 text-[#4d7138]" />
        </div>
        <h3 className="text-sm font-semibold text-[#202c28]">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

export default function ThemeEditorPage() {
  const { token } = useAuthStore()
  const [theme, setTheme] = useState<ThemeState>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor')

  const set = useCallback(<K extends keyof ThemeState>(key: K, value: ThemeState[K]) => {
    setTheme(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`${resolveApiBaseUrl()}/seller/store`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(theme),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('Kaydetme başarısız. Lütfen tekrar deneyin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black text-[#202c28]">Tema Editörü</h1>
          <p className="text-sm text-[#98a191] mt-0.5">Mağaza görünümünüzü kişiselleştirin</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(DEFAULTS)}
            className="flex items-center gap-2 rounded-xl border border-[#d4ddc6] px-3 py-2 text-sm text-[#8c958c] hover:text-[#202c28] hover:bg-[#f6f7f3] transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Sıfırla
          </button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#244b37] px-4 py-2 text-sm font-semibold text-[#f4f8ec] hover:bg-[#2f6045] transition-colors disabled:opacity-60"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? 'Kaydedildi' : saving ? 'Kaydediliyor...' : 'Kaydet'}
          </motion.button>
        </div>
      </div>

      {/* Tab switcher (mobile) */}
      <div className="flex gap-1 mb-5 rounded-xl bg-[#f6f7f3] p-1 lg:hidden">
        {(['editor', 'preview'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-[#f0f2ec] text-[#202c28]' : 'text-[#98a191]'
            }`}
          >
            {tab === 'editor' ? 'Düzenle' : 'Önizleme'}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Editor panel */}
        <div className={`flex-1 space-y-4 ${activeTab === 'preview' ? 'hidden lg:block' : ''}`}>

          {/* Renkler */}
          <SectionCard icon={Paintbrush} title="Marka Renkleri">
            <ColorPicker label="Ana Renk" value={theme.theme_color} onChange={v => set('theme_color', v)} />
            <ColorPicker label="Vurgu Rengi" value={theme.accent_color} onChange={v => set('accent_color', v)} />
            <ColorPicker label="Metin Rengi" value={theme.text_color} onChange={v => set('text_color', v)} />
          </SectionCard>

          {/* Duyuru Bandı */}
          <SectionCard icon={Megaphone} title="Duyuru Bandı">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#5c6a56]">Aktif</span>
              <div
                onClick={() => set('announcement_active', !theme.announcement_active)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  theme.announcement_active ? 'bg-[#244b37]' : 'bg-[#eef0ea]'
                }`}
              >
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  theme.announcement_active ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
            <div>
              <label className="text-xs text-[#98a191] mb-1 block">Mesaj</label>
              <input
                type="text"
                value={theme.announcement_text}
                onChange={e => set('announcement_text', e.target.value)}
                placeholder="🚀 Ücretsiz kargo 500 TL ve üzeri siparişlerde!"
                maxLength={200}
                className="w-full rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] px-3 py-2.5 text-sm text-[#202c28] placeholder-[#a8b09f] outline-none focus:border-[#7a9a55]"
              />
            </div>
            <ColorPicker label="Arka Plan Rengi" value={theme.announcement_bg} onChange={v => set('announcement_bg', v)} />
          </SectionCard>

          {/* Hoş Geldin Kuponu */}
          <SectionCard icon={Gift} title="Hoş Geldin Kuponu">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#5c6a56]">Aktif</span>
              <div
                onClick={() => set('welcome_coupon_active', !theme.welcome_coupon_active)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  theme.welcome_coupon_active ? 'bg-[#244b37]' : 'bg-[#eef0ea]'
                }`}
              >
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  theme.welcome_coupon_active ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
            <div>
              <label className="text-xs text-[#98a191] mb-1 block">İndirim Oranı (%{theme.welcome_coupon_percent})</label>
              <input
                type="range" min={1} max={50} step={1}
                value={theme.welcome_coupon_percent}
                onChange={e => set('welcome_coupon_percent', Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-[#a8b09f] mt-0.5">
                <span>%1</span><span>%50</span>
              </div>
            </div>
          </SectionCard>

          {/* WhatsApp */}
          <SectionCard icon={MessageCircle} title="WhatsApp Destek">
            <div>
              <label className="text-xs text-[#98a191] mb-1 block">Telefon Numarası (uluslararası)</label>
              <input
                type="text"
                value={theme.whatsapp_number}
                onChange={e => set('whatsapp_number', e.target.value)}
                placeholder="905XXXXXXXXX"
                className="w-full rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] px-3 py-2.5 text-sm text-[#202c28] placeholder-[#a8b09f] outline-none focus:border-[#7a9a55]"
              />
            </div>
          </SectionCard>

          {/* SEO */}
          <SectionCard icon={Search} title="SEO Bilgileri">
            <div>
              <label className="text-xs text-[#98a191] mb-1 block">Sayfa Başlığı</label>
              <input
                type="text"
                value={theme.seo_title}
                onChange={e => set('seo_title', e.target.value)}
                placeholder="Mağaza adı | MSO Teknoloji"
                maxLength={200}
                className="w-full rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] px-3 py-2.5 text-sm text-[#202c28] placeholder-[#a8b09f] outline-none focus:border-[#7a9a55]"
              />
            </div>
            <div>
              <label className="text-xs text-[#98a191] mb-1 block">Meta Açıklama</label>
              <textarea
                value={theme.seo_description}
                onChange={e => set('seo_description', e.target.value)}
                placeholder="Mağazanızın kısa açıklaması (150-160 karakter önerilir)"
                maxLength={300}
                rows={3}
                className="w-full rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] px-3 py-2.5 text-sm text-[#202c28] placeholder-[#a8b09f] outline-none focus:border-[#7a9a55] resize-none"
              />
              <p className="text-xs text-[#a8b09f] mt-1 text-right">{theme.seo_description.length}/300</p>
            </div>
          </SectionCard>
        </div>

        {/* Live Preview */}
        <div className={`w-80 flex-shrink-0 ${activeTab === 'editor' ? 'hidden lg:block' : ''}`}>
          <div className="sticky top-0">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-4 w-4 text-[#98a191]" />
              <span className="text-sm text-[#98a191]">Canlı Önizleme</span>
            </div>
            <div className="rounded-2xl border border-[#e3e7dd] overflow-hidden bg-[#f6f7f3] text-sm shadow-2xl">
              {/* Announcement bar preview */}
              {theme.announcement_active && theme.announcement_text && (
                <div
                  className="px-3 py-2 text-center text-xs font-medium"
                  style={{ backgroundColor: theme.announcement_bg, color: theme.text_color }}
                >
                  {theme.announcement_text}
                </div>
              )}
              {/* Store header preview */}
              <div
                className="px-4 py-4 flex items-center gap-3"
                style={{ backgroundColor: theme.theme_color + '22' }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg"
                  style={{ backgroundColor: theme.theme_color, color: theme.text_color }}
                >
                  M
                </div>
                <div>
                  <p className="font-bold text-[#202c28] text-sm">Mağaza Adı</p>
                  <p className="text-xs text-[#98a191]">500+ Ürün</p>
                </div>
              </div>
              {/* Product cards preview */}
              <div className="p-4 grid grid-cols-2 gap-2">
                {[1, 2].map(i => (
                  <div key={i} className="rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] p-2">
                    <div className="aspect-square rounded-lg mb-2" style={{ backgroundColor: theme.accent_color + '33' }} />
                    <p className="text-xs text-[#5c6a56] mb-1">Ürün Adı</p>
                    <p className="text-xs font-bold" style={{ color: theme.theme_color }}>₺1.299</p>
                  </div>
                ))}
              </div>
              {/* CTA preview */}
              <div className="px-4 pb-4">
                <div
                  className="rounded-xl py-2.5 text-center text-xs font-semibold cursor-pointer"
                  style={{ backgroundColor: theme.theme_color, color: theme.text_color }}
                >
                  Sepete Ekle
                </div>
              </div>
              {/* Coupon badge preview */}
              {theme.welcome_coupon_active && (
                <div className="mx-4 mb-4 rounded-xl border border-dashed border-[#b9d09c] bg-[#f1f5e8] p-2.5 text-center">
                  <p className="text-xs text-[#4d7138] font-semibold">
                    🎁 İlk Alışverişe %{theme.welcome_coupon_percent} İndirim!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
