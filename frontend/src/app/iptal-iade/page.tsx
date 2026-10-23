import type { Metadata } from 'next'
import Link from 'next/link'
import LegalDocument, { type LegalDoc } from '@/components/legal/LegalDocument'
import doc from '@/content/legal/iptal-iade-kosullari.json'

export const metadata: Metadata = { title: 'İptal ve İade Koşulları' }

const vars = {
  iptal_iade_linki: <Link href="/hesabim/siparislerim" className="text-[#373071] underline underline-offset-2">Hesabım › Siparişlerim</Link>,
  iade_kargo_firmasi: 'Kargonomi üzerinden anlaşmalı kargo firması',
  iade_kargo_kodu: 'İade talebi oluşturulduğunda hesabınızda gösterilir',
  iade_adresi: 'Caferağa Mahallesi, General Asım Gündüz Caddesi, No: 62, İç Kapı No: 5, Kadıköy / İstanbul',
  siparis_no: 'Sipariş numaranız',
  musteri_adi: 'Adınız ve soyadınız',
  musteri_eposta: 'E-posta adresiniz',
  iade_urun: 'İade etmek istediğiniz ürün ve adedi',
  iade_nedeni: 'İade nedeniniz (isteğe bağlı)',
  iade_talep_tarihi: 'Talebinizi oluşturduğunuz tarih',
}

export default function CancellationReturnsPage() {
  return (
    <LegalDocument doc={doc as LegalDoc} vars={vars}>
      <Link href="/hesabim/siparislerim" className="btn-primary inline-flex text-sm py-2.5 px-4 rounded-xl">İade veya iptal talebi oluştur</Link>
    </LegalDocument>
  )
}
