'use client'

import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { ordersAPI } from '@/lib/api'

type Doc = { slug: string; title: string; version: string; html: string }

const LINKS = [
  { slug: 'on-bilgilendirme-formu', label: 'Ön Bilgilendirme Formu' },
  { slug: 'mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
]

type Props = {
  /** Önizleme için güncel sepet ve adres bilgileri */
  getPayload: () => Record<string, unknown>
  accepted: boolean
  onAcceptedChange: (value: boolean) => void
}

/** Ödeme öncesi siparişe özel sözleşmeleri gösterir ve onay alır. */
export default function OrderLegalConsent({ getPayload, accepted, onAcceptedChange }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [docs, setDocs] = useState<Doc[]>([])
  const [active, setActive] = useState(LINKS[0].slug)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function open(slug: string) {
    setActive(slug)
    setError('')
    setLoading(true)
    dialogRef.current?.showModal()
    try {
      const response = await ordersAPI.legalPreview(getPayload())
      setDocs(response.data.data)
    } catch {
      setError('Sözleşme metni yüklenemedi. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const doc = docs.find(d => d.slug === active)

  return (
    <>
      <label className="flex items-start gap-3 rounded-xl border border-[#e6e4f0] bg-[#f6f5fb] p-4 text-sm text-[#474b57] leading-relaxed">
        <input type="checkbox" name="legal_accepted" required checked={accepted} onChange={e => onAcceptedChange(e.target.checked)}
          className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[#373071]" />
        <span>
          {LINKS.map((link, i) => (
            <span key={link.slug}>
              {i > 0 && ' ve '}
              <button type="button" onClick={() => open(link.slug)} className="font-semibold text-[#373071] underline underline-offset-2">{link.label}</button>
            </span>
          ))}
          ’ni okudum, onaylıyorum. Siparişi tamamlamanın ödeme yükümlülüğü doğurduğunu biliyorum.
        </span>
      </label>

      <dialog ref={dialogRef} aria-labelledby="legal-dialog-title"
        className="m-auto w-[min(860px,calc(100vw-32px))] max-h-[85vh] rounded-2xl p-0 backdrop:bg-black/40">
        <div className="flex flex-col max-h-[85vh]">
          <div className="flex items-center justify-between gap-3 border-b border-[#eeedf5] px-5 py-3">
            <div role="tablist" className="flex gap-1 overflow-x-auto">
              {LINKS.map(link => (
                <button key={link.slug} type="button" role="tab" aria-selected={active === link.slug} onClick={() => setActive(link.slug)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${active === link.slug ? 'bg-[#edebf7] text-[#373071]' : 'text-[#7c7f8a]'}`}>
                  {link.label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Kapat" className="rounded-lg p-1.5 text-[#7c7f8a] hover:bg-[#f4f3f9]"><X className="h-5 w-5" /></button>
          </div>
          <h2 id="legal-dialog-title" className="sr-only">{doc?.title ?? 'Sözleşme'}</h2>
          <div className="overflow-y-auto px-5 py-4">
            {loading && <p className="text-sm text-[#8e909b]">Yükleniyor…</p>}
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            {/* Metin backend'de üretilir ve müşteri verileri orada kaçışlanır. */}
            {!loading && doc && <div className="legal-preview" dangerouslySetInnerHTML={{ __html: doc.html }} />}
          </div>
          <div className="flex justify-end gap-2 border-t border-[#eeedf5] px-5 py-3">
            <button type="button" onClick={() => dialogRef.current?.close()} className="btn-ghost text-sm py-2 px-4 rounded-xl">Kapat</button>
            <button type="button" onClick={() => { onAcceptedChange(true); dialogRef.current?.close() }} className="btn-primary text-sm py-2 px-4 rounded-xl">Okudum, onaylıyorum</button>
          </div>
        </div>
      </dialog>
    </>
  )
}
