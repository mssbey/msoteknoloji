'use client'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Compass, PackageCheck, Search, Headphones, Fish, Flashlight } from 'lucide-react'
import { CategoryGrid } from './CategoryGrid'
import { FeaturedProducts } from './FeaturedProducts'
import { collectionHref, useCatalog } from '@/lib/catalog'
export function StorefrontHome() {
  const { data } = useCatalog()
  return <div className="storefront"><div className="store-container">
    <div className="store-breadcrumb">MSO TEKNOLOJİ <span>/</span> DOĞAYA VE HAYATA HAZIR</div>
    <section className="discovery-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-landscape" src="/images/storefront/fishing-hero.png" alt="Dağ gölü kıyısındaki iskelede olta ve balıkçılık ekipmanları" fetchPriority="high" />
      <div className="hero-shade" />
      <div className="hero-copy"><span className="hero-kicker"><span /> HER KEŞİF İYİ BİR EKİPMANLA BAŞLAR</span><h1>Rotan doğa.<br />Ekipmanın <em>MSO.</em></h1><p>İlk atışın heyecanından kampın sessizliğine.<br className="hidden sm:block" /> Tutkunuza eşlik eden ekipmanları keşfedin.</p><div className="hero-actions"><Link href={collectionHref('balikcilik')} className="store-button">Balıkçılığı keşfet <ArrowUpRight size={19} /></Link><Link href="/urunler" className="hero-secondary">Tüm ürünler <ArrowRight size={17} /></Link></div></div>
      <div className="hero-bottom"><span><Compass size={17} /> DIŞARIDA KEŞFEDECEK ÇOK ŞEY VAR.</span><span>01 <i /> BALIKÇILIK KOLEKSİYONU</span></div>
      <Link href={collectionHref('balikcilik')} className="hero-note"><Fish size={22} /><div><small>DOĞRU EKİPMAN, GÜZEL BİR BAŞLANGIÇ</small><strong>Bir sonraki atışa hazır mısın?</strong></div><ArrowUpRight size={22} /></Link>
    </section>
    <div className="store-benefits">{[{icon: Compass, title:'Tutkunuza uygun ekipman', text:'Balıkçılıktan günlük yaşama'}, {icon: Search, title:'Aradığınızı kolayca bulun', text:'İhtiyaca göre düzenlenen kategoriler'}, {icon: PackageCheck, title:'Güncel ürün kataloğu', text:data ? `${data.total} ürün, tek bir keşif noktası` : 'Yeni keşiflere açık bir koleksiyon'}, {icon: Headphones, title:'Alışverişte yanınızdayız', text:'Sorularınız için bize ulaşın'}].map(({icon: Icon, title, text}) => <div key={title}><Icon size={25} strokeWidth={1.5} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</div>
    <CategoryGrid /><FeaturedProducts />
    <section className="editorial-grid"><Link href={collectionHref('kamp-outdoor')} className="editorial-card outdoor-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/storefront/camp-editorial.png" alt="Ormanda kamp ekipmanları ve yanan bir fener" loading="lazy" />
      <div><span className="eyebrow">ŞEHRİN DIŞINDA, KENDİ RİTMİNDE</span><h2>Biraz doğa.<br />Bolca özgürlük.</h2><p>Kamp ve outdoor koleksiyonunu keşfet.</p><span className="editorial-link">Keşfe çık <ArrowUpRight size={19} /></span></div>
    </Link><Link href={collectionHref('fener-aydinlatma')} className="editorial-card light-card"><div className="editorial-icon"><Flashlight size={110} strokeWidth={0.7} /></div><div><span className="eyebrow">KARANLIĞIN ÖTESİNİ GÖR</span><h2>Gücünü<br />ışığa dönüştür.</h2><p>LED & UV fenerler ve enerji çözümleri.</p><span className="editorial-link">Fenerleri incele <ArrowUpRight size={19} /></span></div></Link></section>
    <FeaturedProducts newest />
    <section className="store-closing"><div className="closing-mark"><Compass size={46} strokeWidth={1} /></div><div><span className="eyebrow">MSO İLE HER GÜNE HAZIR</span><h2>Küçük ihtiyaçlar.<br className="sm:hidden" /> Büyük kolaylıklar.</h2><p>Bahçenizden mutfağınıza, hayatı kolaylaştıran ürünler bir arada.</p></div><Link className="store-button" href="/kategoriler">Koleksiyonu keşfet <ArrowUpRight size={18} /></Link></section>
  </div></div>
}
