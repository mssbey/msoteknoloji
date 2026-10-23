'use client'

import { useState, useSyncExternalStore } from 'react'

// KvkkBanner ile aynı çerez
const COOKIE_KEY = 'mso_kvkk_consent'
type Consent = { necessary: true; analytics: boolean; marketing: boolean }
const noopSubscribe = () => () => {}

function readConsent(raw: string | null): Consent {
  try {
    const parsed = raw ? JSON.parse(raw) : null
    return { necessary: true, analytics: !!parsed?.analytics, marketing: !!parsed?.marketing }
  } catch {
    return { necessary: true, analytics: false, marketing: false }
  }
}

export default function CookiePreferences() {
  const stored = useSyncExternalStore(
    noopSubscribe,
    () => document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`))?.[1] ?? null,
    () => null,
  )
  const [draft, setDraft] = useState<Consent | null>(null)
  const [saved, setSaved] = useState(false)
  const consent = draft ?? readConsent(stored ? decodeURIComponent(stored) : null)

  const save = (next: Consent) => {
    const expires = new Date(Date.now() + 365 * 864e5).toUTCString()
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(next))}; expires=${expires}; path=/; SameSite=Lax`
    setDraft(next)
    setSaved(true)
  }
  const toggle = (key: 'analytics' | 'marketing') => {
    setSaved(false)
    setDraft({ ...consent, [key]: !consent[key] })
  }

  const row = 'flex items-center justify-between gap-4 p-3 rounded-xl bg-[#f4f3f9] border border-[#e6e4f0]'
  return (
    <section id="tercihler" className="glass-card p-6 space-y-3 text-sm text-[#474b57] scroll-mt-24">
      <h2 className="text-base font-bold text-[#23262b]">Çerez tercihlerini yönet</h2>
      <p>Zorunlu olmayan çerezler yalnızca onay vermeniz halinde çalışır. Tercihinizi istediğiniz zaman değiştirebilirsiniz.</p>
      <div className={row}><span>Zorunlu çerezler</span><span className="text-xs text-[#373071]">Her zaman açık</span></div>
      <label className={row}><span>Analitik çerezler</span><input type="checkbox" checked={consent.analytics} onChange={() => toggle('analytics')} /></label>
      <label className={row}><span>Pazarlama çerezleri</span><input type="checkbox" checked={consent.marketing} onChange={() => toggle('marketing')} /></label>
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="button" onClick={() => save({ necessary: true, analytics: false, marketing: false })} className="btn-ghost text-sm py-2 px-4 rounded-xl">Tümünü reddet</button>
        <button type="button" onClick={() => save(consent)} className="btn-ghost text-sm py-2 px-4 rounded-xl">Tercihleri kaydet</button>
        <button type="button" onClick={() => save({ necessary: true, analytics: true, marketing: true })} className="btn-primary text-sm py-2 px-4 rounded-xl">Tümünü kabul et</button>
      </div>
      {saved && <p role="status" className="text-xs text-[#2f7d4f]">Tercihleriniz kaydedildi.</p>}
    </section>
  )
}
