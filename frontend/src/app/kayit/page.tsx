'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Zap, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const schema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
  password_confirmation: z.string(),
  kvkk: z.boolean().refine(val => val === true, 'KVKK metnini onaylamanız gerekiyor'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Şifreler eşleşmiyor',
  path: ['password_confirmation'],
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })
      toast.success('Hesabınız oluşturuldu! Hoşgeldiniz 🎉')
      router.push('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const validationErrors = err.response?.data?.errors
      if (validationErrors) {
        const firstError = Object.values(validationErrors)[0]?.[0]
        setError(firstError || 'Kayıt sırasında hata oluştu')
      } else {
        setError(err.response?.data?.message || 'Kayıt sırasında hata oluştu')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-[#f8f9f6]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-[#f2eaf0] blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-[#eef3e2] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-full max-w-md glass-card p-8"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#2f6045] to-[#1c3c2c] shadow-lg shadow-[#244b37]/15">
              <Zap className="h-6 w-6 text-[#202c28] fill-white" />
            </div>
            <span className="text-xl font-black text-[#202c28]">MSO<span className="text-[#4d7138]"> Teknoloji</span></span>
          </Link>
          <h1 className="text-2xl font-black text-[#202c28]">Hesap Oluşturun</h1>
          <p className="text-sm text-[#98a191] mt-1">Ücretsiz üye olun, avantajlardan yararlanın</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5 rounded-xl bg-[#fbeceb] border border-[#eec9c5] px-4 py-3 mb-5"
          >
            <AlertCircle className="h-4 w-4 text-[#b0463c] flex-shrink-0" />
            <p className="text-sm text-[#b0463c]">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-[#8c958c] mb-1.5 block">AD SOYAD</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a8b09f]" />
              <input
                {...register('name')}
                type="text"
                placeholder="Adınız Soyadınız"
                className={cn('input-glass pl-10', errors.name && 'border-[#d98e86]')}
              />
            </div>
            {errors.name && <p className="text-xs text-[#b0463c] mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold text-[#8c958c] mb-1.5 block">E-POSTA</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a8b09f]" />
              <input
                {...register('email')}
                type="email"
                placeholder="ornek@email.com"
                className={cn('input-glass pl-10', errors.email && 'border-[#d98e86]')}
              />
            </div>
            {errors.email && <p className="text-xs text-[#b0463c] mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-[#8c958c] mb-1.5 block">ŞİFRE</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a8b09f]" />
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                placeholder="En az 8 karakter"
                className={cn('input-glass pl-10 pr-10', errors.password && 'border-[#d98e86]')}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a8b09f] hover:text-[#6f7a68] transition-colors">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-[#b0463c] mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm */}
          <div>
            <label className="text-xs font-bold text-[#8c958c] mb-1.5 block">ŞİFRE TEKRAR</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a8b09f]" />
              <input
                {...register('password_confirmation')}
                type={showPass ? 'text' : 'password'}
                placeholder="Şifrenizi tekrar girin"
                className={cn('input-glass pl-10', errors.password_confirmation && 'border-[#d98e86]')}
              />
            </div>
            {errors.password_confirmation && <p className="text-xs text-[#b0463c] mt-1">{errors.password_confirmation.message}</p>}
          </div>

          {/* KVKK */}
          <label className={cn(
            'flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all',
            errors.kvkk ? 'border-[#e5aca6] bg-[#fdf3f2]' : 'border-[#e3e7dd] bg-[#f8f9f6] hover:bg-[#f6f7f3]'
          )}>
            <input type="checkbox" {...register('kvkk')} className="mt-0.5 h-4 w-4 accent-blue-500" />
            <span className="text-xs text-[#8c958c] leading-relaxed">
              <Link href="/kvkk" className="text-[#4d7138] hover:underline">KVKK Aydınlatma Metni</Link>ni ve{' '}
              <Link href="/kullanim-kosullari" className="text-[#4d7138] hover:underline">Kullanım Koşulları</Link>nı
              okudum, kabul ediyorum. <span className="text-[#b0463c]">*</span>
            </span>
          </label>
          {errors.kvkk && <p className="text-xs text-[#b0463c]">{errors.kvkk.message}</p>}

          <motion.button
            type="submit"
            disabled={isLoading}
            whileTap={{ scale: 0.97 }}
            className="btn-primary w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <><svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Kaydediliyor...</>
            ) : (
              <><UserPlus className="h-4 w-4" /> Hesap Oluştur</>
            )}
          </motion.button>
        </form>

        <p className="text-center text-sm text-[#98a191] mt-5">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-[#4d7138] hover:text-[#33613f] font-semibold transition-colors">
            Giriş Yapın
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
