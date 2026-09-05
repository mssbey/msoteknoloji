'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Timer, ArrowRight, Percent } from 'lucide-react'
import { useState, useEffect } from 'react'

function CountdownTimer({ endHours }: { endHours: number }) {
  const [time, setTime] = useState({ h: endHours, m: 59, s: 59 })

  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return prev
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1">
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-sm font-black text-white">
            {pad(val)}
          </span>
          {i < 2 && <span className="text-white/60 font-bold">:</span>}
        </span>
      ))}
    </div>
  )
}

const BANNERS = [
  {
    label: 'FLASH SALE',
    title: 'Flaş İndirim',
    subtitle: '%50\'ye kadar',
    desc: 'Sınırlı süre, sınırlı stok',
    cta: 'Hemen Al',
    href: '/flash-satis',
    gradient: 'from-orange-600/40 via-red-600/30 to-pink-600/20',
    accent: '#F97316',
    icon: '⚡',
    hasTimer: true,
  },
  {
    label: 'YENİ GELENLER',
    title: '2026 Modelleri',
    subtitle: 'İlk gün fırsatı',
    desc: 'En yeni ürünler mağazamızda',
    cta: 'İncele',
    href: '/yeni-gelenler',
    gradient: 'from-blue-600/40 via-blue-500/30 to-cyan-600/20',
    accent: '#3B82F6',
    icon: '✨',
    hasTimer: false,
  },
  {
    label: 'SÜPER FIRSATLAR',
    title: 'Cumartesi Deals',
    subtitle: 'Her Cumartesi',
    desc: 'Haftalık özel fırsatlar kaçmaz',
    cta: 'Fırsatları Gör',
    href: '/firsatlar',
    gradient: 'from-purple-600/40 via-violet-500/30 to-indigo-600/20',
    accent: '#7C3AED',
    icon: '🎯',
    hasTimer: false,
  },
]

export function CampaignBanners() {
  return (
    <section className="py-8 px-4">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BANNERS.map((banner, i) => (
            <motion.div
              key={banner.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link
                href={banner.href}
                className={`relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${banner.gradient} p-6 h-44 group`}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `radial-gradient(ellipse at 20% 50%, ${banner.accent}20, transparent 60%)` }}
                />

                <div className="relative z-10">
                  <span
                    className="inline-block text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full mb-3"
                    style={{ background: `${banner.accent}25`, color: banner.accent, border: `1px solid ${banner.accent}40` }}
                  >
                    {banner.label}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{banner.icon}</span>
                    <div>
                      <h3 className="text-xl font-black text-white">{banner.title}</h3>
                      <p className="text-sm font-bold" style={{ color: banner.accent }}>{banner.subtitle}</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex items-center justify-between">
                  {banner.hasTimer ? (
                    <CountdownTimer endHours={4} />
                  ) : (
                    <p className="text-xs text-white/50">{banner.desc}</p>
                  )}
                  <span className="flex items-center gap-1 text-xs font-bold text-white/80 group-hover:text-white group-hover:translate-x-1 transition-all">
                    {banner.cta}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
