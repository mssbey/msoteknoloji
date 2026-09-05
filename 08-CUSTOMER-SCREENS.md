# 08 — MÜŞTERİ EKRANLARI & UI KIT

## 8.1 Renk Sistemi & Design Tokens

```typescript
// tailwind.config.ts — Design System

const theme = {
  colors: {
    // Brand
    primary:   { DEFAULT: '#0066FF', dark: '#0052CC', light: '#3385FF' },
    secondary: { DEFAULT: '#7C3AED', dark: '#6D28D9', light: '#8B5CF6' },
    accent:    { DEFAULT: '#F59E0B', dark: '#D97706', light: '#FCD34D' },
    
    // Semantic
    success:   '#10B981',
    warning:   '#F59E0B',
    error:     '#EF4444',
    info:      '#3B82F6',
    
    // Dark Mode Surface
    surface: {
      'dark-1':  '#0A0A0B',   // En koyu (background)
      'dark-2':  '#111113',   // Card background
      'dark-3':  '#18181B',   // Elevated card
      'dark-4':  '#1F1F23',   // Input, hover
      'dark-5':  '#27272A',   // Border
    },
    
    // Light Mode Surface
    surface_light: {
      '1': '#FFFFFF',
      '2': '#F8F8F8',
      '3': '#F0F0F0',
      '4': '#E8E8E8',
      '5': '#D4D4D8',
    },
  },
  
  // Cam efektleri (glassmorphism)
  backdropBlur: {
    'xs': '2px',
    'sm': '4px',
    'glass': '12px',
    'glass-heavy': '20px',
  },
  
  // Animasyon eğrileri
  transitionTimingFunction: {
    'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
    'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}
```

## 8.2 UI Komponent Kütüphanesi

```
packages/ui/components/
├── atoms/
│   ├── Button/
│   │   ├── Button.tsx          # Primary, Secondary, Ghost, Danger
│   │   └── IconButton.tsx
│   ├── Badge/                  # Status, Count, Color badges
│   ├── Avatar/                 # User avatarları
│   ├── Spinner/                # Loading göstergeleri
│   ├── Skeleton/               # Loading placeholder
│   ├── Tag/                    # Etiket komponenti
│   └── Divider/
│
├── molecules/
│   ├── Card/
│   │   ├── ProductCard.tsx     # Ana ürün kartı
│   │   ├── MiniProductCard.tsx # Küçük kart
│   │   └── StoreCard.tsx       # Mağaza kartı
│   ├── Rating/                 # Yıldız değerlendirme
│   ├── PriceTag/               # Fiyat gösterimi
│   ├── CountdownTimer/         # Kampanya sayacı
│   ├── ProgressBar/
│   ├── Breadcrumb/
│   └── Pagination/
│
├── organisms/
│   ├── ProductGallery/         # Zoom, video destekli galeri
│   ├── FilterPanel/            # Hızlı filtreleme sidebar
│   ├── SearchResults/          # Arama sonuç grid
│   ├── ReviewSection/          # Yorumlar bölümü
│   ├── OrderTimeline/          # Sipariş takip zaman çizelgesi
│   ├── CheckoutStepper/        # Ödeme adımları
│   └── CartDrawer/             # Sepet yan paneli
│
└── layout/
    ├── Header/
    ├── Footer/
    ├── Sidebar/
    └── MobileBottomNav/
```

## 8.3 Ürün Kartı Komponenti

