'use client'

import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api'
import { ProductCard } from '@/components/home/FeaturedProducts'
import { Search } from 'lucide-react'

export function ProductListContent() {
  const params = useSearchParams()
  const q = params.get('q') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => productsAPI.list({ q, per_page: 20 }),
    select: (res) => res.data.data.data,
    enabled: q.length > 0,
  })

  return (
    <div className="min-h-screen bg-[#050507] px-4 py-10">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <Search className="h-5 w-5 text-blue-400" />
            <h1 className="text-2xl font-black text-white">
              {q ? `\"${q}\" için arama sonuçları` : 'Arama'}
            </h1>
          </div>
          {data && <p className="text-white/40 text-sm">{data.length} ürün bulundu</p>}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/6 bg-[#0D0D11] overflow-hidden">
                <div className="aspect-square skeleton" />
                <div className="p-3 space-y-2">
                  <div className="skeleton h-3 w-4/5 rounded" />
                  <div className="skeleton h-4 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold text-white mb-2">Sonuç bulunamadı</h2>
            <p className="text-white/40">&quot;{q}&quot; için ürün bulunamadı. Farklı anahtar kelime deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {data.map((product: Parameters<typeof ProductCard>[0]['product'], i: number) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
