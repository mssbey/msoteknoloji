'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, User, Menu, X, ArrowRight, ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useCatalog, collectionHref } from '@/lib/catalog'
import { backendUrl } from '@/lib/apiBase'
import { formatPrice } from '@/lib/utils'
const subcategoryLabel = (name: string) => name === 'Sentos' ? 'Diğer ürünler' : name
// Alfabetik; "Diğer …" başlıkları en sona.
const subcategoryOrder = (a: { name: string }, b: { name: string }) => {
  const A = subcategoryLabel(a.name), B = subcategoryLabel(b.name)
  return Number(A.startsWith('Diğer')) - Number(B.startsWith('Diğer')) || A.localeCompare(B, 'tr')
}
export function Header() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [megaSlug, setMegaSlug] = useState<string | null>(null)
  const { itemCount, subtotal, openCart } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const wishlistCount = useWishlistStore(s => s.ids.length)
  const { data } = useCatalog()
  const groups = data?.groups ?? []
  const mega = groups.find(g => g.slug === megaSlug)
  const firstName = isAuthenticated ? user?.name?.split(' ')[0] : null
  const search = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const params = new URLSearchParams({ q: query.trim() })
    if (scope) params.set('collection', scope)
    router.push(`/urunler?${params}`)
    setMenuOpen(false)
  }
  const closeAll = () => { setMenuOpen(false); setMegaSlug(null) }
  return <>
    <div className="store-topbar"><div className="store-container">
      <Link href="/urunler?sort=newest" className="topbar-new"><i />Yeni gelenlere göz at</Link>
      <nav aria-label="Yardım"><Link href="/hesabim/siparislerim">Sipariş takibi</Link><Link href="/iletisim">İletişim</Link></nav>
    </div></div>
    <header className="shop-header" onKeyDown={e => { if (e.key === 'Escape') { setMegaSlug(null); setAccountOpen(false) } }}>
      <div className="shop-header-main store-container">
        <Link href="/" className="shop-logo" aria-label="MSO Teknoloji ana sayfa" onClick={closeAll}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="MSO Teknoloji" className="shop-logo-img" />
        </Link>
        <form onSubmit={search} className="shop-search" role="search">
          <label className="search-scope">
            <span className="sr-only">Arama kategorisi</span>
            <select value={scope} onChange={e => setScope(e.target.value)}>
              <option value="">Tüm kategoriler</option>
              {groups.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
            </select>
            <ChevronDown size={16} aria-hidden />
          </label>
          <input aria-label="Ürün ara" placeholder="Olta, yem, fener, mutfak… ne arıyorsun?" value={query} onChange={e => setQuery(e.target.value)} />
          <button type="submit" aria-label="Ara"><Search size={20} strokeWidth={2.2} /></button>
        </form>
        <div className="shop-actions">
          <div className="shop-account">
            <button className="shop-action" aria-expanded={accountOpen} onClick={() => { if (!isAuthenticated) router.push('/giris'); else setAccountOpen(!accountOpen) }}>
              <span className="action-icon"><User size={20} strokeWidth={1.8} /></span>
              <span className="action-text"><small>{firstName ? 'Merhaba,' : 'Giriş yap'}</small><strong>{firstName ?? 'Hesabım'}</strong></span>
            </button>
            {accountOpen && <div className="shop-account-menu">
              <Link href="/hesabim" onClick={() => setAccountOpen(false)}>Hesabım</Link>
              <Link href="/hesabim/siparislerim" onClick={() => setAccountOpen(false)}>Siparişlerim</Link>
              {user?.roles?.includes('seller') && <Link href="/satis-paneli" onClick={() => setAccountOpen(false)}>Satıcı paneli</Link>}
              {user?.roles?.some(r => ['super_admin', 'admin'].includes(r)) && <a href={backendUrl('/admin')}>Yönetim paneli</a>}
              <button onClick={() => { logout(); setAccountOpen(false) }}><LogOut size={14} /> Çıkış yap</button>
            </div>}
          </div>
          <Link href="/hesabim/favoriler" className="shop-action shop-wishlist" aria-label={`Favorilerim, ${wishlistCount} ürün`}>
            <span className="action-icon"><Heart size={20} strokeWidth={1.8} />{wishlistCount > 0 && <b>{wishlistCount}</b>}</span>
            <span className="action-text"><small>Favoriler</small><strong>{wishlistCount} ürün</strong></span>
          </Link>
          <button className="shop-cart" onClick={openCart} aria-label={`Sepetim, ${itemCount()} ürün`}>
            <span className="action-icon"><ShoppingBag size={20} strokeWidth={1.8} /><b>{itemCount()}</b></span>
            <span className="action-text"><small>Sepetim · {itemCount()}</small><strong>{formatPrice(subtotal())}</strong></span>
          </button>
          <button className="shop-menu-toggle" aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      <nav className={`shop-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Kategoriler" onMouseLeave={() => setMegaSlug(null)}>
        <div className="store-container">
          <Link href="/kategoriler" className="all-categories" onClick={closeAll}><Menu size={17} /> Tüm kategoriler</Link>
          {groups.map((g, i) => <Link key={g.slug} href={collectionHref(g.slug)} className={`nav-group${i >= 6 ? ' nav-extra' : ''}${megaSlug === g.slug ? ' is-active' : ''}`} aria-expanded={megaSlug === g.slug} onMouseEnter={() => setMegaSlug(g.slug)} onFocus={() => setMegaSlug(g.slug)} onClick={closeAll}>
            <span>{g.name}</span><em>{g.products_count}</em><ChevronDown size={15} className="nav-chevron" aria-hidden /><ChevronRight size={18} className="nav-chevron-mobile" aria-hidden />
          </Link>)}
          <Link className="nav-all" href="/urunler" onClick={closeAll}>Tüm ürünler <ArrowRight size={14} /></Link>
          <div className="mobile-nav-actions">
            <Link href={isAuthenticated ? '/hesabim' : '/giris'} onClick={closeAll}><User size={18} /> {isAuthenticated ? 'Hesabım' : 'Giriş yap'}</Link>
            <Link href="/hesabim/favoriler" onClick={closeAll}><Heart size={18} /> Favoriler · {wishlistCount}</Link>
          </div>
        </div>
        {mega && <div className="mega-menu"><div className="store-container"><div className="mega-panel">
          <div className="mega-links">
            <div className="mega-head"><strong>{mega.name}</strong><Link href={collectionHref(mega.slug)} onClick={closeAll}>{mega.products_count} ürünün hepsi <ArrowRight size={15} /></Link></div>
            <div className="mega-grid">{[...mega.categories].sort(subcategoryOrder).map(c => <Link key={c.slug} href={`/urunler?collection=${mega.slug}&category=${c.slug}`} onClick={closeAll}>{subcategoryLabel(c.name)}</Link>)}</div>
          </div>
          <Link href={collectionHref(mega.slug)} className="mega-promo" onClick={closeAll}>
            <span className="eyebrow">MSO koleksiyonu</span>
            <strong>{mega.description || mega.name}</strong>
            <span className="mega-promo-link">Keşfet <ArrowRight size={16} /></span>
          </Link>
        </div></div></div>}
      </nav>
    </header>
  </>
}
