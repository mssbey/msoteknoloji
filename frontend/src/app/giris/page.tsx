'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { AuthError, AuthField, AuthShell } from '@/components/auth/AuthShell'

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
      toast.success('Hoş geldiniz!')
      router.push('/')
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err.response?.data?.message || 'E-posta veya şifre hatalı')
    }
  }

  return (
    <AuthShell
      title="Tekrar hoş geldin"
      subtitle="Siparişlerine ve favorilerine ulaşmak için giriş yap."
      footer={<>Hesabın yok mu? <Link href="/kayit">Hemen üye ol</Link></>}
    >
      <AuthError message={error} />
      <form onSubmit={handleSubmit(onSubmit)} className="auth-form" noValidate>
        <AuthField label="E-posta" icon={Mail} type="email" autoComplete="email" placeholder="ornek@email.com" error={errors.email?.message} {...register('email')} />
        <AuthField
          label="Şifre"
          icon={Lock}
          type={showPass ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Şifreniz"
          error={errors.password?.message}
          aside={<Link href="/sifremi-unuttum" className="auth-link-small">Şifremi unuttum</Link>}
          trailing={<button type="button" className="auth-eye" onClick={() => setShowPass(!showPass)} aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}>{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
          {...register('password')}
        />
        <button type="submit" disabled={isLoading} className="auth-submit">
          {isLoading ? <><span className="auth-spinner" aria-hidden /> Giriş yapılıyor…</> : <>Giriş yap <ArrowRight size={18} /></>}
        </button>
      </form>
    </AuthShell>
  )
}
