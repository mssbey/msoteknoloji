'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, Package } from 'lucide-react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

export function CartDrawer() {
  const {
    items, isOpen, closeCart, removeItem, updateQty,
    subtotal, total, shippingCost, itemCount, couponCode, removeCoupon,
  } = useCartStore()

  const sub = subtotal()
  const ship = shippingCost()
  const tot = total()
  const count = itemCount()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-md flex flex-col bg-[#0D0D11] border-l border-white/8 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/25">
                  <ShoppingBag className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Sepetim</h2>
                  <p className="text-xs text-white/40">{count} ürün</p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/8">
                    <Package className="h-10 w-10 text-white/20" />
                  </div>
                  <div>
                    <p className="text-white/60 font-medium">Sepetiniz boş</p>
                    <p className="text-sm text-white/30 mt-1">Ürün eklemek için alışverişe başlayın</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="btn-primary py-2.5 px-6 rounded-xl text-sm"
                  >
                    Alışverişe Başla
                  </button>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.productId}-${item.variantId}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20, height: 0 }}
                        className="flex gap-3 p-3 rounded-2xl bg-white/4 border border-white/7 group"
                      >
                        {/* Image */}
                        <div className="relative h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/8">
                          {item.image && /^(https?:\/\/|\/)/.test(item.image) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="h-full w-full object-contain bg-white p-1" />
                          ) : <div className="flex h-full w-full items-center justify-center"><Package className="h-7 w-7 text-white/40" /></div>}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/urun/${item.slug}`}
                            onClick={closeCart}
                            className="text-sm font-medium text-white/90 hover:text-white line-clamp-2 leading-snug"
                          >
                            {item.name}
                          </Link>
                          {item.variantLabel && (
                            <p className="text-xs text-white/40 mt-0.5">{item.variantLabel}</p>
                          )}
                          <p className="text-xs text-white/40 mt-0.5">{item.storeName}</p>

                          <div className="mt-2 flex items-center justify-between">
                            {/* Qty control */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQty(item.productId, item.variantId, item.quantity - 1)}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/8 hover:bg-white/14 text-white/70 hover:text-white transition-all"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                              <button
                                onClick={() => updateQty(item.productId, item.variantId, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                                className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/8 hover:bg-white/14 text-white/70 hover:text-white transition-all disabled:opacity-30"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">
                                {formatPrice((item.salePrice ?? item.price) * item.quantity)}
                              </p>
                              {item.salePrice && (
                                <p className="text-xs text-white/30 line-through">
                                  {formatPrice(item.price * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="opacity-0 group-hover:opacity-100 flex h-7 w-7 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 transition-all self-start mt-0.5"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/8 p-4 space-y-3">
                {/* Coupon */}
                {couponCode ? (
                  <div className="flex items-center justify-between rounded-xl bg-green-500/10 border border-green-500/20 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-bold text-green-400">{couponCode}</span>
                    </div>
                    <button onClick={removeCoupon} className="text-white/40 hover:text-white/70 text-xs">
                      Kaldır
                    </button>
                  </div>
                ) : null}

                {/* Summary */}
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>Ara Toplam</span>
                    <span>{formatPrice(sub)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Kargo</span>
                    <span className={ship === 0 ? 'text-green-400 font-medium' : ''}>
                      {ship === 0 ? 'Ücretsiz 🎉' : formatPrice(ship)}
                    </span>
                  </div>
                  {sub < 199 && (
                    <p className="text-xs text-amber-400/80">
                      {formatPrice(199 - sub)} daha ekleyin, kargo bedava!
                    </p>
                  )}
                  <div className="divider my-2" />
                  <div className="flex justify-between font-bold text-base">
                    <span className="text-white">Toplam</span>
                    <span className="text-white">{formatPrice(tot)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/odeme"
                  onClick={closeCart}
                  className="btn-primary w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-base"
                >
                  Ödemeye Geç
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-sm text-white/40 hover:text-white/70 transition-colors py-1"
                >
                  Alışverişe devam et
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
