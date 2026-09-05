'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <div className="glass-card p-6 space-y-4">
        <h1 className="text-xl font-black text-[#202c28]">Sifremi Unuttum</h1>
        <p className="text-sm text-[#8c958c]">E-posta adresinizi girin, sifre sifirlama baglantisi gonderelim.</p>

        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-3">
            <input type="email" required placeholder="ornek@mail.com"
              className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2.5 text-sm text-[#202c28] placeholder:text-[#a8b09f] focus:outline-none focus:border-[#8fab6a]" />
            <button className="w-full btn-primary py-2.5 rounded-xl text-sm">Baglanti Gonder</button>
          </form>
        ) : (
          <div className="rounded-xl bg-[#eef3e2] border border-[#cfe0b8] p-3 text-sm text-[#4d7138]">
            E-posta adresinize sifre sifirlama baglantisi gonderildi.
          </div>
        )}

        <Link href="/giris" className="inline-flex text-sm text-[#4d7138] hover:text-[#33613f]">Girise don</Link>
      </div>
    </main>
  )
}
