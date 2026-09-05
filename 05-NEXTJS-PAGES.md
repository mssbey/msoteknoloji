# 05 — NEXT.JS 15 SAYFALARI & FRONTEND MİMARİSİ

## 5.1 Proje Yapısı

```
apps/
├── customer/                    # Müşteri mağazası (Port 3000)
├── seller/                      # Satıcı paneli (Port 3001)
└── admin/                       # Admin paneli (Next.js + Filament)

packages/
├── ui/                          # Paylaşımlı UI komponenleri
├── api-client/                  # API istemci (axios + react-query)
├── hooks/                       # Paylaşımlı React hooks
└── utils/                       # Yardımcı fonksiyonlar
```

## 5.2 Müşteri Uygulaması — Sayfa Yapısı

```
apps/customer/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   └── verify/page.tsx
│
├── (main)/
│   ├── layout.tsx               # Header + Footer
│   ├── page.tsx                 # ANA SAYFA
│   ├── search/page.tsx          # Arama Sonuçları
│   │
│   ├── [categorySlug]/
│   │   └── page.tsx             # Kategori Sayfası
│   │
│   ├── urun/
│   │   └── [slug]/
│   │       ├── page.tsx         # Ürün Detay
│   │       └── karsilastir/page.tsx  # Karşılaştır
│   │
│   ├── magaza/
│   │   └── [storeSlug]/
│   │       ├── page.tsx         # Mağaza Vitrin
│   │       └── urunler/page.tsx # Mağaza Ürünleri
│   │
│   ├── sepet/page.tsx           # Sepet
│   ├── odeme/
│   │   ├── page.tsx             # Ödeme Adımları
│   │   ├── basarili/page.tsx    # Ödeme Başarılı
│   │   └── iptal/page.tsx       # Ödeme İptal
│   │
│   ├── kampanyalar/page.tsx     # Kampanyalar
│   ├── markalar/page.tsx        # Markalar
│   ├── blog/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   │
│   └── forum/
│       ├── page.tsx
│       ├── [categorySlug]/page.tsx
│       └── [categorySlug]/[topicSlug]/page.tsx
│
├── (account)/
│   ├── layout.tsx               # Hesap sidebar
│   ├── hesabim/page.tsx
│   ├── siparislerim/
│   │   ├── page.tsx
│   │   └── [orderNumber]/page.tsx
│   ├── adreslerim/page.tsx
│   ├── istek-listem/page.tsx
│   ├── puanlarim/page.tsx
│   ├── bildirimlerim/page.tsx
│   ├── degerlendirmelerim/page.tsx
│   └── guvenlik/page.tsx
│
└── (b2b)/
    ├── kurumsal/
    │   ├── kayit/page.tsx
    │   ├── giris/page.tsx
    │   └── dashboard/
    │       ├── page.tsx
    │       ├── siparisler/page.tsx
    │       ├── teklifler/page.tsx
    │       ├── cari-hesap/page.tsx
    │       └── faturalar/page.tsx
```

## 5.3 Anasayfa Komponenti

```tsx
// app/(main)/page.tsx

import { Suspense } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { LiveCounters } from '@/components/home/LiveCounters'
import { AISearchBar } from '@/components/search/AISearchBar'
import { TrendingProducts } from '@/components/home/TrendingProducts'
import { CampaignBanners } from '@/components/home/CampaignBanners'
import { StoreFeatured } from '@/components/home/StoreFeatured'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { BlogSection } from '@/components/home/BlogSection'
import { TestimonialsSection } from '@/components/home/TestimonialsSection'
import { BrandSlider } from '@/components/home/BrandSlider'
import { Skeleton } from '@/components/ui/Skeleton'

export default async function HomePage() {
  return (
    <main>
      <HeroSection />
      <LiveCounters />
      <AISearchBar variant="hero" />
      
      <Suspense fallback={<Skeleton className="h-96" />}>
        <CampaignBanners />
      </Suspense>
      
      <CategoryGrid />
      
      <Suspense fallback={<Skeleton className="h-[500px]" />}>
        <TrendingProducts />
      </Suspense>
      
      <StoreFeatured />
      <BrandSlider />
      <BlogSection />
      <TestimonialsSection />
    </main>
  )
}
```

