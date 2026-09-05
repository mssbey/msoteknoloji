'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Package, Star, ShoppingCart, Users, TrendingUp } from 'lucide-react'

const STATS = [
  { icon: Package, value: 50000, label: 'Ürün', suffix: '+', color: 'text-blue-400', glow: 'rgba(59,130,246,0.2)' },
  { icon: Star, value: 500, label: 'Marka', suffix: '+', color: 'text-amber-400', glow: 'rgba(245,158,11,0.2)' },
  { icon: ShoppingCart, value: 100000, label: 'Sipariş', suffix: '+', color: 'text-green-400', glow: 'rgba(16,185,129,0.2)' },
  { icon: Users, value: 75000, label: 'Mutlu Müşteri', suffix: '+', color: 'text-purple-400', glow: 'rgba(124,58,237,0.2)' },
  { icon: TrendingUp, value: 99, label: 'Memnuniyet', suffix: '%', color: 'text-pink-400', glow: 'rgba(236,72,153,0.2)' },
]

function Counter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      // Ease out
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(animate)
      else setCount(value)
    }
    requestAnimationFrame(animate)
  }, [inView, value, duration])

  return <span ref={ref}>{count.toLocaleString('tr-TR')}</span>
}

export function LiveCounters() {
  return (
    <section className="py-12 border-y border-white/5">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="glass-card p-5 text-center group cursor-default"
              style={{ background: `radial-gradient(ellipse at 50% 0%, ${stat.glow}, transparent 70%)` }}
            >
              <div className={`mb-3 flex justify-center ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className={`text-3xl font-black ${stat.color} mb-1`}>
                <Counter value={stat.value} />
                <span>{stat.suffix}</span>
              </div>
              <div className="text-xs text-white/40 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