```tsx
// packages/ui/components/molecules/Card/ProductCard.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { HeartIcon, ShoppingCartIcon, EyeIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatPrice } from '@/utils/format'

interface ProductCardProps {
  product: {
    id: number
    name: string
    slug: string
    price: number
    salePrice?: number
    discountPercent?: number
    image: string
    rating: number
    reviewCount: number
    storeName: string
    inStock: boolean
    isFeatured?: boolean
    badge?: string
  }
  variant?: 'default' | 'compact' | 'horizontal'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCartStore()
  const { toggle, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      {/* Görsel Alanı */}
      <div className="relative aspect-square overflow-hidden bg-zinc-50 dark:bg-zinc-800">
        <Link href={`/urun/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className={`object-contain p-4 transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
          />
        </Link>

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-3 left-3 rounded-full bg-blue-500 px-2.5 py-1 text-xs font-bold text-white">
            {product.badge}
          </span>
        )}

        {/* İndirim Etiketi */}
        {product.discountPercent && (
          <span className="absolute top-3 right-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
            -%{product.discountPercent}
          </span>
        )}

        {/* Hover Aksiyonları */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-x-0 bottom-0 flex justify-center gap-2 p-3 bg-gradient-to-t from-black/40 to-transparent"
        >
          {/* Favori */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggle(product.id)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
          >
            {wishlisted
              ? <HeartSolid className="h-5 w-5 text-red-500" />
              : <HeartIcon className="h-5 w-5 text-zinc-700" />
            }
          </motion.button>

          {/* Hızlı Görünüm */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
          >
            <EyeIcon className="h-5 w-5 text-zinc-700" />
          </motion.button>

          {/* Sepete Ekle */}
          {product.inStock && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => addItem({
                productId: product.id,
                name: product.name,
                image: product.image,
                price: product.salePrice ?? product.price,
                quantity: 1,
                slug: product.slug,
              })}
              className="flex h-9 items-center gap-1.5 rounded-full bg-blue-500 px-4 text-white text-xs font-bold shadow-md hover:bg-blue-600 transition-colors"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              Ekle
            </motion.button>
          )}
        </motion.div>

        {/* Stok Yok */}
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold text-zinc-700">
              Stokta Yok
            </span>
          </div>
        )}
      </div>

      {/* Bilgi Alanı */}
      <div className="p-3">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">{product.storeName}</p>
        
        <Link href={`/urun/${product.slug}`}>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2 hover:text-blue-500 transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1">
          <div className="flex">
            {[1,2,3,4,5].map(star => (
              <span key={star} className={`text-xs ${star <= Math.round(product.rating) ? 'text-amber-400' : 'text-zinc-200 dark:text-zinc-700'}`}>★</span>
            ))}
          </div>
          <span className="text-xs text-zinc-400">({product.reviewCount})</span>
        </div>

        {/* Fiyat */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-black text-zinc-900 dark:text-white">
            {formatPrice(product.salePrice ?? product.price)}
          </span>
          {product.salePrice && (
            <span className="text-xs text-zinc-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
```

## 8.4 Ürün Detay — Sticky Satın Alma

```tsx
// components/product/ProductStickySidebar.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCartIcon, BoltIcon, HeartIcon } from '@heroicons/react/24/outline'
import { ShieldCheckIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/solid'

export function ProductStickySidebar({ product }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariants, setSelectedVariants] = useState({})
  const [addedToCart, setAddedToCart] = useState(false)

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
      
      {/* Fiyat */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-black text-zinc-900 dark:text-white">
            {formatPrice(product.current_price)}
          </span>
          {product.sale_price && (
            <span className="text-lg text-zinc-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
          {product.discount_percent && (
            <span className="rounded-md bg-red-500 px-2 py-0.5 text-sm font-bold text-white">
              -%{product.discount_percent}
            </span>
          )}
        </div>
        <p className="text-xs text-zinc-400 mt-1">KDV Dahil</p>
      </div>

      {/* Varyant Seçimi */}
      {product.attribute_groups?.map(group => (
        <div key={group.id}>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            {group.name}: <span className="font-normal">{selectedVariants[group.id] || 'Seçin'}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {group.type === 'color'
              ? group.attributes.map(attr => (
                  <button
                    key={attr.id}
                    onClick={() => setSelectedVariants(prev => ({...prev, [group.id]: attr.value}))}
                    title={attr.value}
                    style={{ backgroundColor: attr.color_hex }}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      selectedVariants[group.id] === attr.value
                        ? 'border-blue-500 scale-110'
                        : 'border-transparent'
                    }`}
                  />
                ))
              : group.attributes.map(attr => (
                  <button
                    key={attr.id}
                    onClick={() => setSelectedVariants(prev => ({...prev, [group.id]: attr.value}))}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      selectedVariants[group.id] === attr.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                        : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300'
                    }`}
                  >
                    {attr.value}
                  </button>
                ))
            }
          </div>
        </div>
      ))}

      {/* Miktar Seçici */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Adet:</span>
        <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-l-xl transition-colors"
          >
            -
          </button>
          <span className="w-10 text-center font-bold">{quantity}</span>
          <button
            onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
            className="flex h-10 w-10 items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-r-xl transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-xs text-zinc-400">{product.stock} adet stokta</span>
      </div>

      {/* Aksiyon Butonları */}
      <div className="space-y-2">
        {/* Hemen Al */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-4 text-white font-bold text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
        >
          <BoltIcon className="h-5 w-5" />
          Hemen Satın Al
        </motion.button>

        {/* Sepete Ekle */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            setAddedToCart(true)
            setTimeout(() => setAddedToCart(false), 2000)
          }}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3.5 font-bold text-base transition-all ${
            addedToCart
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400 text-zinc-700 dark:text-zinc-300'
          }`}
        >
          <ShoppingCartIcon className="h-5 w-5" />
          {addedToCart ? '✓ Sepete Eklendi' : 'Sepete Ekle'}
        </motion.button>

        {/* Favori */}
        <button className="flex w-full items-center justify-center gap-2 py-2 text-zinc-400 hover:text-red-500 transition-colors text-sm">
          <HeartIcon className="h-4 w-4" />
          Favorilere Ekle
        </button>
      </div>

      {/* Güvenceler */}
      <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
        {[
          { icon: TruckIcon, text: 'Ücretsiz Kargo (199 TL üzeri)', color: 'text-green-500' },
          { icon: ShieldCheckIcon, text: '2 Yıl Garanti', color: 'text-blue-500' },
          { icon: ArrowPathIcon, text: '30 Gün İade Garantisi', color: 'text-purple-500' },
        ].map(({ icon: Icon, text, color }) => (
          <div key={text} className="flex items-center gap-2.5">
            <Icon className={`h-4 w-4 ${color}`} />
            <span className="text-xs text-zinc-600 dark:text-zinc-400">{text}</span>
          </div>
        ))}
      </div>

      {/* Mağaza */}
      <div className="flex items-center gap-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-3">
        <div className="h-10 w-10 rounded-xl overflow-hidden flex-shrink-0">
          <img src={product.store.logo} alt={product.store.name} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{product.store.name}</p>
          <p className="text-xs text-zinc-400">⭐ {product.store.rating} ({product.store.review_count} değerlendirme)</p>
        </div>
        <a href={`/magaza/${product.store.slug}`} className="text-xs text-blue-500 hover:underline flex-shrink-0">
          Mağazaya Git
        </a>
      </div>
    </div>
  )
}
```

## 8.5 Sipariş Takip Ekranı

```
SİPARİŞ TAKİP: #MSO260601XZ89
──────────────────────────────────────────────────────────────────────────

        ✅              ✅              ✅              ⏳              ○
   Sipariş           Ödeme         Hazırlanıyor       Kargoda        Teslim
  Alındı            Onaylandı      Tamamlandı        01.06.2026
