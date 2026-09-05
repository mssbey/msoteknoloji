'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <div className="glass-card p-6 space-y-4">
        <h1 className="text-xl font-black text-white">Sifremi Unuttum</h1>
        <p className="text-sm text-white/50">E-posta adresinizi girin, sifre sifirlama baglantisi gonderelim.</p>

        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-3">
            <input type="email" required placeholder="ornek@mail.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50" />
            <button className="w-full btn-primary py-2.5 rounded-xl text-sm">Baglanti Gonder</button>
          </form>
        ) : (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
            E-posta adresinize sifre sifirlama baglantisi gonderildi.
          </div>
        )}

        <Link href="/giris" className="inline-flex text-sm text-blue-400 hover:text-blue-300">Girise don</Link>
      </div>
    </main>
  )
}