## 5.4 Hero Section Komponenti (Premium Animasyonlu)

```tsx
// components/home/HeroSection.tsx
'use client'

import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const slides = [
  {
    id: 1,
    title: 'Türkiye\'nin En Büyük',
    subtitle: 'Teknoloji Marketyeri',
    description: 'Binlerce mağaza, milyonlarca ürün — tek platformda',
    cta: 'Alışverişe Başla',
    ctaLink: '/kampanyalar',
    image: '/hero/slide-1.webp',
    badge: 'YENİ SEZON',
  },
  // ...diğer slaytlar
]

export function HeroSection() {
  const [current, setCurrent] = useState(0)
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-black">
      {/* Parallax background */}
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              className="object-cover"
              priority
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center px-6 md:px-16 lg:px-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white backdrop-blur-sm border border-white/20 mb-4"
            >
              {slides[current].badge}
            </motion.span>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
              <span className="block">{slides[current].title}</span>
              <span className="block bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {slides[current].subtitle}
              </span>
            </h1>

            <p className="mt-4 text-lg text-white/80 max-w-lg">
              {slides[current].description}
            </p>

            <div className="mt-8 flex gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={slides[current].ctaLink}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-black font-bold text-lg hover:bg-white/90 transition-colors"
                >
                  {slides[current].cta}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
```

## 5.5 Canlı Sayaçlar Komponenti

```tsx
// components/home/LiveCounters.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const stats = [
  { label: 'Ürün', value: 50000, suffix: '+', icon: '📦' },
  { label: 'Marka', value: 500, suffix: '+', icon: '🏷️' },
  { label: 'Sipariş', value: 100000, suffix: '+', icon: '🛒' },
  { label: 'Mutlu Müşteri', value: 75000, suffix: '+', icon: '⭐' },
]

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    
    const step = Math.ceil(value / (duration * 60))
    const timer = setInterval(() => {
      setCount(prev => {
        const next = prev + step
        if (next >= value) {
          clearInterval(timer)
          return value
        }
        return next
      })
    }, 1000 / 60)
    
    return () => clearInterval(timer)
  }, [isInView, value, duration])

  return <span ref={ref}>{count.toLocaleString('tr-TR')}</span>
}

export function LiveCounters() {
  return (
    <section className="py-16 bg-black border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-4xl md:text-5xl font-black text-white">
                <AnimatedCounter value={stat.value} />
                <span className="text-blue-400">{stat.suffix}</span>
              </div>
              <div className="mt-1 text-white/60 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

## 5.6 AI Arama Komponenti

```tsx
// components/search/AISearchBar.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { MagnifyingGlassIcon, SparklesIcon, MicrophoneIcon } from '@heroicons/react/24/outline'
import { searchSuggestions } from '@/lib/api/search'

interface AISearchBarProps {
  variant?: 'hero' | 'header' | 'inline'
}

