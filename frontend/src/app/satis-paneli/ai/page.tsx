'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Sparkles, TrendingUp, Search, Tag, MessageSquare, Zap, RefreshCw, CheckCircle, AlertTriangle, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const AI_MODULES = [
  { icon: Search, label: 'SEO Asistan', desc: 'Ürün başlık ve açıklamalarını SEO\'ya göre optimize et', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]', badge: 'Aktif' },
  { icon: Sparkles, label: 'Ürün Yazarı', desc: 'AI ile profesyonel ürün açıklamaları oluştur', color: 'text-[#7c5e77]', bg: 'bg-[#f2eaf0] border-[#e4d5e1]', badge: 'Aktif' },
  { icon: TrendingUp, label: 'Fiyat Asistan', desc: 'Rakip fiyatlarını analiz et, optimal fiyat öner', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]', badge: 'Pro' },
  { icon: Tag, label: 'Kampanya Üretici', desc: 'Satışları artıracak kampanya fikirleri', color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]', badge: 'Aktif' },
  { icon: MessageSquare, label: 'WhatsApp Botu', desc: 'Müşteri sorularını otomatik yanıtla', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]', badge: 'Enterprise' },
]

const INSIGHTS = [
  { type: 'warning', icon: AlertTriangle, text: '18 ürünün SEO skoru 60\'ın altında — optimize et', action: 'Toplu Optimize', color: 'text-[#9c7226]', bg: 'bg-[#faf3e2] border-[#ead9b0]' },
  { type: 'trend', icon: TrendingUp, text: '"Gaming Mouse" bu hafta %240 trend! Stok ekle', action: 'Ürün Ekle', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
  { type: 'price', icon: Tag, text: 'Samsung Şarj Cihazı — rakipten %12 pahalısın', action: 'Fiyatı Güncelle', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
  { type: 'success', icon: CheckCircle, text: 'iPhone Kılıf ürününüz bu hafta en çok beğenilen', action: 'Detaylar', color: 'text-[#4d7138]', bg: 'bg-[#eef3e2] border-[#cfe0b8]' },
]

export default function SellerAIPage() {
  const [generating, setGenerating] = useState(false)
  const [productInput, setProductInput] = useState('')
  const [generatedContent, setGeneratedContent] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!productInput.trim()) return
    setGenerating(true)
    // Simüle edilmiş AI üretimi
    await new Promise((r) => setTimeout(r, 2000))
    setGeneratedContent(`**${productInput}** için SEO Optimize Başlık:\n"${productInput} - Orijinal Kalite | Hızlı Kargo | En İyi Fiyat"\n\nMeta Açıklama:\n"${productInput} ürününü en uygun fiyata satın alın. Ücretsiz kargo, 30 gün iade garantisi ile güvenle alışveriş yapın."`)
    setGenerating(false)
  }

  return (
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2f6045] to-[#33613f] shadow-lg shadow-[#244b37]/12">
          <Bot className="h-5 w-5 text-[#202c28]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-[#202c28]">AI Asistan</h1>
          <p className="text-sm text-[#98a191]">Yapay zeka destekli mağaza optimizasyonu</p>
        </div>
      </div>

      {/* Optimization Score */}
      <div className="glass-card p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-[#8c958c] mb-1">MAĞAZA OPTİMİZASYON SKORU</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-[#4d7138]">78</span>
              <span className="text-xl text-[#a8b09f]">/100</span>
            </div>
          </div>
          <span className="badge badge-blue">İyi Seviye</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
          {[
            { label: 'SEO', score: 82, color: '#3B82F6' },
            { label: 'Görseller', score: 65, color: '#F59E0B' },
            { label: 'Fiyat', score: 83, color: '#10B981' },
            { label: 'Müşteri', score: 91, color: '#7C3AED' },
            { label: 'Stok', score: 62, color: '#EF4444' },
          ].map((metric) => (
            <div key={metric.label} className="text-center p-3 rounded-xl bg-[#f8f9f6] border border-[#eef0ea]">
              <div className="relative h-12 w-12 mx-auto mb-2">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none"
                    stroke={metric.color} strokeWidth="2.5"
                    strokeDasharray={`${metric.score} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: metric.color }}>
                  {metric.score}
                </span>
              </div>
              <p className="text-[10px] text-[#8c958c]">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Generator */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-[#4d7138]" />
          <h3 className="font-bold text-[#202c28]">AI İçerik Üretici</h3>
        </div>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={productInput}
            onChange={(e) => setProductInput(e.target.value)}
            placeholder="Ürün adı veya SKU girin..."
            className="input-glass flex-1 py-2.5 text-sm"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleGenerate}
            disabled={generating || !productInput.trim()}
            className="btn-primary py-2.5 px-5 text-sm rounded-xl flex items-center gap-2 disabled:opacity-60 min-w-[120px] justify-center"
          >
            {generating ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Üretiyor...</>
            ) : (
              <><Zap className="h-4 w-4 fill-white" /> Üret</>
            )}
          </motion.button>
        </div>

        {generatedContent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-[#f1f5e8] border border-[#cfe0b8]"
          >
            <p className="text-sm text-[#3d4a3a] whitespace-pre-line">{generatedContent}</p>
            <div className="flex gap-2 mt-3">
              <button className="btn-primary py-2 px-4 text-xs rounded-xl flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5" />
                Uygula
              </button>
              <button className="btn-ghost py-2 px-4 text-xs rounded-xl">Düzenle</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* AI Insights */}
      <div className="glass-card p-5">
        <h3 className="font-bold text-[#202c28] flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-[#4d7138]" />
          AI Önerileri
        </h3>
        <div className="space-y-2.5">
          {INSIGHTS.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center justify-between p-3.5 rounded-xl border ${insight.bg}`}
            >
              <div className="flex items-center gap-3">
                <insight.icon className={`h-4.5 w-4.5 flex-shrink-0 ${insight.color}`} />
                <p className="text-sm text-[#4a563f]">{insight.text}</p>
              </div>
              <button className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ml-3 ${insight.color} hover:opacity-75 transition-opacity`}>
                {insight.action}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* AI Modules */}
      <div>
        <h3 className="font-bold text-[#202c28] mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-[#7c5e77]" />
          AI Modülleri
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {AI_MODULES.map((module, i) => (
            <motion.div
              key={module.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex flex-col p-4 rounded-2xl border ${module.bg} hover:scale-[1.02] transition-transform cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-current/10 ${module.color}`}>
                  <module.icon className="h-4.5 w-4.5" style={{ color: 'inherit' }} />
                </div>
                <span className={cn('badge text-[10px]', module.badge === 'Aktif' ? 'badge-green' : module.badge === 'Pro' ? 'badge-blue' : 'badge-purple')}>
                  {module.badge}
                </span>
              </div>
              <h4 className="font-semibold text-[#202c28] text-sm mb-1">{module.label}</h4>
              <p className="text-xs text-[#8c958c] leading-relaxed">{module.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
