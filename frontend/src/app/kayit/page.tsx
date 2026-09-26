'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { AuthError, AuthField, AuthShell } from '@/components/auth/AuthShell'

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
      toast.success('Hesabınız oluşturuldu, hoş geldiniz!')
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

  const eye = <button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>

  return (
    <AuthShell
      title="Hesap oluştur"
      subtitle="Ücretsiz üye ol, siparişlerini ve favorilerini tek yerden yönet."
      footer={<>Zaten hesabın var mı? <Link href="/giris">Giriş yap</Link></>}
    >
      <AuthError message={error} />
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <AuthField label="Ad soyad" icon={User} type="text" autoComplete="name" placeholder="Adınız Soyadınız" error={errors.name?.message} {...register('name')} />
        <AuthField label="E-posta" icon={Mail} type="email" autoComplete="email" placeholder="ornek@email.com" error={errors.email?.message} {...register('email')} />
        <div className="auth-row">
          <AuthField label="Şifre" icon={Lock} type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="En az 8 karakter" error={errors.password?.message} trailing={eye} {...register('password')} />
          <AuthField label="Şifre tekrar" icon={Lock} type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="Tekrar girin" error={errors.password_confirmation?.message} {...register('password_confirmation')} />
        </div>
        <label className={cn('auth-consent', errors.kvkk && 'is-invalid')}>
          <input type="checkbox" {...register('kvkk')} />
          <span><Link href="/kvkk">KVKK Aydınlatma Metni</Link>’ni ve <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>’nı okudum, kabul ediyorum.</span>
        </label>
        {errors.kvkk && <p className="auth-field-error">{errors.kvkk.message}</p>}
        <button type="submit" disabled={isLoading} className="auth-submit">
          {isLoading ? <><span className="auth-spinner" aria-hidden /> Kaydediliyor…</> : <>Hesap oluştur <ArrowRight size={18} /></>}
        </button>
      </form>
    </AuthShell>
  )
}
