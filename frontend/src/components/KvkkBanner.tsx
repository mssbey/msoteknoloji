'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const COOKIE_KEY = 'mso_kvkk_consent'
const DAYS = 365

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

type ConsentState = { necessary: true; analytics: boolean; marketing: boolean }

export function KvkkBanner() {
  const [show, setShow] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false
    return !getCookie(COOKIE_KEY)
  })
  const [showDetail, setShowDetail] = useState(false)
  const [consent, setConsent] = useState<ConsentState>({ necessary: true, analytics: true, marketing: true })

  const save = (c: ConsentState) => {
    setCookie(COOKIE_KEY, JSON.stringify(c), DAYS)
    setShow(false)
  }

  const acceptAll = () => save({ necessary: true, analytics: true, marketing: true })
  const rejectOptional = () => save({ necessary: true, analytics: false, marketing: false })
  const saveCustom = () => save(consent)

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="fixed bottom-0 inset-x-0 z-[80] px-4 pb-4 sm:px-6"
        >
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-2xl p-5">
            {!showDetail ? (
              /* Basit görünüm */
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 leading-relaxed">
                    <span className="font-semibold text-white">Çerez Politikası</span>{' '}
                    — Sitemizi geliştirmek ve kişiselleştirilmiş içerik sunmak için çerezler kullanıyoruz.{' '}
                    <button
                      onClick={() => setShowDetail(true)}
                      className="text-blue-400 hover:underline text-sm"
                    >
                      Ayrıntıları görüntüle
                    </button>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <button
                    onClick={rejectOptional}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors"
                  >
                    Yalnızca Zorunlu
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            ) : (
              /* Detay görünüm */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-white">Çerez Tercihleri</h3>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-white/40 hover:text-white text-sm"
                  >
                    ← Geri
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  {/* Zorunlu */}
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-white">Zorunlu Çerezler</p>
                      <p className="text-xs text-white/40 mt-0.5">Sitenin çalışması için gereklidir, devre dışı bırakılamaz.</p>
                    </div>
                    <div className="h-5 w-10 rounded-full bg-blue-600 flex-shrink-0" />
                  </div>

                  {/* Analitik */}
                  <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/8 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">Analitik Çerezler</p>
                      <p className="text-xs text-white/40 mt-0.5">Ziyaret istatistiklerini toplar, siteyi geliştirmemize yardımcı olur.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={e => setConsent(c => ({ ...c, analytics: e.target.checked }))}
                      className="h-5 w-5 flex-shrink-0 accent-blue-500"
                    />
                  </label>

                  {/* Pazarlama */}
                  <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/8 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-white">Pazarlama Çerezleri</p>
                      <p className="text-xs text-white/40 mt-0.5">Kişiselleştirilmiş reklamlar ve kampanya takibi için kullanılır.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={e => setConsent(c => ({ ...c, marketing: e.target.checked }))}
                      className="h-5 w-5 flex-shrink-0 accent-blue-500"
                    />
                  </label>
                </div>

                <p className="text-xs text-white/30 mb-4">
                  Daha fazla bilgi için{' '}
                  <Link href="/kvkk" className="text-blue-400 hover:underline">KVKK Aydınlatma Metni</Link> ve{' '}
                  <Link href="/gizlilik" className="text-blue-400 hover:underline">Gizlilik Politikası</Link>mızı inceleyin.
                </p>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={rejectOptional}
                    className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/60 hover:bg-white/5 transition-colors"
                  >
                    Yalnızca Zorunlu
                  </button>
                  <button
                    onClick={saveCustom}
                    className="rounded-xl border border-blue-500/50 px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors"
                  >
                    Seçimi Kaydet
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
