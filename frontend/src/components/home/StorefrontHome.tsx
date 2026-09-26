'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Compass, PackageCheck, Search, Headphones } from 'lucide-react'
import { CategoryGrid } from './CategoryGrid'
import { FeaturedProducts } from './FeaturedProducts'
import { collectionHref, useCatalog } from '@/lib/catalog'
export function StorefrontHome() {
  const { data } = useCatalog()
  const count = (slug: string) => data?.groups.find(g => g.slug === slug)?.products_count
  const fishing = count('balikcilik')
  return <div className="storefront"><div className="store-container">
    <section className="home-hero">
      <div className="hero-main">
        <Image className="hero-image" src="/images/storefront/fishing-campaign.webp" alt="" fill sizes="(max-width: 900px) 100vw, 60vw" preload />
        <span className="hero-kicker">Yeni sezon balıkçılık</span>
        <div className="hero-copy">
          <h1>Rastgele değil, doğru ekipmanla.</h1>
          <p>Kamıştan iğneye, yemden fırdöndüye{fishing ? ` — ${fishing} balıkçılık ürünü tek yerde.` : ' — balıkçılık ekipmanları tek yerde.'}</p>
        </div>
        <div className="hero-actions">
          <Link href={collectionHref('balikcilik')} className="store-button light">Balıkçılığı keşfet <ArrowRight size={18} /></Link>
          <Link href="/urunler" className="store-button outline">Tüm ürünler</Link>
        </div>
      </div>
      <div className="hero-side">
        <Link href={collectionHref('fener-aydinlatma')} className="hero-card hero-card-lighting">
          <Image className="hero-image" src="/images/storefront/lighting-campaign.webp" alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 40vw" />
          <span className="eyebrow">Fener &amp; Aydınlatma</span>
          <strong>Karanlıkta da<br />yolunu bul.</strong>
          <span className="hero-card-link">{count('fener-aydinlatma') ?? ''} ürün <ArrowRight size={16} /></span>
        </Link>
        <Link href={collectionHref('ev-mutfak')} className="hero-card tinted">
          <Image className="hero-image" src="/images/storefront/kitchen-campaign.webp" alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, 40vw" />
          <span className="eyebrow">Ev &amp; Mutfak</span>
          <strong>Paslanmaz çelik,<br />uzun ömürlü.</strong>
          <span className="hero-card-link">{count('ev-mutfak') ?? ''} ürün <ArrowRight size={16} /></span>
        </Link>
      </div>
    </section>
    <CategoryGrid />
    <FeaturedProducts />
    <section className="editorial-grid">
      <Link href={collectionHref('kamp-outdoor')} className="editorial-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/storefront/camp-editorial.png" alt="Ormanda kamp ekipmanları ve yanan bir fener" loading="lazy" />
        <div><span className="eyebrow">Şehrin dışında, kendi ritminde</span><h2>Biraz doğa.<br />Bolca özgürlük.</h2><span className="editorial-link">Kamp &amp; outdoor <ArrowRight size={17} /></span></div>
      </Link>
      <Link href={collectionHref('balikcilik')} className="editorial-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/storefront/fishing-hero.png" alt="Dağ gölü kıyısındaki iskelede olta ve balıkçılık ekipmanları" loading="lazy" />
        <div><span className="eyebrow">İlk atıştan son ışığa</span><h2>Göl kıyısına<br />hazır ol.</h2><span className="editorial-link">Balıkçılık <ArrowRight size={17} /></span></div>
      </Link>
    </section>
    <FeaturedProducts newest />
    <section className="store-benefits" aria-label="Neden MSO">
      {[{ icon: Compass, title: 'Tutkunuza uygun ekipman', text: 'Balıkçılıktan günlük yaşama' }, { icon: Search, title: 'Aradığınızı kolayca bulun', text: 'İhtiyaca göre düzenlenen kategoriler' }, { icon: PackageCheck, title: 'Güncel ürün kataloğu', text: data ? `${data.total} ürün, ${data.groups.length} kategori` : 'Yeni keşiflere açık bir koleksiyon' }, { icon: Headphones, title: 'Alışverişte yanınızdayız', text: 'Sorularınız için bize ulaşın' }].map(({ icon: Icon, title, text }) => <div key={title}><span><Icon size={22} strokeWidth={1.7} /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}
    </section>
  </div></div>
}