01.06.2026         01.06.2026     01.06.2026        Aras Kargo

KARGO DETAYI:
┌─────────────────────────────────────────────────────────────────┐
│ Aras Kargo — Takip: 1234567890123                               │
│ Tahmini Teslim: 03 Haziran 2026 (Pazartesi)                    │
│                                                                 │
│ KARGO HAREKET GEÇMİŞİ:                                         │
│ ─────────────────────────────────────────────────────           │
│ 🟢  01.06 14:32  Kargo şubeye teslim edildi (Kadıköy)          │
│ 🔵  01.06 12:15  Paket hazırlandı — TechStore Pro              │
│ 🔵  01.06 10:00  Sipariş onaylandı                             │
│ ⚪  01.06 09:48  Sipariş alındı                                │
│                                                                 │
│ [📍 Haritada İzle] [📞 Kargo Destek]                          │
└─────────────────────────────────────────────────────────────────┘

ÜRÜNLERİM:
┌──────────────────────────────────────────────────────────────────┐
│ 🖼️ iPhone 15 Pro Kılıf (Siyah)                    299 TL × 2   │
│    [⭐ Değerlendir] [🔄 İade Et]                                │
└──────────────────────────────────────────────────────────────────┘
```

## 8.6 Ödeme Akışı (3 Adım)

```
ADIM 1: TESLİMAT                   ADIM 2: ÖDEME                  ADIM 3: ÖZET