export function AISearchBar({ variant = 'header' }: AISearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [aiMode, setAiMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchSuggestions = useDebouncedCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return }
    const data = await searchSuggestions(q)
    setSuggestions(data)
  }, 300)

  useEffect(() => {
    fetchSuggestions(query)
  }, [query])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    const path = aiMode ? `/search?q=${encodeURIComponent(query)}&ai=1` : `/search?q=${encodeURIComponent(query)}`
    router.push(path)
    setSuggestions([])
  }

  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window)) return
    
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'tr-TR'
    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      router.push(`/search?q=${encodeURIComponent(transcript)}`)
    }
    recognition.start()
  }

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${variant === 'hero' ? 'max-w-2xl mx-auto' : ''}`}>
      {/* Cam efekti arama kutusu */}
      <div className={`
        relative flex items-center rounded-2xl overflow-hidden
        bg-white/10 backdrop-blur-xl border border-white/20
        ${isFocused ? 'border-blue-400/50 shadow-lg shadow-blue-500/20' : ''}
        transition-all duration-300
        ${variant === 'hero' ? 'h-16 text-lg' : 'h-12'}
      `}>
        <MagnifyingGlassIcon className="ml-4 h-5 w-5 text-white/60 flex-shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={aiMode ? "AI ile doğal dilde ara: 'kırmızı gaming mouse 500 TL altı'" : "Ürün, marka veya kategori ara..."}
          className="flex-1 bg-transparent px-3 text-white placeholder-white/40 outline-none"
        />

        {/* AI Mode Toggle */}
        <button
          type="button"
          onClick={() => setAiMode(!aiMode)}
          className={`mr-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
            aiMode
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
              : 'bg-white/10 text-white/60 hover:bg-white/20'
          }`}
        >
          <SparklesIcon className="h-3.5 w-3.5" />
          AI
        </button>

        {/* Sesli Arama */}
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`mr-2 rounded-lg p-2 transition-all ${
            isListening ? 'bg-red-500 text-white animate-pulse' : 'text-white/60 hover:bg-white/10'
          }`}
        >
          <MicrophoneIcon className="h-5 w-5" />
        </button>

        {/* Ara Butonu */}
        <button
          type="submit"
          className="mr-2 rounded-xl bg-blue-500 hover:bg-blue-600 px-5 py-2 text-white font-medium text-sm transition-colors"
        >
          Ara
        </button>
      </div>

      {/* Öneriler Dropdown */}
      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            {suggestions.map((item: any, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                type="button"
                onClick={() => {
                  setQuery(item.text)
                  router.push(`/search?q=${encodeURIComponent(item.text)}`)
                }}
                className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left"
              >
                <MagnifyingGlassIcon className="h-4 w-4 text-white/40" />
                <span className="text-white/90 text-sm">{item.text}</span>
                {item.category && (
                  <span className="ml-auto text-xs text-white/40">{item.category}</span>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}
```

## 5.7 Ürün Detay Sayfası Yapısı

```tsx
// app/(main)/urun/[slug]/page.tsx

import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/api/products'
import { ProductGallery } from '@/components/product/ProductGallery'
import { ProductInfo } from '@/components/product/ProductInfo'
import { ProductStickySidebar } from '@/components/product/ProductStickySidebar'
import { ProductTabs } from '@/components/product/ProductTabs'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { BreadCrumb } from '@/components/ui/BreadCrumb'

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug)
  return {
    title: product.seo_title || product.name,
    description: product.seo_description,
    openGraph: { images: [product.og_image] },
  }
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <BreadCrumb items={[
          { label: 'Ana Sayfa', href: '/' },
          { label: product.category.name, href: `/${product.category.slug}` },
          { label: product.name },
        ]} />

        {/* Ana İçerik - 3 Kolon */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Görseller - 5 kolon */}
          <div className="lg:col-span-5">
            <ProductGallery images={product.images} videos={product.videos} />
          </div>

          {/* Ürün Bilgisi - 4 kolon */}
          <div className="lg:col-span-4">
            <ProductInfo product={product} />
          </div>

          {/* Sticky Satın Alma Alanı - 3 kolon */}
          <div className="lg:col-span-3">
            <div className="sticky top-4">
              <ProductStickySidebar product={product} />
            </div>
          </div>
        </div>

        {/* Alt Sekmeler */}
        <ProductTabs product={product} />

        {/* İlgili Ürünler */}
        <RelatedProducts productId={product.id} categoryId={product.category_id} />
      </div>
    </div>
  )
}
```

## 5.8 Satıcı Paneli Sayfa Yapısı

