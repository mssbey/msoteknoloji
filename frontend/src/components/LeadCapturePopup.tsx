'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { resolveApiBaseUrl } from '@/lib/apiBase'

const COOKIE_KEY = 'mso_lead_captured'
const DISCOUNT_CODE_PREFIX = 'MSO15'

function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = DISCOUNT_CODE_PREFIX + '-'
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function LeadCapturePopup() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [coupon, setCoupon] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; phone?: string; kvkk?: string }>({})
  const [form, setForm] = useState({
    name: '',
    phone: '',
    kvkk: false,
    commercial: false,
  })

  useEffect(() => {
    // 3 saniye sonra göster, daha önce kapatmamışsa
    const timer = setTimeout(() => {
      if (!getCookie(COOKIE_KEY)) setShow(true)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const validate = () => {
    const errs: typeof errors = {}
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Adınızı giriniz'
    const phoneClean = form.phone.replace(/\D/g, '')
    if (phoneClean.length < 10) errs.phone = 'Geçerli bir telefon numarası giriniz'
    if (!form.kvkk) errs.kvkk = 'KVKK metnini onaylamanız gerekmektedir'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const code = generateCouponCode()

      // Backend'e lead gönder
      await fetch(`${resolveApiBaseUrl()}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone.replace(/\D/g, ''),
          kvkk_consent: form.kvkk,
          commercial_consent: form.commercial,
          coupon_code: code,
          source: 'popup',
        }),
      }).catch(() => {/* backend henüz olmasa da devam et */})

      setCoupon(code)
      setCookie(COOKIE_KEY, '1', 30)
      setStep('success')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setCookie(COOKIE_KEY, '1', 30)
    setShow(false)
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    if (digits.length <= 9) return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9)}`
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 top-1/2 z-[70] mx-auto max-w-md -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900 shadow-2xl"
          >
            {/* Gradient üst şerit */}
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-400" />

            {/* Kapat butonu */}
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
              aria-label="Kapat"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="p-6 pt-5">
              <AnimatePresence mode="wait">
                {step === 'form' ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Başlık */}
                    <div className="mb-5 text-center">
                      <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl shadow-lg shadow-blue-500/30">
                        🎁
                      </div>
                      <h2 className="text-xl font-black text-white">
                        Hoş Geldiniz!
                        <span className="block text-2xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          %15 İndirim Kazanın
                        </span>
                      </h2>
                      <p className="mt-2 text-sm text-white/50">
                        Bilgilerinizi bırakın, indirim kodunuzu hemen alın
                      </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-3">
                      {/* Ad Soyad */}
                      <div>
                        <input
                          type="text"
                          placeholder="Ad Soyad *"
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-blue-500/70 focus:bg-white/8 ${
                            errors.name ? 'border-red-500/70' : 'border-white/10'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                        )}
                      </div>

                      {/* Telefon */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex-shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/60">
                            🇹🇷 +90
                          </span>
                          <input
                            type="tel"
                            placeholder="05XX XXX XX XX *"
                            value={form.phone}
                            onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                            className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all focus:border-blue-500/70 ${
                              errors.phone ? 'border-red-500/70' : 'border-white/10'
                            }`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                        )}
                      </div>

                      {/* KVKK */}
                      <div className="space-y-2">
                        <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                          errors.kvkk ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-white/5 hover:bg-white/8'
                        }`}>
                          <input
                            type="checkbox"
                            checked={form.kvkk}
                            onChange={e => setForm(f => ({ ...f, kvkk: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-500"
                          />
                          <span className="text-xs text-white/60 leading-relaxed">
                            <a href="#" className="text-blue-400 hover:underline">KVKK Aydınlatma Metni</a>ni okudum,
                            kişisel verilerimin işlenmesini kabul ediyorum. <span className="text-red-400">*</span>
                          </span>
                        </label>
                        {errors.kvkk && (
                          <p className="text-xs text-red-400 px-1">{errors.kvkk}</p>
                        )}

                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/8 transition-all">
                          <input
                            type="checkbox"
                            checked={form.commercial}
                            onChange={e => setForm(f => ({ ...f, commercial: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-500"
                          />
                          <span className="text-xs text-white/60 leading-relaxed">
                            Kampanya ve fırsatlardan SMS/WhatsApp ile haberdar olmak istiyorum (isteğe bağlı)
                          </span>
                        </label>
                      </div>

                      {/* Gönder */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-3.5 font-bold text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow disabled:opacity-60"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                              <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Yükleniyor...
                          </span>
                        ) : (
                          '🎁 %15 İndirim Kodumu Al'
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-4xl"
                    >
                      🎉
                    </motion.div>
                    <h2 className="text-xl font-black text-white mb-1">Tebrikler!</h2>
                    <p className="text-white/50 text-sm mb-5">
                      İşte %15 indirim kodunuz:
                    </p>

                    {/* Kupon kodu */}
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={handleCopy}
                      className="group relative mx-auto mb-4 max-w-xs cursor-pointer rounded-2xl border-2 border-dashed border-blue-500/50 bg-blue-500/10 p-4 hover:border-blue-400 hover:bg-blue-500/15 transition-all"
                    >
                      <p className="text-2xl font-black tracking-widest text-blue-400">
                        {coupon}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {copied ? '✅ Kopyalandı!' : '👆 Kopyalamak için tıklayın'}
                      </p>
                    </motion.div>

                    <p className="text-xs text-white/40 mb-5">
                      Kod 30 gün geçerlidir. İlk alışverişinizde sepette kullanabilirsiniz.
                    </p>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setShow(false)}
                      className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 py-3 font-bold text-white"
                    >
                      Alışverişe Başla →
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
