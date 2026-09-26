'use client'

import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Package, Heart, MapPin, Settings, CreditCard, Bell, LogOut, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

const NAV = [
  { icon: User, label: 'Profilim', href: '/hesabim' },
  { icon: Package, label: 'Siparişlerim', href: '/hesabim/siparislerim' },
  { icon: Heart, label: 'Favorilerim', href: '/hesabim/favoriler' },
  { icon: MapPin, label: 'Adreslerim', href: '/hesabim/adreslerim' },
  { icon: Star, label: 'Puanlarım', href: '/hesabim/puanlarim' },
  { icon: Bell, label: 'Bildirimler', href: '/hesabim/bildirimler' },
  { icon: Settings, label: 'Güvenlik', href: '/hesabim/guvenlik' },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) router.push('/giris')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-[#f6f5fb]">
      <div className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-3">
            {/* User Card */}
            <div className="glass-card p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#373071] to-[#2e2862] text-[#ffffff] font-black text-lg shadow-lg shadow-[#373071]/10">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#23262b]">{user?.name}</p>
                  <p className="text-xs text-[#8e909b]">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="glass-card overflow-hidden">
              {NAV.map(({ icon: Icon, label, href }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm transition-all border-l-2',
                      pathname === href
                        ? 'bg-[#edebf7] text-[#373071] border-l-blue-500'
                        : 'text-[#646773] hover:text-[#23262b] hover:bg-[#f4f3f9] border-l-transparent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </motion.div>
                </Link>
              ))}
              <button
                onClick={logout}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#b0463c] hover:bg-[#fceeed] transition-all border-l-2 border-l-transparent hover:border-l-red-500"
              >
                <LogOut className="h-4 w-4" />
                Çıkış Yap
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  )
}
