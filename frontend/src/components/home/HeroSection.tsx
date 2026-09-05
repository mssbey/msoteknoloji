'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Sparkles, Zap, TrendingUp, Shield } from 'lucide-react'

const SLIDES = [
  {
    badge: '🔥 Yaz Kampanyası',
    headline: ['Teknolojide', 'Yeni Bir', 'Çağ'],
    highlightWord: 'Çağ',
    sub: 'En son teknoloji ürünleri, en iyi fiyatlarla. AI destekli alışveriş deneyimiyle tanışın.',
    cta: 'Keşfet',
    ctaHref: '/kampanyalar',
    secondaryCta: 'Mağazaları Gör',
    secondaryHref: '/magazalar',
    accent: 'from-blue-600 to-blue-400',
    glow: 'rgba(59,130,246,0.25)',
    emoji: '🚀',
    bgAccent: 'rgba(37,99,235,0.12)',
  },
  {
    badge: '⚡ Flaş İndirim',
    headline: ['Fiyatları', 'Görünce', 'Şaşıracaksın'],
    highlightWord: 'Şaşıracaksın',
    sub: '%50\'ye varan indirimler, sınırlı süre. Sepetini doldurmak için doğru an!',
    cta: 'İndirimleri Gör',
    ctaHref: '/indirimler',
    secondaryCta: 'Tüm Ürünler',
    secondaryHref: '/urunler',
    accent: 'from-purple-600 to-pink-500',
    glow: 'rgba(124,58,237,0.25)',
    emoji: '⚡',
    bgAccent: 'rgba(124,58,237,0.12)',
  },
  {
    badge: '🛡️ Güvenli Alışveriş',
    headline: ['30 Gün', 'İade', 'Garantisi'],
    highlightWord: 'Garantisi',
    sub: 'Risk almadan alışveriş yapın. Beğenmezseniz iade edin, soru sorulmaz.',
    cta: 'Alışverişe Başla',
    ctaHref: '/',
    secondaryCta: 'Nasıl Çalışır',
    secondaryHref: '/iade',
    accent: 'from-emerald-600 to-teal-400',
    glow: 'rgba(16,185,129,0.25)',
    emoji: '🛡️',
    bgAccent: 'rgba(16,185,129,0.12)',
  },
]

const PARTICLES = [
  { size: 3, left: '10%', top: '20%' },
  { size: 5, left: '25%', top: '45%' },
  { size: 4, left: '40%', top: '70%' },
  { size: 3, left: '55%', top: '20%' },
  { size: 5, left: '70%', top: '45%' },
  { size: 4, left: '85%', top: '70%' },
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % SLIDES.length), 5500)
    return () => clearInterval(t)
  }, [])

  const slide = SLIDES[current]

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Animated ambient background */}
      <div className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{ background: `radial-gradient(ellipse 70% 60% at 30% 50%, ${slide.bgAccent}, transparent 70%)` }}
          />
        </AnimatePresence>

        {/* Static grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Floating particles */}
        {PARTICLES.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.left,
              top: particle.top,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + i * 0.7,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] w-full px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Content */}
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-4 py-1.5 text-sm font-medium text-white/80 mb-6 backdrop-blur-sm"
                >
                  <span>{slide.badge}</span>
                </motion.div>

                {/* Headline */}
                <h1 className="text-6xl md:text-7xl xl:text-8xl font-black leading-[0.9] mb-6">
                  {slide.headline.map((word, i) => (
                    <span key={i} className="block">
                      {word === slide.highlightWord ? (
                        <span className={`bg-gradient-to-r ${slide.accent} bg-clip-text text-transparent`}>
                          {word}
                        </span>
                      ) : (
                        <span className="text-white">{word}</span>
                      )}
                    </span>
                  ))}
                </h1>

                <p className="text-base md:text-lg text-white/55 max-w-md leading-relaxed mb-8">
                  {slide.sub}
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href={slide.ctaHref}
                      className="btn-primary text-base py-3.5 px-7 rounded-2xl flex items-center gap-2"
                    >
                      {slide.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href={slide.secondaryHref}
                      className="btn-ghost text-base py-3.5 px-7 rounded-2xl"
                    >
                      {slide.secondaryCta}
                    </Link>
                  </motion.div>
                </div>

                {/* Trust signals */}
                <div className="flex flex-wrap items-center gap-4 mt-8">
                  {[
                    { icon: Shield, text: '30 Gün İade' },
                    { icon: Zap, text: 'Hızlı Kargo' },
                    { icon: Sparkles, text: 'AI Destekli' },
                    { icon: TrendingUp, text: 'En İyi Fiyat' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs text-white/40">
                      <Icon className="h-3.5 w-3.5 text-blue-400" />
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — Visual Showcase */}
          <div className="hidden lg:flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                className="relative"
              >
                {/* Main card */}
                <div className="relative w-80 h-80 glass-card flex items-center justify-center overflow-hidden">
                  {/* Gradient orb */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{ background: `radial-gradient(circle at 50% 50%, ${slide.glow}, transparent 70%)` }}
                  />
                  <span className="text-[120px] select-none relative z-10">{slide.emoji}</span>

                  {/* Floating chips */}
                  <motion.div
                    className="absolute top-6 right-6 flex items-center gap-2 rounded-xl bg-white/8 backdrop-blur px-3 py-2 border border-white/10"
                    animate={{ y: [-4, 4, -4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                    <span className="text-xs text-white/80 font-medium">Stokta Var</span>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-6 left-6 flex items-center gap-2 rounded-xl bg-white/8 backdrop-blur px-3 py-2 border border-white/10"
                    animate={{ y: [4, -4, 4] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  >
                    <span className="text-xs font-bold text-green-400">%47 İndirim</span>
                  </motion.div>
                </div>

                {/* Side cards */}
                <motion.div
                  className="absolute -top-8 -left-12 glass-card p-3 w-36"
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <p className="text-[10px] text-white/40 mb-1">Aylık Satış</p>
                  <p className="text-base font-black text-white">12,847</p>
                  <p className="text-[10px] text-green-400 flex items-center gap-1">
                    <TrendingUp className="h-2.5 w-2.5" />
                    +23% bu ay
                  </p>
                </motion.div>

                <motion.div
                  className="absolute -bottom-8 -right-12 glass-card p-3 w-40"
                  animate={{ y: [3, -3, 3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
                >
                  <div className="flex items-center gap-1 mb-1">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xs">★</span>)}
                  </div>
                  <p className="text-[10px] text-white/50">&quot;Harika ürün, hızlı kargo!&quot;</p>
                  <p className="text-[10px] text-white/30 mt-1">— Mehmet A.</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="flex items-center gap-2 mt-12">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-8 bg-blue-500' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
