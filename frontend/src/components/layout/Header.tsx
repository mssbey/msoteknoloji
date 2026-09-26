'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowRight, LayoutGrid, LogOut } from 'lucide-react'
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
  const closeMenu = () => setMenuOpen(false)
  return <>
    <div className="store-announcement"><span>Balıkçılık <i /> Outdoor <i /> Ev &amp; Yaşam</span><Link href="/urunler?sort=newest">Yeni gelenlere göz at <ArrowRight size={13} /></Link></div>
    <header className="shop-header">
      <div className="shop-header-main store-container">
        <Link href="/" className="shop-logo" aria-label="MSO Teknoloji ana sayfa">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="MSO Teknoloji" className="shop-logo-img" />
        </Link>
        <form onSubmit={search} className="shop-search" role="search">
          <Search size={19} aria-hidden />
          <input aria-label="Ürün ara" placeholder="Olta, yem, fener, mutfak… ne arıyorsun?" value={query} onChange={e => setQuery(e.target.value)} />
          <button type="submit">Ara</button>
        </form>
        <div className="shop-actions">
          <div className="shop-account">
            <button className="shop-action" aria-label="Hesabım" aria-expanded={accountOpen} onClick={() => { if (!isAuthenticated) router.push('/giris'); else setAccountOpen(!accountOpen) }}><User size={21} strokeWidth={1.8} /><span>{isAuthenticated ? user?.name?.split(' ')[0] : 'Hesabım'}</span></button>
            {accountOpen && <div className="shop-account-menu">
              <Link href="/hesabim" onClick={() => setAccountOpen(false)}>Hesabım</Link>
              <Link href="/hesabim/siparislerim" onClick={() => setAccountOpen(false)}>Siparişlerim</Link>
              {user?.roles?.includes('seller') && <Link href="/satis-paneli" onClick={() => setAccountOpen(false)}>Satıcı paneli</Link>}
              {user?.roles?.some(r => ['super_admin', 'admin'].includes(r)) && <a href={backendUrl('/admin')}>Yönetim paneli</a>}
              <button onClick={() => { logout(); setAccountOpen(false) }}><LogOut size={14} /> Çıkış yap</button>
            </div>}
          </div>
          <Link href="/hesabim/favoriler" className="shop-action shop-icon-action" aria-label={`Favorilerim, ${wishlistCount} ürün`}><Heart size={21} strokeWidth={1.8} />{wishlistCount > 0 && <b>{wishlistCount}</b>}</Link>
          <button className="shop-cart" onClick={openCart} aria-label={`Sepetim, ${itemCount()} ürün`}><ShoppingBag size={20} strokeWidth={1.8} /><span>Sepetim</span><b>{itemCount()}</b></button>
          <button className="shop-menu-toggle" aria-label="Menüyü aç veya kapat" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      <nav className={`shop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Ana menü"><div className="store-container">
        <Link href="/kategoriler" className="all-categories" onClick={closeMenu}><LayoutGrid size={16} /> Tüm kategoriler</Link>
        {data?.groups.slice(0, 6).map(g => <Link key={g.slug} href={collectionHref(g.slug)} onClick={closeMenu}>{g.name}</Link>)}
        <Link className={pathname === '/urunler' ? 'nav-all active' : 'nav-all'} href="/urunler" onClick={closeMenu}>Tüm ürünler <ArrowRight size={14} /></Link>
      </div></nav>
    </header>
  </>
}
