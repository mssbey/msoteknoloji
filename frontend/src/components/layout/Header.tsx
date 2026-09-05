'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowUpRight, ChevronDown, LogOut } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useCatalog, collectionHref } from '@/lib/catalog'
import { backendUrl } from '@/lib/apiBase'
export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { itemCount, openCart } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const wishlistCount = useWishlistStore(s => s.ids.length)
  const { data } = useCatalog()
  const search = (e: React.FormEvent) => { e.preventDefault(); if (query.trim()) { router.push(`/urunler?q=${encodeURIComponent(query.trim())}`); setMenuOpen(false) } }
  return <>
    <div className="store-announcement"><span>DOĞADA. EVDE. HAYATIN HER ANINDA.</span><Link href="/urunler?sort=newest">Yeni keşiflere göz at <ArrowUpRight size={13} /></Link></div>
    <header className="shop-header">
      <div className="shop-header-main store-container">
        <Link href="/" className="shop-logo" aria-label="MSO Teknoloji ana sayfa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="MSO Teknoloji" className="shop-logo-img" />
          <span className="logo-divider" /><span className="logo-motto">Keşfet.<br />Hazır ol.</span>
        </Link>
        <form onSubmit={search} className="shop-search"><Search size={19} /><input aria-label="Ürün ara" placeholder="Bir sonraki keşfin için ne arıyorsun?" value={query} onChange={e => setQuery(e.target.value)} /><button type="submit" aria-label="Ara"><ArrowUpRight size={20} /></button></form>
        <div className="shop-actions"><div className="shop-account"><button aria-label="Hesabım" aria-expanded={accountOpen} onClick={() => { if (!isAuthenticated) router.push('/giris'); else setAccountOpen(!accountOpen) }}><User size={21} /><span>{isAuthenticated ? user?.name?.split(' ')[0] : 'Hesabım'}</span></button>{accountOpen && <div className="shop-account-menu"><Link href="/hesabim" onClick={() => setAccountOpen(false)}>Hesabım</Link><Link href="/hesabim/siparislerim" onClick={() => setAccountOpen(false)}>Siparişlerim</Link>{user?.roles?.includes('seller') && <Link href="/satis-paneli" onClick={() => setAccountOpen(false)}>Satıcı paneli</Link>}{user?.roles?.some(r => ['super_admin', 'admin'].includes(r)) && <a href={backendUrl('/admin')}>Yönetim paneli</a>}<button onClick={() => { logout(); setAccountOpen(false) }}><LogOut size={14} /> Çıkış yap</button></div>}</div><Link href="/hesabim/favoriler" aria-label={`Favorilerim, ${wishlistCount} ürün`}><Heart size={21} />{wishlistCount > 0 && <b>{wishlistCount}</b>}</Link><button className="shop-cart" onClick={openCart} aria-label={`Sepetim, ${itemCount()} ürün`}><ShoppingBag size={21} /><span>Sepetim</span><b>{itemCount()}</b></button><button className="shop-menu-toggle" aria-label="Menüyü aç veya kapat" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      <nav className={`shop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Ana menü"><div className="store-container"><Link href="/kategoriler" className="all-categories" onClick={() => setMenuOpen(false)}><Menu size={17} /> Tüm kategoriler <ChevronDown size={13} /></Link>{data?.groups.slice(0, 6).map(g => <Link key={g.slug} href={collectionHref(g.slug)} onClick={() => setMenuOpen(false)}>{g.name}</Link>)}<Link className={pathname === '/urunler' ? 'nav-all active' : 'nav-all'} href="/urunler" onClick={() => setMenuOpen(false)}>Tüm ürünler <ArrowUpRight size={14} /></Link></div></nav>
    </header>
  </>
}
