'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { ordersAPI } from '@/lib/api'
import { formatPrice } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useClientReady } from '@/lib/useClientReady'
import OrderLegalConsent from '@/components/legal/OrderLegalConsent'

const fields = [
  ['first_name', 'Ad', 'given-name'], ['last_name', 'Soyad', 'family-name'],
  ['phone', 'Telefon', 'tel'], ['city', 'İl', 'address-level1'], ['district', 'İlçe', 'address-level2'],
] as const

export default function CheckoutPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { items, subtotal, total, shippingCost, couponCode, couponDiscount, clearCart } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const ready = useClientReady()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [legalAccepted, setLegalAccepted] = useState(false)

  function orderPayload(form: FormData) {
    const address = Object.fromEntries([...fields.map(([key]) => [key, String(form.get(key) || '').trim()]), ['address', String(form.get('address') || '').trim()]])
    return {
      shipping_address: address, billing_address: address,
      payment_method: 'bank_transfer', coupon_code: couponCode, customer_note: form.get('customer_note'),
      items: items.map(item => ({ product_id: item.productId, variant_id: item.variantId, quantity: item.quantity })),
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    setError('')
    try {
      const response = await ordersAPI.create({ ...orderPayload(new FormData(event.currentTarget)), legal_accepted: legalAccepted })
      clearCart()
      await queryClient.invalidateQueries({ queryKey: ['my-orders'] })
      router.push(`/hesabim/siparislerim/${response.data.data.order_number}`)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      setError(Object.values(err.response?.data?.errors || {}).flat().join(' ') || err.response?.data?.message || 'Sipariş oluşturulamadı. Lütfen tekrar deneyin.')
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  if (!ready) return <main className="p-10 text-center">Yükleniyor…</main>
  if (!items.length) return <main className="mx-auto max-w-3xl p-10 text-center space-y-4"><h1 className="text-2xl font-bold">Sepetiniz boş</h1><Link href="/urunler" className="btn-primary inline-flex px-5 py-3 rounded-xl">Alışverişe devam et</Link></main>

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-[#23262b]">Siparişi tamamla</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="lg:col-span-2 glass-card p-5 space-y-4">
          {!isAuthenticated ? <div className="space-y-4"><h2 className="font-bold">Sipariş vermek için giriş yapın</h2><p>Sepetiniz giriş ve kayıt sırasında korunur.</p><div className="flex gap-4"><Link href="/giris?next=/odeme" className="btn-primary px-5 py-3 rounded-xl">Giriş yap</Link><Link href="/kayit?next=/odeme" className="btn-ghost px-5 py-3 rounded-xl">Hesap oluştur</Link></div></div> : <form ref={formRef} onSubmit={submit} className="space-y-4">
            <h2 className="font-bold">Teslimat ve fatura bilgileri</h2>
            <p className="text-sm text-[#585c68]">Faturanız teslimat adresinize düzenlenecektir.</p>
            <div className="grid sm:grid-cols-2 gap-3">{fields.map(([key, label, autoComplete]) => <label key={key} className="text-sm font-medium space-y-1"><span>{label}</span><input name={key} autoComplete={autoComplete} type={key === 'phone' ? 'tel' : 'text'} required maxLength={key === 'phone' ? 20 : 100} minLength={key === 'phone' ? 10 : 2} className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2" /></label>)}</div>
            <label className="block text-sm font-medium space-y-1"><span>Açık adres</span><textarea name="address" autoComplete="street-address" required minLength={10} maxLength={1000} rows={3} className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2" /></label>
            <label className="block text-sm font-medium space-y-1"><span>Sipariş notu (isteğe bağlı)</span><textarea name="customer_note" maxLength={1000} rows={2} className="w-full bg-[#f4f3f9] border border-[#e6e4f0] rounded-xl px-3 py-2" /></label>
            <div className="rounded-xl bg-[#edebf7] p-4 text-sm space-y-2"><h2 className="font-bold">Ödeme yöntemi: Havale / EFT</h2><p>Siparişiniz oluşturulduktan sonra banka bilgileri ve sipariş numaranız gösterilir. Havale açıklamasına sipariş numaranızı yazın. Ödeme kontrol edildikten sonra siparişiniz hazırlanır.</p></div>
            <OrderLegalConsent
              getPayload={() => orderPayload(new FormData(formRef.current ?? undefined))}
              accepted={legalAccepted}
              onAcceptedChange={setLegalAccepted}
            />
            {error && <p role="alert" className="text-red-700 bg-red-50 p-3 rounded-xl">{error}</p>}
            <button disabled={submitting || !legalAccepted} className="btn-primary text-sm py-3 px-5 rounded-xl disabled:opacity-50">{submitting ? 'Sipariş oluşturuluyor…' : 'Siparişi Tamamla'}</button>
          </form>}
        </section>
        <aside className="glass-card p-5 h-fit space-y-3">
          <h2 className="font-bold">Sipariş özeti</h2>
          {items.map(item => <div key={`${item.productId}-${item.variantId || 0}`} className="flex justify-between gap-3 text-sm"><span>{item.name}{item.variantLabel && ` (${item.variantLabel})`} × {item.quantity}</span><span className="whitespace-nowrap">{formatPrice((item.salePrice ?? item.price) * item.quantity)}</span></div>)}
          <div className="border-t pt-3 space-y-2 text-sm"><div className="flex justify-between"><span>Ara toplam</span><span>{formatPrice(subtotal())}</span></div><div className="flex justify-between"><span>Kargo</span><span>{shippingCost() === 0 ? 'Ücretsiz' : formatPrice(shippingCost())}</span></div>{couponCode && <div className="flex justify-between"><span>Kupon: {couponCode}</span><span>−{formatPrice(couponDiscount)}</span></div>}<div className="flex justify-between font-bold"><span>Toplam</span><span>{formatPrice(total())}</span></div></div>
          <p className="text-xs text-[#585c68]">Güncel fiyat ve stok bilgisi sipariş sırasında kontrol edilir.</p>
          <Link href="/urunler" className="inline-flex text-sm text-[#373071]">Alışverişe devam et</Link>
        </aside>
      </div>
    </main>
  )
}
