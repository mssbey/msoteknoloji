'use client'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight, Fish, Tent, Flashlight, Sprout, CookingPot, Scissors, Shapes } from 'lucide-react'
import { collectionHref, useCatalog } from '@/lib/catalog'
const icons = { balikcilik: Fish, 'kamp-outdoor': Tent, 'fener-aydinlatma': Flashlight, 'bahce-el-aletleri': Sprout, 'ev-mutfak': CookingPot, 'kisisel-bakim': Scissors, aksesuar: Shapes }
export function CategoryGrid({ expanded = false }: { expanded?: boolean }) {
  const { data, isLoading, isError, refetch } = useCatalog()
  return <section className="store-section" id="kategoriler">
    <div className="section-heading"><div><span className="eyebrow">İHTİYACINIZDAN İLHAM ALIN</span>{expanded ? <h1>Kategorileri keşfet<span className="accent-dot">.</span></h1> : <h2>Keşif burada başlar<span className="accent-dot">.</span></h2>}<p>Doğada, evde, hayatın her anında yanınızda.</p></div>{!expanded && <Link href="/kategoriler" className="text-link">Tüm kategoriler <ArrowRight size={17} /></Link>}</div>
    {isError && <div className="catalog-empty">Kategoriler yüklenemedi. <button onClick={() => refetch()}>Tekrar dene</button></div>}
    <div className={`category-collection-grid ${expanded ? 'expanded' : ''}`}>
    {isLoading ? Array.from({length: 7}, (_, i) => <div key={i} className="category-tile animate-pulse h-44" />) : data?.groups.map((g, i) => {
      const Icon = icons[g.slug as keyof typeof icons] || Shapes
      return <div className="category-tile" key={g.slug}><Link href={collectionHref(g.slug)}><span className="category-number">0{i + 1}<ArrowUpRight size={15} /></span><span className={`category-icon category-tone-${i}`}><Icon size={32} strokeWidth={1.4} /></span><h3>{g.name}</h3><p>{g.products_count} ürün</p></Link>{expanded && <div className="category-subcategories"><p>{g.description}</p>{g.categories.map(c => <Link key={c.slug} href={`/urunler?collection=${g.slug}&category=${c.slug}`}>{c.name === 'Sentos' ? 'Diğer ürünler' : c.name}<ArrowUpRight size={13} /></Link>)}</div>}</div>
    })}</div>
  </section>
}
