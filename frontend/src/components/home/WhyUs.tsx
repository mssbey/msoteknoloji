'use client'

import { motion } from 'framer-motion'
import { Shield, Truck, CreditCard, Headphones, RefreshCw, Sparkles } from 'lucide-react'

const FEATURES = [
  { icon: Shield, title: 'Güvenli Alışveriş', desc: 'SSL şifreli, 3D Secure korumalı ödeme altyapısı', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  { icon: Truck, title: 'Hızlı Teslimat', desc: '199 TL üzeri ücretsiz, 1-3 iş günü kargo', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { icon: CreditCard, title: '3 Taksit İmkanı', desc: 'Tüm kredi kartlarına 3 taksit fırsatı', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  { icon: RefreshCw, title: '30 Gün İade', desc: 'Beğenmezseniz, soru sormadan iade alın', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { icon: Headphones, title: '7/24 Destek', desc: 'WhatsApp, e-posta ve telefon destek', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' },
  { icon: Sparkles, title: 'AI Destekli', desc: 'Yapay zeka ile kişiselleştirilmiş öneriler', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
]

export function WhyUs() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Neden MSO Teknoloji?</h2>
          <p className="text-white/40 text-sm max-w-xl mx-auto">
            Müşteri memnuniyeti odaklı, teknoloji öncüsü marketplace deneyimi
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-start gap-4 p-5 rounded-2xl border border-white/6 bg-white/2 hover:bg-white/4 transition-all"
            >
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${f.bg}`}>
                <f.icon className={`h-5 w-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-white/45 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
