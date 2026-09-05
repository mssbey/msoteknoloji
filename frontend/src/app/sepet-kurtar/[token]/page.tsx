'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Tag, ArrowRight, Package, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useCartStore, type CartItem } from '@/stores/cartStore'
import { resolveApiBaseUrl } from '@/lib/apiBase'

interface RecoveryItem {
  product_id: number
  variant_id: number | null
  name: string
  sku: string
  price: number
  quantity: number
}

interface RecoveryData {
  cart_id: number
  items: RecoveryItem[]
  item_count: number
  subtotal: number
  coupon_code: string | null
  user_name: string | null
}

type Status = 'loading' | 'loaded' | 'error' | 'expired'

export default function CartRecoveryPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  const { addItem, applyCoupon } = useCartStore()

  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<RecoveryData | null>(null)
  const [copiedCoupon, setCopiedCoupon] = useState(false)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    fetch(`${resolveApiBaseUrl()}/cart/recover/${token}`)
      .then(async res => {
        if (res.status === 404) { setStatus('expired'); return }
        if (!res.ok) throw new Error()
        const json = await res.json()
        setData(json.data)
        setStatus('loaded')
      })
      .catch(() => setStatus('error'))
  }, [token])

  const handleRestore = async () => {
    if (!data) return
    setRestoring(true)
    try {
      // Ürünleri local cart'a ekle
      for (const item of data.items) {
        const cartItem: CartItem = {
          productId: item.product_id,
          variantId: item.variant_id ?? undefined,
          name: item.name,
          slug: item.sku,
          image: '',
          price: item.price,
          quantity: item.quantity,
          sku: item.sku,
          storeName: 'MSO Teknoloji',
          storeSlug: 'mso-teknoloji',
          stock: 99,
        }
        addItem(cartItem)
      }
      if (data.coupon_code) applyCoupon(data.coupon_code, 0)
      // Backend'de recovery işaretle (auth varsa)
      await fetch(`${resolveApiBaseUrl()}/cart/recover/${token}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('mso_token') ?? '' : ''}` },
      }).catch(() => {/* ok to fail if unauthenticated */})

      router.push('/urunler')
    } finally {
      setRestoring(false)
    }
  }

  const copyCode = () => {
    if (!data?.coupon_code) return
    navigator.clipboard.writeText(data.coupon_code)
    setCopiedCoupon(true)
    setTimeout(() => setCopiedCoupon(false), 2000)
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (status === 'expired' || status === 'error') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <AlertCircle className="h-8 w-8 text-white/30" />
        </div>
        <h1 className="text-xl font-black text-white">
          {status === 'expired' ? 'Bu link artık geçerli değil' : 'Bir hata oluştu'}
        </h1>
        <p className="text-sm text-white/40 max-w-sm">
          {status === 'expired'
            ? 'Sepet kurtarma linki zaten kullanılmış ya da süresi dolmuş.'
            : 'Bağlantı kurulamadı. Lütfen daha sonra tekrar deneyin.'}
        </p>
        <Link
          href="/urunler"
          className="mt-2 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          Alışverişe Devam Et <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 mb-4"
          >
            <ShoppingCart className="h-8 w-8 text-blue-400" />
          </motion.div>
          <h1 className="text-2xl font-black text-white">
            {data.user_name ? `Hoş geldin, ${data.user_name.split(' ')[0]}!` : 'Sepetiniz sizi bekliyor!'}
          </h1>
          <p className="text-white/50 mt-2 text-sm">
            {data.item_count} ürünlü sepetinizi terk ettiniz — şimdi geri dönün.
          </p>
        </div>

        {/* Coupon code */}
        {data.coupon_code && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={copyCode}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-green-500/40 bg-green-500/8 p-4 text-center hover:border-green-400 hover:bg-green-500/12 transition-all"
          >
            <p className="text-xs text-green-400/70 mb-1">Özel indirim kodunuz</p>
            <p className="text-2xl font-black tracking-widest text-green-400">{data.coupon_code}</p>
            <p className="text-xs text-white/30 mt-1 flex items-center justify-center gap-1">
              <Tag className="h-3 w-3" />
              {copiedCoupon ? '✅ Kopyalandı!' : 'Kopyalamak için tıklayın'}
            </p>
          </motion.div>
        )}

        {/* Cart items */}
        <div className="rounded-2xl border border-white/8 bg-white/3 divide-y divide-white/6">
          {data.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="flex items-center gap-4 p-4"
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5">
                <Package className="h-5 w-5 text-white/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.name}</p>
                <p className="text-xs text-white/30">{item.sku} • x{item.quantity}</p>
              </div>
              <p className="text-sm font-bold text-white flex-shrink-0">
                ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
              </p>
            </motion.div>
          ))}

          {/* Subtotal */}
          <div className="flex items-center justify-between p-4">
            <span className="text-sm text-white/50">Toplam</span>
            <span className="text-lg font-black text-white">
              ₺{data.subtotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleRestore}
            disabled={restoring}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-4 text-base font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow disabled:opacity-60"
          >
            {restoring ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</>
            ) : (
              <><ShoppingCart className="h-4 w-4" /> Sepeti Geri Yükle & Alışverişe Devam</>
            )}
          </motion.button>
          <Link
            href="/urunler"
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 py-4 px-6 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            Yeni Alışveriş
          </Link>
        </div>

        <p className="text-xs text-center text-white/25">
          İndirim kodu sepet ödemesinde otomatik uygulanacaktır.
        </p>
      </motion.div>
    </div>
  )
}
