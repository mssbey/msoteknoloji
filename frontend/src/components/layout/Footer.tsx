'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { collectionHref, useCatalog } from '@/lib/catalog'
export function Footer() {
  const { data } = useCatalog()
  return <footer className="store-footer"><div className="store-container"><div className="store-footer-main"><div><Link href="/" className="shop-logo">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/images/logo-white.png" alt="MSO Teknoloji" className="shop-logo-img footer-logo-img" />
  </Link><p>Doğadaki keşiflerinizden günlük ihtiyaçlarınıza. Balıkçılık, outdoor, aydınlatma ve yaşam ürünleriyle her güne hazır olun.</p></div><div><h3>KOLEKSİYONLAR</h3><ul>{data?.groups.slice(0,5).map(g => <li key={g.slug}><Link href={collectionHref(g.slug)}>{g.name}</Link></li>)}</ul></div><div><h3>ALIŞVERİŞ</h3><ul><li><Link href="/urunler">Tüm ürünler</Link></li><li><Link href="/urunler?sort=newest">Yeni gelenler</Link></li><li><Link href="/kategoriler">Kategorileri keşfet</Link></li><li><Link href="/hesabim/favoriler">Favorilerim</Link></li><li><Link href="/hesabim/siparislerim">Siparişlerim</Link></li></ul></div><div><h3>YANINIZDAYIZ</h3><ul><li><Link href="/iletisim">İletişim <ArrowUpRight size={12} className="inline" /></Link></li><li><Link href="/sss">Sık sorulan sorular</Link></li><li><Link href="/iade">İade ve değişim</Link></li><li><Link href="/hakkimizda">MSO hakkında</Link></li></ul></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} MSO Teknoloji. Tüm hakları saklıdır.</span><div><Link href="/gizlilik">Gizlilik politikası</Link><Link href="/kvkk">KVKK</Link><Link href="/kullanim-kosullari">Kullanım koşulları</Link></div><span>KEŞFET. HAZIR OL.</span></div></div></footer>
}
