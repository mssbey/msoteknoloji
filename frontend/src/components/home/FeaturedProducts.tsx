'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Heart, ShoppingBag, ArrowUpRight, Package, Star, ArrowRight } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatPrice } from '@/lib/utils'
import { categoryLabel, useCatalog } from '@/lib/catalog'
export interface Product {
  id: number; name: string; slug: string; price: string; sale_price: string | null
  rating: number; review_count: number; stock: number; ai_score?: number
  sku: string; is_featured: boolean; og_image?: string | null; sale_count?: number; collection_slug?: string
  store: { name: string; slug: string; rating?: number }; category: { name: string; slug: string }
}
export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [broken, setBroken] = useState(false)
  const { addItem } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const price = Number(product.price)
  const sale = product.sale_price != null && Number(product.sale_price) < price ? Number(product.sale_price) : null
  const discount = sale !== null && price > 0 ? Math.round((1 - sale / price) * 100) : 0
  const image = !broken && product.og_image
  return <article className="catalog-product group">
    <Link href={`/urun/${product.slug}`} className="catalog-product-image" aria-label={product.name}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} onError={() => setBroken(true)} />
      ) : <div className="product-no-image"><Package size={34} /><span>Görsel hazırlanıyor</span></div>}
      {discount > 0 && <span className="product-discount">%{discount} indirim</span>}
      <span className="product-view"><ArrowUpRight size={18} /></span>
    </Link>
    <button className={`product-heart ${isWishlisted(product.id) ? 'selected' : ''}`} onClick={() => toggle(product.id, product.name)} aria-label={isWishlisted(product.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'} aria-pressed={isWishlisted(product.id)}><Heart size={17} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} /></button>
    <div className="catalog-product-info"><p className="product-category">{categoryLabel(product.category?.name)}</p><Link href={`/urun/${product.slug}`} className="product-name">{product.name}</Link>
    {product.review_count > 0 && <span className="product-rating"><Star size={12} fill="currentColor" /> {Number(product.rating).toFixed(1)} <span>({product.review_count} değerlendirme)</span></span>}
    <div className="product-price-row"><div><span className="product-price">{formatPrice(sale ?? price)}</span>{sale !== null && <del>{formatPrice(price)}</del>}</div><button className="product-add" disabled={product.stock <= 0} aria-label={`${product.name} sepete ekle`} onClick={() => addItem({ productId: product.id, name: product.name, slug: product.slug, image: product.og_image || '', price, salePrice: sale ?? undefined, quantity: 1, sku: product.sku, stock: product.stock, storeName: product.store?.name || 'MSO Teknoloji', storeSlug: product.store?.slug || 'mso' })}><ShoppingBag size={18} /></button></div>
    <span className={`product-stock ${product.stock > 0 ? 'available' : ''}`}>{product.stock > 0 ? 'Stokta · Siparişe hazır' : 'Stokta yok'}</span></div>
  </article>
}
export function ProductSkeleton() {
  return <div className="catalog-product animate-pulse"><div className="aspect-square bg-black/5" /><div className="p-5 space-y-3"><div className="h-3 w-1/3 bg-black/5 rounded" /><div className="h-4 bg-black/5 rounded" /><div className="h-5 w-1/2 bg-black/5 rounded" /></div></div>
}
export function FeaturedProducts({ newest = false }: { newest?: boolean }) {
  const [collection, setCollection] = useState('')
  const { data: catalog } = useCatalog()
  const { data: result, isLoading, isError, refetch } = useQuery({ queryKey: ['storefront-products', newest, collection], queryFn: async () => (await productsAPI.list({ has_image: true, sort: newest ? 'newest' : 'popular', per_page: newest ? 4 : collection ? 8 : 100, ...(collection && { collection }) })).data.data.data as Product[] })
  let data = result?.slice(0, newest ? 4 : 8)
  if (!newest && !collection && !catalog?.has_sales && catalog && result) {
    const buckets = catalog.groups.map(g => result.filter(p => p.collection_slug === g.slug))
    data = []
    for (let round = 0; round < 8 && data.length < 8; round++) {
      for (const bucket of buckets) {
        if (bucket[round] && data.length < 8) data.push(bucket[round])
      }
    }
  }
  return <section className="store-section" id={newest ? 'yeni-gelenler' : 'cok-satanlar'}>
    <div className="section-heading"><div><span className="eyebrow">{newest ? 'YENİ KEŞİFLER' : 'MSO KOLEKSİYONU'}</span><h2>{newest ? 'Yeni gelenler' : catalog?.has_sales ? 'Çok satanlar' : 'Vitrin seçkisi'}<span className="accent-dot">.</span></h2><p>{newest ? 'Koleksiyonumuza katılan son ürünlerle tanışın.' : 'Bir sonraki keşfinize eşlik edecek ekipmanlar.'}</p></div><Link href={`/urunler?sort=${newest ? 'newest' : 'popular'}`} className="text-link">Tüm ürünleri gör <ArrowRight size={17} /></Link></div>
    {!newest && <div className="collection-tabs" aria-label="Vitrin kategorisi"><button className={!collection ? 'active' : ''} onClick={() => setCollection('')}>Tüm seçki</button>{catalog?.groups.filter(g => g.image).map(g => <button key={g.slug} className={collection === g.slug ? 'active' : ''} onClick={() => setCollection(g.slug)}>{g.name}</button>)}</div>}
    {isError ? <div className="catalog-empty">Ürünler yüklenemedi. <button onClick={() => refetch()}>Tekrar dene</button></div> : <div className="store-product-grid">{isLoading ? Array.from({ length: newest ? 4 : 8 }, (_, i) => <ProductSkeleton key={i} />) : data?.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}</div>}
    {!isLoading && !isError && !data?.length && <div className="catalog-empty">Bu kategorinin görselli ürünleri yakında burada.</div>}
  </section>
}
