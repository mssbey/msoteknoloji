'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <div className="glass-card p-6 space-y-4">
        <h1 className="text-xl font-black text-[#23262b]">Sifremi Unuttum</h1>
        <p className="text-sm text-[#7c7f8a]">E-posta adresinizi girin, sifre sifirlama baglantisi gonderelim.</p>

        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-3">
            <input type="email" required placeholder="ornek@mail.com"
              className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2.5 text-sm text-[#23262b] placeholder:text-[#a3a5b0] focus:outline-none focus:border-[#7d77c4]" />
            <button className="w-full btn-primary py-2.5 rounded-xl text-sm">Baglanti Gonder</button>
          </form>
        ) : (
          <div className="rounded-xl bg-[#edebf7] border border-[#d6d3ee] p-3 text-sm text-[#373071]">
            E-posta adresinize sifre sifirlama baglantisi gonderildi.
          </div>
        )}

        <Link href="/giris" className="inline-flex text-sm text-[#373071] hover:text-[#2e2862]">Girise don</Link>
      </div>
    </main>
  )
}
