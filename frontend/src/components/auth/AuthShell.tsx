'use client'
import type { ComponentProps, ReactNode } from 'react'
import Link from 'next/link'
import { AlertCircle, Heart, Package, ShieldCheck, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const perks = [
  { icon: Heart, title: 'Favorilerin her cihazda', text: 'Beğendiğin ürünleri kaydet, sonra kaldığın yerden devam et.' },
  { icon: Package, title: 'Siparişlerin tek yerde', text: 'Sipariş durumunu ve geçmişini hesabından takip et.' },
  { icon: ShieldCheck, title: 'Hızlı ve güvenli ödeme', text: 'Adres bilgilerin kayıtlı, ödeme birkaç adımda tamam.' },
]

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return <div className="auth-page"><div className="auth-card">
    <aside className="auth-aside">
      <Link href="/" aria-label="MSO Teknoloji ana sayfa" className="auth-aside-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-light.png" alt="MSO Teknoloji" />
      </Link>
      <div className="auth-aside-copy">
        <h2>Keşfet.<br />Hazır ol.</h2>
        <ul>{perks.map(({ icon: Icon, title: t, text }) => <li key={t}><span><Icon size={18} strokeWidth={1.9} /></span><div><strong>{t}</strong><small>{text}</small></div></li>)}</ul>
      </div>
    </aside>
    <main className="auth-main">
      <header className="auth-heading"><h1>{title}</h1><p>{subtitle}</p></header>
      {children}
      <p className="auth-switch">{footer}</p>
    </main>
  </div></div>
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null
  return <div className="auth-error" role="alert"><AlertCircle size={17} /><span>{message}</span></div>
}

type AuthFieldProps = ComponentProps<'input'> & { label: ReactNode; icon: LucideIcon; error?: string; trailing?: ReactNode; aside?: ReactNode }
export function AuthField({ label, icon: Icon, error, trailing, aside, id, className, ...input }: AuthFieldProps) {
  const fieldId = id ?? input.name
  return <div className="auth-field">
    <div className="auth-label-row"><label htmlFor={fieldId}>{label}</label>{aside}</div>
    <div className={cn('auth-input', error && 'is-invalid', className)}>
      <Icon size={18} aria-hidden />
      <input id={fieldId} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-error` : undefined} {...input} />
      {trailing}
    </div>
    {error && <p className="auth-field-error" id={`${fieldId}-error`}>{error}</p>}
  </div>
}