Teslimat Adresi                     Ödeme Yöntemi                  Sipariş Özeti
─────────────────                   ─────────────────               ─────────────────
● Ev (Kayıtlı)                      ○ Kredi/Banka Kartı             iPhone Kılıf × 2   598 TL
  İstanbul, Kadıköy                   [____________________]         USB Kablo × 1     149 TL
  Moda Cad. No:12                     [____] [____] [____]           Kargo              29 TL
                                      ● iyzico 3D Secure             Kupon (-MSO10)    -77 TL
○ İş Yeri (Kayıtlı)                 ○ PayTR                          ──────────────────────
  İstanbul, Şişli                   ○ Havale / EFT                   TOPLAM            699 TL
                                    ○ B2B Cari Hesap
[+ Yeni Adres Ekle]                                                  [Siparişi Tamamla]
                                    Kupon Kodu:
[İleri →]                           [___________] [Uygula]
```

## 8.7 Skeleton Loading Sistemi

```tsx
// components/ui/Skeleton/ProductCardSkeleton.tsx

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden animate-pulse">
      {/* Görsel Skeleton */}
      <div className="aspect-square bg-zinc-100 dark:bg-zinc-800" />
      
      {/* İçerik Skeleton */}
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded w-1/3" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-4/5" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded w-3/5" />
        <div className="flex items-center gap-1 mt-2">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-3 w-3 bg-zinc-100 dark:bg-zinc-800 rounded" />
          ))}
        </div>
        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2" />
      </div>
    </div>
  )
}

// Sayfa yükleme Skeleton örneği
export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 20 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

## 8.8 Mobil Bottom Navigation

```tsx
// components/layout/MobileBottomNav.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HomeIcon, MagnifyingGlassIcon, ShoppingCartIcon,
  HeartIcon, UserCircleIcon
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid, MagnifyingGlassIcon as SearchSolid,
  ShoppingCartIcon as CartSolid, HeartIcon as HeartSolid,
  UserCircleIcon as UserSolid
} from '@heroicons/react/24/solid'
import { useCartStore } from '@/stores/cartStore'

const navItems = [
  { label: 'Ana Sayfa', href: '/', Icon: HomeIcon, ActiveIcon: HomeSolid },
  { label: 'Ara', href: '/search', Icon: MagnifyingGlassIcon, ActiveIcon: SearchSolid },
  { label: 'Sepet', href: '/sepet', Icon: ShoppingCartIcon, ActiveIcon: CartSolid, badge: true },
  { label: 'Favoriler', href: '/hesabim/istek-listem', Icon: HeartIcon, ActiveIcon: HeartSolid },
  { label: 'Hesabım', href: '/hesabim', Icon: UserCircleIcon, ActiveIcon: UserSolid },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { itemCount } = useCartStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur zemin */}
      <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-2 pb-safe-bottom">
        <div className="flex items-center justify-around py-2">
          {navItems.map(({ label, href, Icon, ActiveIcon, badge }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            
            return (
              <Link key={href} href={href} className="relative flex flex-col items-center gap-1 px-3 py-1">
                <div className="relative">
                  {isActive ? (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute -inset-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30"
                    />
                  ) : null}
                  
                  {isActive
                    ? <ActiveIcon className="relative h-6 w-6 text-blue-500" />
                    : <Icon className="relative h-6 w-6 text-zinc-400" />
                  }
                  
                  {/* Sepet badge */}
                  {badge && itemCount() > 0 && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white"
                      >
                        {itemCount() > 99 ? '99+' : itemCount()}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'text-blue-500' : 'text-zinc-400'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
```
