'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Search, Filter, Download, Upload, Bot, Edit, Trash2, Eye, Package, TrendingUp, AlertCircle } from 'lucide-react'
import { sellerAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function SellerProductsPage() {
  const [searchQ, setSearchQ] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['seller-products', { searchQ, statusFilter, page }],
    queryFn: () => sellerAPI.products.list({ q: searchQ, status: statusFilter !== 'all' ? statusFilter : '', page }),
    select: (res) => res.data.data,
  })

  const products = data?.data || []
  const total = data?.total || 0

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#23262b]">Ürünlerim</h1>
          <p className="text-sm text-[#8e909b]">{total.toLocaleString()} ürün</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost py-2 px-3.5 text-sm rounded-xl flex items-center gap-2">
            <Upload className="h-4 w-4" />
            İçe Aktar
          </button>
          <button className="btn-ghost py-2 px-3.5 text-sm rounded-xl flex items-center gap-2">
            <Download className="h-4 w-4" />
            Dışa Aktar
          </button>
          <Link href="/satis-paneli/urunler/yeni"
            className="btn-primary py-2.5 px-5 text-sm rounded-xl flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-[#e6e4f0] bg-[#f6f5fb]">
        {/* Search */}
        <div className="flex flex-1 min-w-48 items-center gap-2 rounded-xl border border-[#e6e4f0] bg-[#f4f3f9] px-3 py-2.5">
          <Search className="h-4 w-4 text-[#a3a5b0]" />
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Ürün ara..."
            className="flex-1 bg-transparent text-sm text-[#23262b] placeholder-[#a3a5b0] outline-none"
          />
        </div>

        {/* Status filter */}
        <div className="flex rounded-xl border border-[#e6e4f0] overflow-hidden text-xs">
          {['all', 'approved', 'pending', 'draft'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                'px-3 py-2 font-medium transition-all',
                statusFilter === s ? 'bg-[#373071] text-[#ffffff]' : 'text-[#7c7f8a] hover:text-[#23262b] hover:bg-[#f3f2f8]'
              )}
            >
              {{ all: 'Tümü', approved: 'Aktif', pending: 'Onay Bekliyor', draft: 'Taslak' }[s]}
            </button>
          ))}
        </div>

        <button className="btn-ghost py-2 px-3 text-sm rounded-xl flex items-center gap-1.5">
          <Bot className="h-4 w-4 text-[#373071]" />
          AI ile Optimize Et
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto mb-3 text-[#b4b6c1]" />
          <h3 className="text-lg font-bold text-[#23262b] mb-2">
            {searchQ ? 'Ürün bulunamadı' : 'Henüz ürün eklemediniz'}
          </h3>
          <p className="text-sm text-[#8e909b] mb-4">
            {searchQ ? 'Farklı arama terimi deneyin' : 'İlk ürününüzü ekleyerek başlayın'}
          </p>
          {!searchQ && (
            <Link href="/satis-paneli/urunler/yeni" className="btn-primary py-2.5 px-6 text-sm rounded-xl inline-flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Ürün Ekle
            </Link>
          )}
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e6e4f0]">
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide">Ürün</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide hidden md:table-cell">Kategori</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide">Fiyat</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide hidden lg:table-cell">Stok</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide hidden lg:table-cell">AI Skor</th>
                <th className="text-left py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide">Durum</th>
                <th className="text-right py-3.5 px-4 text-xs font-bold text-[#8e909b] uppercase tracking-wide">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: {
                id: number; name: string; sku: string; category?: { name: string }
                price: string; sale_price: string | null; stock: number; ai_score: number; status: string
              }, i: number) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-[#eeedf5] hover:bg-[#f6f5fb] transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#f3f2f8] flex items-center justify-center text-xl flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#23262b] line-clamp-1 max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-[#8e909b]">SKU: {product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className="text-xs text-[#7c7f8a]">{product.category?.name || '—'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-bold text-[#23262b]">{formatPrice(parseFloat(product.sale_price || product.price))}</p>
                      {product.sale_price && (
                        <p className="text-xs text-[#a3a5b0] line-through">{formatPrice(parseFloat(product.price))}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <span className={cn(
                      'text-sm font-bold',
                      product.stock === 0 ? 'text-[#b0463c]' : product.stock <= 5 ? 'text-[#9c7226]' : 'text-[#585c68]'
                    )}>
                      {product.stock === 0 ? 'Tükendi' : `${product.stock} adet`}
                    </span>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 max-w-16 rounded-full bg-[#f0eff6] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#373071] to-[#2e2862]"
                          style={{ width: `${product.ai_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-[#7c7f8a]">{product.ai_score}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={cn('badge text-[10px]', {
                      'badge-green': product.status === 'approved',
                      'badge-amber': product.status === 'pending',
                      'badge-purple': product.status === 'draft',
                      'badge-red': product.status === 'rejected',
                    })}>
                      {{ approved: 'Aktif', pending: 'Bekliyor', draft: 'Taslak', rejected: 'Reddedildi' }[product.status] || product.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/urun/${product.id}`} target="_blank"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8e909b] hover:text-[#23262b] hover:bg-[#f3f2f8] transition-all">
                        <Eye className="h-3.5 w-3.5" />
                      </a>
                      <Link href={`/satis-paneli/urunler/${product.id}/duzenle`}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8e909b] hover:text-[#373071] hover:bg-[#edebf7] transition-all">
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={async () => {
                          if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return
                          try {
                            await sellerAPI.products.delete(product.id)
                            toast.success('Ürün silindi')
                            refetch()
                          } catch { toast.error('Silme işlemi başarısız') }
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8e909b] hover:text-[#b0463c] hover:bg-[#fbeceb] transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
