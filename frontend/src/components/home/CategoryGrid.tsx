'use client'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Fish, Tent, Flashlight, Sprout, CookingPot, Scissors, Shapes } from 'lucide-react'
import { collectionHref, useCatalog } from '@/lib/catalog'
const icons = { balikcilik: Fish, 'kamp-outdoor': Tent, 'fener-aydinlatma': Flashlight, 'bahce-el-aletleri': Sprout, 'ev-mutfak': CookingPot, 'kisisel-bakim': Scissors, aksesuar: Shapes }
export function CategoryGrid({ expanded = false }: { expanded?: boolean }) {
  const { data, isLoading, isError, refetch } = useCatalog()
  return <section className={`store-section${expanded ? '' : ' category-showcase'}`} id="kategoriler" aria-labelledby="categories-title">
    <div className="section-heading"><div>{expanded ? <><span className="eyebrow">İhtiyacınızdan ilham alın</span><h1 id="categories-title">Kategorileri keşfet<span className="accent-dot">.</span></h1><p>Doğada, evde, hayatın her anında yanınızda.</p></> : <><span className="eyebrow">İlgi alanını keşfet</span><h2 id="categories-title">Kategoriler<span className="accent-dot">.</span></h2><p>Doğa tutkusundan evin küçük ihtiyaçlarına.</p></>}</div>{!expanded && <Link href="/kategoriler" className="text-link category-all-link">Hepsini gör <ArrowRight size={16} aria-hidden="true" /></Link>}</div>
    {isError && <div className="catalog-empty">Kategoriler yüklenemedi. <button onClick={() => refetch()}>Tekrar dene</button></div>}
    <div className={`category-collection-grid ${expanded ? 'expanded' : ''}`}>
    {isLoading ? Array.from({ length: 7 }, (_, i) => <div key={i} className="category-tile skeleton" style={{ height: expanded ? 156 : 252 }} />) : data?.groups.map(g => {
      const Icon = icons[g.slug as keyof typeof icons] || Shapes
      return <div className="category-tile" key={g.slug}>
        <Link href={collectionHref(g.slug)}>
          <span className="category-icon"><Icon size={expanded ? 22 : 36} strokeWidth={1.5} aria-hidden="true" /></span>
          <span className="category-text"><h3>{g.name}</h3>{expanded && <p>{g.products_count} ürün</p>}</span>
          {expanded ? <ArrowUpRight size={16} className="category-arrow" aria-hidden="true" /> : <span className="category-card-footer"><span className="category-product-count"><strong>{g.products_count}</strong> ürün</span><span className="category-open-icon" aria-hidden="true"><ArrowUpRight size={17} strokeWidth={1.8} /></span></span>}
        </Link>
        {expanded && <div className="category-subcategories"><p>{g.description}</p>{g.categories.map(c => <Link key={c.slug} href={`/urunler?collection=${g.slug}&category=${c.slug}`}>{c.name === 'Sentos' ? 'Diğer ürünler' : c.name}<ArrowUpRight size={13} /></Link>)}</div>}
      </div>
    })}</div>
  </section>
}
