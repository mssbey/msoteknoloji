'use client'

import { useAuthStore } from '@/stores/authStore'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingBag, Wallet, Tag, Megaphone,
  FileText, Users, BarChart3, Zap, LogOut, Bell, Settings,
  Menu, X, Bot, Star, Truck, ChevronLeft, Paintbrush,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore as useAuth } from '@/stores/authStore'
import { isSeller } from '@/lib/roles'

const MENU = [
  { section: 'GENEL' },
  { icon: LayoutDashboard, label: 'Dashboard', href: '/satis-paneli' },
  { icon: BarChart3, label: 'Analizler', href: '/satis-paneli/analizler' },
  { section: 'MAĞAZA' },
  { icon: Package, label: 'Ürünlerim', href: '/satis-paneli/urunler' },
  { icon: ShoppingBag, label: 'Siparişler', href: '/satis-paneli/siparisler' },
  { icon: Truck, label: 'Kargo', href: '/satis-paneli/kargo' },
  { icon: Star, label: 'Yorumlar', href: '/satis-paneli/yorumlar' },
  { section: 'PAZARLAMA' },
  { icon: Tag, label: 'Kuponlar', href: '/satis-paneli/kuponlar' },
  { icon: Megaphone, label: 'Kampanyalar', href: '/satis-paneli/kampanyalar' },
  { icon: Users, label: 'CRM', href: '/satis-paneli/crm' },
  { section: 'DİĞER' },
  { icon: Wallet, label: 'Finans', href: '/satis-paneli/finans' },
  { icon: FileText, label: 'Blog', href: '/satis-paneli/blog' },
  { icon: Bot, label: 'AI Asistan', href: '/satis-paneli/ai' },
  { icon: Paintbrush, label: 'Tema Editörü', href: '/satis-paneli/tema-editoru' },
  { icon: Settings, label: 'Ayarlar', href: '/satis-paneli/ayarlar' },
]

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris?redirect=/satis-paneli')
      return
    }
    if (user && !isSeller(user.roles)) {
      router.push('/hesabim?error=no_seller_access')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated) return null
  if (user && !isSeller(user.roles)) return null

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 p-4 border-b border-[#e3e7dd] flex-shrink-0', collapsed && 'justify-center')}>
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6045] to-[#1c3c2c] shadow-lg shadow-[#244b37]/10 flex-shrink-0">
            <Zap className="h-4.5 w-4.5 text-[#202c28] fill-white" />
          </div>
          {!collapsed && (
            <div className="leading-none">
              <span className="text-sm font-black text-[#202c28]">MSO</span>
              <span className="text-sm font-black text-[#4d7138]"> Satıcı</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto hidden lg:flex h-6 w-6 items-center justify-center rounded-lg text-[#a8b09f] hover:text-[#5c6a56] hover:bg-[#f3f5ef] transition-all"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {MENU.map((item, i) => {
          if ('section' in item) {
            if (collapsed) return null
            return (
              <p key={i} className="text-[10px] font-bold tracking-widest text-[#a8b09f] px-3 pt-4 pb-1">
                {item.section}
              </p>
            )
          }
          const isActive = pathname === item.href || (item.href !== '/satis-paneli' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <motion.div
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-[#e9f0dd] text-[#4d7138] border border-[#c8d9ae] shadow-[0_0_12px_rgba(59,130,246,0.1)]'
                    : 'text-[#8c958c] hover:text-[#233226] hover:bg-[#f3f5ef]'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('h-4.5 w-4.5 flex-shrink-0', isActive && 'text-[#4d7138]')} />
                {!collapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User footer */}
      <div className={cn('p-3 border-t border-[#e3e7dd] flex-shrink-0', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6045] to-[#33613f] text-[#f4f8ec] font-bold text-sm cursor-pointer"
            title={user?.name}>
            {user?.name?.[0]}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6045] to-[#33613f] text-[#f4f8ec] font-bold text-sm flex-shrink-0">
              {user?.name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#202c28] truncate">{user?.name}</p>
              <p className="text-[10px] text-[#98a191] truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#a8b09f] hover:text-[#b0463c] hover:bg-[#fbeceb] transition-all"
              title="Çıkış"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#f8f9f6] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
        'hidden lg:flex flex-col flex-shrink-0 border-r border-[#e3e7dd] bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#1c2b20]/45 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-56 bg-white border-r border-[#e3e7dd] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-4 px-4 border-b border-[#e3e7dd] bg-white flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden flex h-8 w-8 items-center justify-center rounded-xl text-[#8c958c] hover:text-[#202c28] hover:bg-[#f3f5ef]"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>

          <div className="flex-1" />

          {/* Quick links */}
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank"
              className="hidden md:block text-xs text-[#98a191] hover:text-[#5c6a56] transition-colors">
              Mağazaya Git →
            </Link>
            <button className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f5ef] hover:bg-[#f0f2ec] text-[#6f7a68] hover:text-[#202c28] transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#b0463c] text-[9px] font-bold text-[#f4f8ec]">
                3
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}
