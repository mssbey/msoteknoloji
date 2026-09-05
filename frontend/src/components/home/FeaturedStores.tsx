'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star, Package, ArrowRight, Store } from 'lucide-react'

const STORES = [
  { name: 'TechStore Pro', slug: 'techstore-pro', emoji: '💻', category: 'Elektronik', rating: 4.8, products: 1247, badge: 'Doğrulanmış', badgeColor: 'badge-blue' },
  { name: 'GYZGO', slug: 'gyzgo', emoji: '🎮', category: 'Gaming', rating: 4.9, products: 890, badge: 'Premium', badgeColor: 'badge-purple' },
  { name: 'EN Yeniler', slug: 'en-yeniler', emoji: '✨', category: 'Teknoloji', rating: 4.7, products: 2100, badge: 'Yeni', badgeColor: 'badge-green' },
]

export function FeaturedStores() {
  return (
    <section className="py-16 px-4">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-5 w-5 text-purple-400" />
              <h2 className="text-2xl md:text-3xl font-black text-white">Öne Çıkan Mağazalar</h2>
            </div>
            <p className="text-white/40 text-sm">Güvenilir, onaylı satıcılar</p>
          </div>
          <Link href="/magazalar" className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium">
            Tüm mağazalar <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STORES.map((store, i) => (
            <motion.div
              key={store.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
            >
              <Link
                href={`/magaza/${store.slug}`}
                className="flex items-center gap-4 p-5 rounded-2xl border border-white/8 bg-[#0D0D11] hover:border-purple-500/30 hover:bg-white/3 transition-all group"
              >
                {/* Logo */}
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-3xl">
                  {store.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                      {store.name}
                    </h3>
                    <span className={`badge ${store.badgeColor} hidden sm:inline-flex`}>{store.badge}</span>
                  </div>
                  <p className="text-xs text-white/40 mb-2">{store.category}</p>
                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {store.rating}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {store.products.toLocaleString()} ürün
                    </span>
                  </div>
                </div>

                <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
