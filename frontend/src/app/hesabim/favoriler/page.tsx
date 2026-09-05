'use client'

import { useWishlistStore } from '@/stores/wishlistStore'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'

export default function FavoritesPage() {
  const items = useWishlistStore((s) => s.items)
  const remove = useWishlistStore((s) => s.remove)

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-[#202c28]">Favorilerim</h1>

      {items.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Heart className="h-12 w-12 mx-auto mb-3 text-[#b6bdac]" />
          <p className="text-[#8c958c] mb-3">Favori listeniz boş</p>
          <Link href="/urunler" className="btn-primary text-xs py-2 px-4 rounded-xl inline-flex">
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((p) => (
            <div key={p.id} className="glass-card overflow-hidden group">
              <Link href={`/urun/${p.slug}`} className="block relative aspect-square bg-[#f8f9f6]">
                {p.image ? (
                  <Image src={p.image} alt={p.name} fill className="object-cover" sizes="200px" />
                ) : (
                  <div className="flex items-center justify-center h-full text-[#b6bdac]"><ShoppingBag className="h-10 w-10" /></div>
                )}
              </Link>
              <div className="p-3">
                <Link href={`/urun/${p.slug}`} className="text-sm font-semibold text-[#202c28] line-clamp-2 hover:text-[#4d7138] transition-colors">{p.name}</Link>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-black text-[#202c28]">{formatPrice(p.price)}</p>
                  <button
                    onClick={() => remove(p.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-[#b0463c] hover:bg-[#fbeceb] transition-all"
                    title="Kaldır"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