```
apps/seller/app/
├── (auth)/
│   ├── giris/page.tsx
│   └── kayit/
│       ├── page.tsx              # Adım 1: Temel Bilgiler
│       ├── firma/page.tsx        # Adım 2: Firma Bilgisi
│       └── paket/page.tsx        # Adım 3: Paket Seçimi
│
└── (panel)/
    ├── layout.tsx                # Sidebar + Topbar
    ├── dashboard/page.tsx        # Ana Dashboard
    │
    ├── urunler/
    │   ├── page.tsx              # Ürün Listesi
    │   ├── yeni/page.tsx         # Yeni Ürün
    │   ├── [id]/page.tsx         # Ürün Düzenle
    │   ├── toplu-yukleme/page.tsx
    │   └── import/
    │       ├── excel/page.tsx
    │       └── xml/page.tsx
    │
    ├── siparisler/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    │
    ├── kargo/
    │   ├── page.tsx
    │   └── gonderi-olustur/page.tsx
    │
    ├── finans/
    │   ├── page.tsx
    │   ├── para-cek/page.tsx
    │   └── faturalar/page.tsx
    │
    ├── kampanyalar/
    │   ├── page.tsx
    │   └── yeni/page.tsx
    │
    ├── kuponlar/
    │   ├── page.tsx
    │   └── yeni/page.tsx
    │
    ├── blog/
    │   ├── page.tsx
    │   └── yeni/page.tsx
    │
    ├── crm/
    │   ├── page.tsx              # CRM Dashboard
    │   ├── musteriler/page.tsx
    │   ├── segmentler/page.tsx
    │   ├── whatsapp/page.tsx
    │   ├── sms/page.tsx
    │   ├── email/page.tsx
    │   └── otomasyon/page.tsx
    │
    ├── reklamlar/
    │   ├── page.tsx
    │   └── yeni/page.tsx
    │
    ├── ai/
    │   ├── page.tsx              # AI Dashboard + Skor
    │   ├── seo/page.tsx
    │   └── fiyatlandirma/page.tsx
    │
    └── ayarlar/
        ├── page.tsx
        ├── magaza/page.tsx
        └── bildirimler/page.tsx
```

## 5.9 State Yönetimi

```typescript
// stores/cartStore.ts (Zustand)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CartItem {
  productId: number
  variantId?: number
  name: string
  image: string
  price: number
  quantity: number
  slug: string
}

interface CartStore {
  items: CartItem[]
  coupon: string | null
  addItem: (item: CartItem) => void
  removeItem: (productId: number, variantId?: number) => void
  updateQuantity: (productId: number, variantId: number | undefined, qty: number) => void
  clearCart: () => void
  setCoupon: (code: string | null) => void
  subtotal: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      
      addItem: (item) => set(state => {
        const existing = state.items.find(
          i => i.productId === item.productId && i.variantId === item.variantId
        )
        if (existing) {
          return {
            items: state.items.map(i =>
              i.productId === item.productId && i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          }
        }
        return { items: [...state.items, item] }
      }),
      
      removeItem: (productId, variantId) => set(state => ({
        items: state.items.filter(
          i => !(i.productId === productId && i.variantId === variantId)
        )
      })),
      
      updateQuantity: (productId, variantId, qty) => set(state => ({
        items: qty === 0
          ? state.items.filter(i => !(i.productId === productId && i.variantId === variantId))
          : state.items.map(i =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: qty }
                : i
            )
      })),
      
      clearCart: () => set({ items: [], coupon: null }),
      setCoupon: (code) => set({ coupon: code }),
      subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'mso-cart' }
  )
)
```

## 5.10 Dark/Light Mode Sistemi

```typescript
// providers/ThemeProvider.tsx

'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('mso-theme') as Theme || 'dark'
    setTheme(saved)
    applyTheme(saved)
  }, [])

  const applyTheme = (t: Theme) => {
    const isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('mso-theme', next)
    applyTheme(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```
