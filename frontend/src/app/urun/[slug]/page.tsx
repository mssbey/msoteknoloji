'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, notFound } from 'next/navigation'
import {
  Heart, ShoppingBag, Star, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight,
  Minus, Plus, Package, MessageCircle, Store, Check, Share2, Info,
} from 'lucide-react'
import Link from 'next/link'
import { productsAPI } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatPrice, discountPercent, cn } from '@/lib/utils'
import { categoryLabel } from '@/lib/catalog'
import { ProductCard, ProductSkeleton, type Product } from '@/components/home/FeaturedProducts'
import {
  buildSpecs, groupVariants, hasReadableText, parseVariants, sanitizeDescription,
  type VariantOption,
} from '@/lib/product'
import { toast } from 'sonner'

const FREE_SHIPPING_LIMIT = 199

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [quantity, setQuantity] = useState(1)
  const [variantId, setVariantId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [addedToCart, setAddedToCart] = useState(false)
  const [activeImage, setActiveImage] = useState(0)

  const { addItem, openCart } = useCartStore()
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

  const { data: related, isLoading: relatedLoading } = useQuery({
    queryKey: ['product-related', product?.category?.slug, product?.id],
    queryFn: () => productsAPI.list({ category: product.category.slug, has_image: true, per_page: 5 }),
    select: (res) => (res.data.data.data as Product[]).filter((p) => p.id !== product.id).slice(0, 4),
    enabled: !!product?.category?.slug,
  })

  const variants = useMemo(() => parseVariants(product?.variants), [product?.variants])
  const variantGroups = useMemo(() => groupVariants(variants), [variants])
  const description = useMemo(() => sanitizeDescription(product?.description), [product?.description])
  const specs = useMemo(() => (product ? buildSpecs(product) : []), [product])

  // Varsayılan seçim: stokta olan ilk seçenek, hiçbiri yoksa ilki.
  const defaultVariantId = useMemo(() => {
    const options = variantGroups.flatMap((group) => group.options)
    return (options.find((option) => option.stock > 0) ?? options[0])?.id ?? null
  }, [variantGroups])
  const activeVariantId = variantId ?? defaultVariantId

  if (isLoading) return <ProductDetailSkeleton />
  if (isError || !product) return notFound()

  const selected: VariantOption | null = variants.find((v) => v.id === activeVariantId) ?? null
  const hasVariantChoice = variantGroups.length > 0

  const listPrice = selected && selected.price > 0 ? selected.price : parseFloat(product.price)
  const rawSale = selected ? selected.salePrice : product.sale_price ? parseFloat(product.sale_price) : null
  const salePrice = rawSale && rawSale > 0 && rawSale < listPrice ? rawSale : null
  const currentPrice = salePrice ?? listPrice
  const discount = salePrice ? discountPercent(listPrice, salePrice) : null

  const stock = hasVariantChoice ? (selected?.stock ?? 0) : product.stock
  const inStock = stock > 0
  const sku = selected?.sku ?? product.sku

  const gallery: string[] = [
    ...((product.images?.map((im: { url?: string; path?: string }) => im.url || im.path).filter(Boolean) as string[]) ?? []),
  ]
  if (product.og_image && !gallery.includes(product.og_image)) gallery.unshift(product.og_image)
  const mainImage = gallery[Math.min(activeImage, gallery.length - 1)]

  const wishlisted = isWishlisted(product.id)
  const rating = Number(product.rating) || 0
  const showShortDesc =
    product.short_description && product.short_description.trim() !== product.name.trim()
  const freeShipping = product.free_shipping || currentPrice >= FREE_SHIPPING_LIMIT

  const stepImage = (direction: 1 | -1) =>
    setActiveImage((i) => (i + direction + gallery.length) % gallery.length)

  const handleAddToCart = () => {
    if (!inStock) return
    addItem({
      productId: product.id,
      variantId: selected?.id,
      variantLabel: hasVariantChoice ? selected?.label : undefined,
      name: product.name,
      slug: product.slug,
      image: selected?.image || product.og_image || '',
      price: listPrice,
      salePrice: salePrice ?? undefined,
      quantity,
      sku,
      stock,
      storeName: product.store?.name || 'MSO Teknoloji',
      storeSlug: product.store?.slug || '',
    })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: product.name, url })
      else {
        await navigator.clipboard.writeText(url)
        toast.success('Ürün bağlantısı kopyalandı')
      }
    } catch {
      /* kullanıcı paylaşmaktan vazgeçti */
    }
  }

  return (
    <div className="storefront">
      <div className="store-container pd-page">

        <nav className="store-breadcrumb">
          <Link href="/">ANA SAYFA</Link><span>/</span>
          <Link href="/urunler">ÜRÜNLER</Link><span>/</span>
          {product.category && (
            <>
              <Link href={`/urunler?category=${product.category.slug}`}>
                {categoryLabel(product.category.name)?.toLocaleUpperCase('tr')}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="pd-crumb-current">{product.name}</span>
        </nav>

        <div className="pd-layout">

          {/* ─── Galeri ─── */}
          <div className="pd-gallery">
            <div className="pd-main-image">
              {mainImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mainImage} alt={`${product.name} — görsel ${activeImage + 1}`} />
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

              {gallery.length > 1 && (
                <>
                  <button className="pd-nav prev" onClick={() => stepImage(-1)} aria-label="Önceki görsel">
                    <ChevronLeft size={18} />
                  </button>
                  <button className="pd-nav next" onClick={() => stepImage(1)} aria-label="Sonraki görsel">
                    <ChevronRight size={18} />
                  </button>
                  <span className="pd-image-count">{activeImage + 1} / {gallery.length}</span>
                </>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="pd-thumbs">
                {gallery.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActiveImage(i)}
                    className={cn('pd-thumb', i === activeImage && 'active')}
                    aria-label={`${i + 1}. görseli göster`}
                    aria-current={i === activeImage}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── Ürün bilgisi ─── */}
          <div className="pd-info">
            <div className="pd-meta-row">
              {product.brand?.name && (
                <Link href={`/urunler?brand=${product.brand.slug}`} className="pd-brand">{product.brand.name}</Link>
              )}
              {product.store && (
                <Link href={`/magaza/${product.store.slug}`} className="pd-store-link">
                  <Store size={13} />{product.store.name}
                </Link>
              )}
              <button className="pd-share" onClick={handleShare}>
                <Share2 size={13} /> Paylaş
              </button>
            </div>

            <h1>{product.name}</h1>

            <div className="pd-rating">
              {product.review_count > 0 ? (
                <>
                  <div className="stars" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={15} fill={s <= Math.round(rating) ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                  <strong>{rating.toFixed(1)}</strong>
                  <button className="pd-rating-link" onClick={() => setActiveTab('reviews')}>
                    {product.review_count} değerlendirme
                  </button>
                </>
              ) : (
                <span className="pd-rating-empty">Bu ürün henüz değerlendirilmemiş</span>
              )}
              <span className="pd-sku">Ürün kodu: {sku}</span>
            </div>

            {showShortDesc && <p className="pd-short-desc">{product.short_description}</p>}

            {hasVariantChoice && variantGroups.map((group) => (
              <div className="pd-variants" key={group.name}>
                <span className="pd-label">
                  {group.name}
                  {selected && <b className="pd-label-value">{selected.label}</b>}
                </span>
                <div className="pd-variant-list">
                  {group.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => { setVariantId(option.id); setQuantity(1) }}
                      className={cn(
                        'pd-variant',
                        option.id === activeVariantId && 'active',
                        option.stock <= 0 && 'disabled',
                      )}
                      disabled={option.stock <= 0}
                      title={option.stock <= 0 ? 'Bu seçenek tükendi' : undefined}
                    >
                      {option.label}
                      {option.stock <= 0 && <small>tükendi</small>}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <ul className="pd-highlights">
              <li>
                <Truck size={16} />
                <div>
                  <strong>{freeShipping ? 'Kargo bedava' : 'Standart kargo'}</strong>
                  <span>{freeShipping ? 'Bu üründe kargo ücreti alınmıyor' : `${formatPrice(FREE_SHIPPING_LIMIT)} üzeri siparişlerde ücretsiz`}</span>
                </div>
              </li>
              <li>
                <Shield size={16} />
                <div><strong>2 yıl garanti</strong><span>Üretici garantisi kapsamındadır</span></div>
              </li>
              <li>
                <RefreshCw size={16} />
                <div><strong>30 gün içinde iade</strong><span>Kullanılmamış ürünlerde koşulsuz iade</span></div>
              </li>
            </ul>
          </div>

          {/* ─── Satın alma kutusu ─── */}
          <div className="pd-buybox-col">
            <div className="pd-buybox">
              <div className="pd-price-row">
                <span className="pd-price">{formatPrice(currentPrice)}</span>
                {salePrice && <span className="pd-price-old">{formatPrice(listPrice)}</span>}
              </div>
              {discount ? (
                <p className="pd-discount-note">
                  %{discount} indirim · {formatPrice(listPrice - salePrice!)} kazanç
                </p>
              ) : null}
              <p className="pd-vat-note">Fiyata KDV dahildir</p>

              <div className={cn('pd-stock-row', inStock ? 'in' : 'out')}>
                {inStock ? <Check size={15} /> : <Package size={15} />}
                <span>{inStock ? 'Stokta, hemen gönderilir' : 'Şu an stokta yok'}</span>
              </div>
              {inStock && stock <= 10 && (
                <p className="pd-stock-low"><Info size={12} /> Son {stock} adet kaldı</p>
              )}
              {!inStock && hasVariantChoice && (
                <p className="pd-stock-hint">Diğer seçenekleri deneyebilirsiniz.</p>
              )}

              {inStock && (
                <div className="pd-qty-row">
                  <span className="pd-label" style={{ marginBottom: 0 }}>Adet</span>
                  <div className="pd-qty">
                    <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Adedi azalt">
                      <Minus size={13} />
                    </button>
                    <span aria-live="polite">{quantity}</span>
                    <button onClick={() => setQuantity((q) => Math.min(stock, q + 1))} disabled={quantity >= stock} aria-label="Adedi artır">
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="pd-qty-total">{formatPrice(currentPrice * quantity)}</span>
                </div>
              )}

              <div className="pd-actions">
                <button
                  onClick={() => { handleAddToCart(); openCart() }}
                  disabled={!inStock}
                  className="pd-btn-primary"
                >
                  <ShoppingBag size={15} />
                  Sepete ekle
                </button>

                <Link
                  href={inStock ? '/odeme' : '#'}
                  onClick={inStock ? handleAddToCart : undefined}
                  className={cn('pd-btn-ghost', !inStock && 'disabled')}
                >
                  Hemen satın al
                </Link>
              </div>

              {addedToCart && (
                <p className="pd-added-note"><Check size={13} /> Sepetinize eklendi</p>
              )}
            </div>

            {product.store && (
              <div className="pd-store-card">
                <div className="pd-store-avatar"><Store size={18} /></div>
                <div className="pd-store-body">
                  <Link href={`/magaza/${product.store.slug}`}><strong>{product.store.name}</strong></Link>
                  <p className="pd-store-rating">
                    <Star size={11} fill="currentColor" />{Number(product.store.rating || 0).toFixed(1)} mağaza puanı
                  </p>
                </div>
                <a
                  href={`https://wa.me/905XXXXXXXXX?text=${encodeURIComponent(`${product.name} (${sku}) hakkında bilgi almak istiyorum.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-whatsapp"
                >
                  <MessageCircle size={13} /> Soru sor
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ─── Açıklama / Özellikler / Yorumlar ─── */}
        <section className="pd-tabs">
          <div className="pd-tabs-nav" role="tablist">
            {([
              { key: 'desc', label: 'Ürün açıklaması' },
              { key: 'specs', label: 'Teknik özellikler' },
              { key: 'reviews', label: `Değerlendirmeler (${product.review_count})` },
            ] as const).map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn('pd-tab-btn', activeTab === tab.key && 'active')}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pd-tab-content">
            {activeTab === 'desc' && (
              hasReadableText(description) ? (
                <div className="pd-prose" dangerouslySetInnerHTML={{ __html: description }} />
              ) : (
                <p className="pd-empty">
                  Bu ürün için henüz ayrıntılı açıklama eklenmemiş. Merak ettiklerinizi mağazaya sorabilirsiniz.
                </p>
              )
            )}

            {activeTab === 'specs' && (
              specs.length > 0 ? (
                <table className="pd-specs">
                  <tbody>
                    {specs.map((row) => (
                      <tr key={row.label}><th scope="row">{row.label}</th><td>{row.value}</td></tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="pd-empty">Bu ürün için teknik bilgi girilmemiş.</p>
              )
            )}

            {activeTab === 'reviews' && (
              reviews?.data?.data?.length > 0 ? (
                <div className="pd-reviews">
                  {reviews.data.data.map((r: { id: number; rating: number; content?: string; user?: { name: string } }) => (
                    <article key={r.id} className="pd-review">
                      <div className="pd-review-head">
                        <div className="stars" aria-label={`${r.rating} yıldız`}>
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} fill={s <= r.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        <span>{r.user?.name}</span>
                      </div>
                      {r.content && <p>{r.content}</p>}
                    </article>
                  ))}
                </div>
              ) : (
                <p className="pd-empty">Henüz değerlendirme yok. Bu ürünü alıp ilk yorumu siz yazabilirsiniz.</p>
              )
            )}
          </div>
        </section>

        {/* ─── Benzer ürünler ─── */}
        {(relatedLoading || (related && related.length > 0)) && (
          <section className="store-section pd-related">
            <div className="section-heading">
              <div>
                <span className="eyebrow">AYNI KATEGORİDEN</span>
                <h2>Benzer ürünler<span className="accent-dot">.</span></h2>
              </div>
              {product.category && (
                <Link href={`/urunler?category=${product.category.slug}`} className="text-link">
                  Kategoriyi gör <ChevronRight size={16} />
                </Link>
              )}
            </div>
            <div className="store-product-grid">
              {relatedLoading
                ? Array.from({ length: 4 }, (_, i) => <ProductSkeleton key={i} />)
                : related?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </section>
        )}
      </div>

      {/* ─── Mobilde sabit satın alma çubuğu ─── */}
      <div className="pd-mobile-bar">
        <div>
          <span className="pd-mobile-price">{formatPrice(currentPrice)}</span>
          {salePrice && <del>{formatPrice(listPrice)}</del>}
        </div>
        <button onClick={() => { handleAddToCart(); openCart() }} disabled={!inStock}>
          <ShoppingBag size={15} />
          {inStock ? 'Sepete ekle' : 'Stokta yok'}
        </button>
      </div>
    </div>
  )
}

function ProductDetailSkeleton() {
  return (
    <div className="storefront">
      <div className="store-container pd-page">
        <div className="pd-layout" style={{ paddingTop: 40 }}>
          <div className="pd-gallery">
            <div className="pd-skel" style={{ aspectRatio: '1' }} />
          </div>
          <div className="pd-info">
            <div className="pd-skel" style={{ height: 12, width: '30%', marginBottom: 16 }} />
            <div className="pd-skel" style={{ height: 30, width: '85%', marginBottom: 12 }} />
            <div className="pd-skel" style={{ height: 12, width: '45%', marginBottom: 28 }} />
            <div className="pd-skel" style={{ height: 96 }} />
          </div>
          <div className="pd-buybox-col">
            <div className="pd-skel" style={{ height: 300 }} />
          </div>
        </div>
      </div>
    </div>
  )
}
