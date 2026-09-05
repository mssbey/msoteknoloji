'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, notFound } from 'next/navigation'
import {
  Heart, ShoppingBag, Zap, Star, Shield, Truck, RefreshCw,
  ChevronRight, Minus, Plus, Package, MessageCircle,
  Store, Award, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatPrice, discountPercent } from '@/lib/utils'
import { categoryLabel } from '@/lib/catalog'
import { cn } from '@/lib/utils'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState<Record<number, string>>({})
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews' | 'qa'>('desc')
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const { addItem } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsAPI.show(slug),
    select: (res) => res.data.data,
    enabled: !!slug,
  })

  const { data: reviews } = useQuery({
    queryKey: ['product-reviews', slug],
    queryFn: () => productsAPI.reviews(slug),
    select: (res) => res.data,
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="storefront">
        <div className="store-container pd-page">
          <div className="pd-layout">
            <div className="pd-gallery"><div className="pd-skel" style={{ aspectRatio: '1' }} /></div>
            <div className="pd-info space-y-3">
              <div className="pd-skel h-4 w-1/3" />
              <div className="pd-skel h-8 w-3/4" />
              <div className="pd-skel h-4 w-1/2" />
            </div>
            <div className="pd-buybox-col">
              <div className="pd-skel h-56" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) return notFound()

  const price = parseFloat(product.price)
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null
  const currentPrice = salePrice ?? price
  const discount = salePrice ? discountPercent(price, salePrice) : null
  const gallery: string[] = (product.images?.map((im: { url?: string; path?: string }) => im.url || im.path).filter(Boolean) as string[])
    ?? []
  if (gallery.length === 0 && product.og_image) gallery.push(product.og_image)
  const mainImage = gallery[activeImage] ?? gallery[0]
  const inStock = product.stock > 0
  const wishlisted = isWishlisted(product.id)

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.og_image || '',
      price,
      salePrice: salePrice ?? undefined,
      quantity,
      sku: product.sku,
      stock: product.stock,
      storeName: product.store?.name || 'MSO Teknoloji',
      storeSlug: product.store?.slug || '',
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  return (
    <div className="storefront">
      <div className="store-container pd-page">

        <nav className="store-breadcrumb">
          <Link href="/">ANA SAYFA</Link><span>/</span>
          <Link href="/urunler">ÜRÜNLER</Link><span>/</span>
          {product.category && (
            <>
              <Link href={`/urunler?category=${product.category.slug}`}>{categoryLabel(product.category.name)?.toLocaleUpperCase('tr')}</Link>
              <span>/</span>
            </>
          )}
          <span style={{ color: '#4a563f' }}>{product.name}</span>
        </nav>

        <div className="pd-layout">

          {/* ─── Gallery ─── */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={product.name} />
              ) : (
                <div className="product-no-image"><Package size={34} /><span>Görsel hazırlanıyor</span></div>
              )}

              {discount && <span className="product-discount">%{discount} indirim</span>}

              <button
                onClick={() => toggle(product.id, product.name)}
                className={cn('product-heart', wishlisted && 'selected')}
                aria-label={wishlisted ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                aria-pressed={wishlisted}
              >
                <Heart size={17} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {gallery.length > 1 && (
              <div className="pd-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    className={cn('pd-thumb', i === activeImage && 'active')}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Info ─── */}
          <div className="pd-info">
            {product.store && (
              <Link href={`/magaza/${product.store.slug}`} className="pd-store-link">
                <Store size={13} />{product.store.name}<ChevronRight size={12} />
              </Link>
            )}

            <h1>{product.name}</h1>

            <div className="pd-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={15} fill={s <= Math.round(product.rating || 0) ? 'currentColor' : 'none'} className={s <= Math.round(product.rating || 0) ? '' : 'text-[#d6dccb]'} />
                ))}
              </div>
              <strong>{product.rating?.toFixed(1)}</strong>
              <span>({product.review_count} değerlendirme)</span>
              {product.ai_score >= 85 && (
                <span className="badge" style={{ background: '#eaf0d4', color: '#254632', border: '1px solid #d6e2b2' }}>
                  <Award size={11} className="mr-1" /> AI {product.ai_score}
                </span>
              )}
            </div>

            {product.short_description && (
              <p className="pd-short-desc">{product.short_description}</p>
            )}

            {product.variants && product.variants.length > 0 && (
              <div className="pd-variants">
                <span className="pd-label">Varyant</span>
                <div className="pd-variant-list">
                  {product.variants.map((v: { id: number; sku: string; price: string; stock: number }) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariants((prev) => ({ ...prev, [0]: String(v.id) }))}
                      className={cn(
                        'pd-variant',
                        selectedVariants[0] === String(v.id) && 'active',
                        v.stock <= 0 && 'disabled'
                      )}
                    >
                      {v.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="pd-sku">SKU: {product.sku}</p>

            <div className="pd-tabs">
              <div className="pd-tabs-nav">
                {(['desc', 'reviews', 'qa'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn('pd-tab-btn', activeTab === tab && 'active')}
                  >
                    {tab === 'desc' ? 'Açıklama' : tab === 'reviews' ? `Yorumlar (${product.review_count})` : 'Soru & Cevap'}
                  </button>
                ))}
              </div>
              <div className="pd-tab-content">
                {activeTab === 'desc' && (
                  <div dangerouslySetInnerHTML={{ __html: product.description || '<p>Açıklama mevcut değil</p>' }} />
                )}
                {activeTab === 'reviews' && (
                  reviews?.data?.data?.length > 0 ? (
                    reviews.data.data.map((r: { id: number; rating: number; title?: string; content?: string; user?: { name: string } }) => (
                      <div key={r.id} className="pd-review">
                        <div className="pd-review-head">
                          <div className="stars">{[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill={s <= r.rating ? 'currentColor' : 'none'} />)}</div>
                          <span>{r.user?.name}</span>
                        </div>
                        {r.content && <p>{r.content}</p>}
                      </div>
                    ))
                  ) : (
                    <p className="pd-empty">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                  )
                )}
                {activeTab === 'qa' && (
                  <p className="pd-empty">Henüz soru sorulmamış.</p>
                )}
              </div>
            </div>
          </div>

          {/* ─── Buy box ─── */}
          <div className="pd-buybox-col">
            <div className="pd-buybox">
              <div className="pd-price-row">
                <span className="pd-price">{formatPrice(currentPrice)}</span>
                {salePrice && <span className="pd-price-old">{formatPrice(price)}</span>}
              </div>
              {discount && (
                <p className="pd-discount-note">%{discount} indirim · {formatPrice(price - salePrice!)} tasarruf</p>
              )}
              <p className="pd-vat-note">KDV Dahil</p>

              <div className={cn('pd-stock-row', inStock ? 'in' : 'out')}>
                {inStock ? (
                  <>
                    <CheckCircle size={15} />
                    <span>Stokta Var</span>
                    {product.stock <= 10 && <span className="pd-stock-low">Son {product.stock} adet!</span>}
                  </>
                ) : (
                  <>
                    <Package size={15} />
                    <span>Stok Yok</span>
                  </>
                )}
              </div>

              {inStock && (
                <div className="pd-qty-row">
                  <span className="pd-label" style={{ marginBottom: 0 }}>Adet</span>
                  <div className="pd-qty">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}><Minus size={13} /></button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}><Plus size={13} /></button>
                  </div>
                </div>
              )}

              <div className="pd-actions">
                <Link
                  href={inStock ? '/odeme' : '#'}
                  onClick={inStock ? handleAddToCart : undefined}
                  className={cn('pd-btn-primary', !inStock && 'disabled')}
                >
                  <Zap size={15} fill="currentColor" />
                  Hemen Satın Al
                </Link>

                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={cn('pd-btn-ghost', addedToCart && 'added')}
                >
                  <ShoppingBag size={15} />
                  {addedToCart ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
                </button>
              </div>

              <div className="pd-guarantees">
                {[
                  { icon: Truck, text: 'Ücretsiz kargo (199 TL üzeri)' },
                  { icon: Shield, text: '2 yıl garanti' },
                  { icon: RefreshCw, text: '30 gün iade hakkı' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text}><Icon size={14} />{text}</div>
                ))}
              </div>
            </div>

            {product.store && (
              <div className="pd-store-card">
                <div className="pd-store-avatar">🏪</div>
                <div>
                  <Link href={`/magaza/${product.store.slug}`}>
                    <strong>{product.store.name}</strong>
                  </Link>
                  <p className="pd-store-rating"><Star size={11} fill="currentColor" />{product.store.rating}</p>
                </div>
                <a
                  href={`https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(`${product.name} ürünü hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-whatsapp"
                >
                  <MessageCircle size={13} />
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
