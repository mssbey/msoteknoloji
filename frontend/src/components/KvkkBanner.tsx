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
          <div className="mx-auto max-w-4xl rounded-2xl border border-[#e3e7dd] bg-white/95 backdrop-blur-xl shadow-2xl p-5">
            {!showDetail ? (
              /* Basit görünüm */
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#3d4a3a] leading-relaxed">
                    <span className="font-semibold text-[#202c28]">Çerez Politikası</span>{' '}
                    — Sitemizi geliştirmek ve kişiselleştirilmiş içerik sunmak için çerezler kullanıyoruz.{' '}
                    <button
                      onClick={() => setShowDetail(true)}
                      className="text-[#4d7138] hover:underline text-sm"
                    >
                      Ayrıntıları görüntüle
                    </button>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  <button
                    onClick={rejectOptional}
                    className="rounded-xl border border-[#d4ddc6] px-4 py-2 text-sm text-[#6f7a68] hover:bg-[#f6f7f3] transition-colors"
                  >
                    Yalnızca Zorunlu
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-xl bg-[#244b37] px-5 py-2 text-sm font-semibold text-[#f4f8ec] hover:bg-[#2f6045] transition-colors"
                  >
                    Tümünü Kabul Et
                  </button>
                </div>
              </div>
            ) : (
              /* Detay görünüm */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[#202c28]">Çerez Tercihleri</h3>
                  <button
                    onClick={() => setShowDetail(false)}
                    className="text-[#98a191] hover:text-[#202c28] text-sm"
                  >
                    ← Geri
                  </button>
                </div>

                <div className="space-y-3 mb-5">
                  {/* Zorunlu */}
                  <div className="flex items-center justify-between rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] p-3">
                    <div>
                      <p className="text-sm font-medium text-[#202c28]">Zorunlu Çerezler</p>
                      <p className="text-xs text-[#98a191] mt-0.5">Sitenin çalışması için gereklidir, devre dışı bırakılamaz.</p>
                    </div>
                    <div className="h-5 w-10 rounded-full bg-[#244b37] flex-shrink-0" />
                  </div>

                  {/* Analitik */}
                  <label className="flex items-center justify-between rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] p-3 cursor-pointer hover:bg-[#f3f5ef] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#202c28]">Analitik Çerezler</p>
                      <p className="text-xs text-[#98a191] mt-0.5">Ziyaret istatistiklerini toplar, siteyi geliştirmemize yardımcı olur.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={e => setConsent(c => ({ ...c, analytics: e.target.checked }))}
                      className="h-5 w-5 flex-shrink-0 accent-blue-500"
                    />
                  </label>

                  {/* Pazarlama */}
                  <label className="flex items-center justify-between rounded-xl border border-[#e3e7dd] bg-[#f6f7f3] p-3 cursor-pointer hover:bg-[#f3f5ef] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[#202c28]">Pazarlama Çerezleri</p>
                      <p className="text-xs text-[#98a191] mt-0.5">Kişiselleştirilmiş reklamlar ve kampanya takibi için kullanılır.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={e => setConsent(c => ({ ...c, marketing: e.target.checked }))}
                      className="h-5 w-5 flex-shrink-0 accent-blue-500"
                    />
                  </label>
                </div>

                <p className="text-xs text-[#a8b09f] mb-4">
                  Daha fazla bilgi için{' '}
                  <Link href="/kvkk" className="text-[#4d7138] hover:underline">KVKK Aydınlatma Metni</Link> ve{' '}
                  <Link href="/gizlilik" className="text-[#4d7138] hover:underline">Gizlilik Politikası</Link>mızı inceleyin.
                </p>

                <div className="flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={rejectOptional}
                    className="rounded-xl border border-[#d4ddc6] px-4 py-2 text-sm text-[#6f7a68] hover:bg-[#f6f7f3] transition-colors"
                  >
                    Yalnızca Zorunlu
                  </button>
                  <button
                    onClick={saveCustom}
                    className="rounded-xl border border-[#8fab6a] px-4 py-2 text-sm text-[#4d7138] hover:bg-[#eef3e2] transition-colors"
                  >
                    Seçimi Kaydet
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-xl bg-[#244b37] px-5 py-2 text-sm font-semibold text-[#f4f8ec] hover:bg-[#2f6045] transition-colors"
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
