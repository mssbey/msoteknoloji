'use client'

import Link from 'next/link'
import { useCartStore } from '@/stores/cartStore'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const { items, subtotal } = useCartStore()
  const total = subtotal()

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-[#202c28]">Odeme</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 glass-card p-5 space-y-3">
          <h2 className="font-bold text-[#202c28]">Teslimat ve Fatura Bilgileri</h2>
          <input placeholder="Ad Soyad" className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f]" />
          <input placeholder="Telefon" className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f]" />
          <textarea rows={3} placeholder="Adres" className="w-full bg-[#f6f7f3] border border-[#e3e7dd] rounded-xl px-3 py-2 text-sm text-[#202c28] placeholder:text-[#a8b09f]" />
          <button className="btn-primary text-sm py-2.5 px-5 rounded-xl">Siparisi Tamamla</button>
        </section>

        <aside className="glass-card p-5 h-fit">
          <h2 className="font-bold text-[#202c28] mb-3">Siparis Ozeti</h2>
          <div className="space-y-2 text-sm">
            {items.length === 0 ? <p className="text-[#8c958c]">Sepetiniz bos.</p> : items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 0}`} className="flex justify-between text-[#5c6a56]">
                <span>{item.name} x{item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#e3e7dd] flex justify-between font-bold text-[#202c28]">
              <span>Toplam</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link href="/urunler" className="inline-flex mt-3 text-xs text-[#4d7138] hover:text-[#33613f]">Alisverise devam et</Link>
        </aside>
      </div>
    </main>
  )
}
