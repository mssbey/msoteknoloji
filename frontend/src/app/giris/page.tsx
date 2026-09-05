'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await login(data.email, data.password)
      toast.success('Hoşgeldiniz!')
      router.push('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'E-posta veya şifre hatalı')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#050507]">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md glass-card p-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30">
              <Zap className="h-6 w-6 text-white fill-white" />
            </div>
            <span className="text-xl font-black text-white">MSO<span className="text-blue-400"> Teknoloji</span></span>
          </Link>
          <h1 className="text-2xl font-black text-white">Hesabınıza Giriş</h1>
          <p className="text-sm text-white/40 mt-1">Alışverişe devam etmek için giriş yapın</p>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 mb-5"
          >
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-white/50 mb-1.5 block">E-POSTA</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                {...register('email')}
                type="email"
                placeholder="ornek@email.com"
                className={cn('input-glass pl-10', errors.email && 'border-red-500/60 focus:border-red-500/80')}
              />
            </div>
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white/50">ŞİFRE</label>
              <Link href="/sifremi-unuttum" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Şifremi unuttum
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                className={cn('input-glass pl-10 pr-10', errors.password && 'border-red-500/60')}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Giriş yapılıyor...
              </span>
            ) : (
              <><LogIn className="h-4 w-4" /> Giriş Yap</>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
            Üye Ol
          </Link>
        </p>

        {/* Demo accounts */}
        <div className="mt-6 p-4 rounded-2xl bg-white/3 border border-white/6">
          <p className="text-xs font-bold text-white/40 mb-3">DEMO HESAPLARI</p>
          <div className="space-y-1.5">
            {[
              { label: 'Admin', email: 'admin@msocommerce.com', pass: 'Admin@12345', color: 'text-purple-400' },
              { label: 'Satıcı', email: 'seller@msocommerce.com', pass: 'Seller@12345', color: 'text-blue-400' },
              { label: 'Müşteri', email: 'musteri@msocommerce.com', pass: 'Musteri@12345', color: 'text-green-400' },
            ].map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  const emailEl = document.querySelector('input[type="email"]') as HTMLInputElement
                  const passEl = document.querySelector('input[type="password"], input[name="password"]') as HTMLInputElement
                  if (emailEl) emailEl.value = acc.email
                  if (passEl) passEl.value = acc.pass
                  login(acc.email, acc.pass).then(() => { toast.success('Hoşgeldiniz!'); router.push('/') })
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/6 transition-colors"
              >
                <span className={`text-xs font-bold ${acc.color}`}>{acc.label}</span>
                <span className="text-xs text-white/30">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
