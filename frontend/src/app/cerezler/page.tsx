import type { Metadata } from 'next'
import LegalDocument, { type LegalDoc } from '@/components/legal/LegalDocument'
import CookiePreferences from '@/components/legal/CookiePreferences'
import doc from '@/content/legal/cerez-politikasi.json'

export const metadata: Metadata = { title: 'Çerez Politikası' }

// Sitede kullanılan çerez ve tarayıcı depolama kayıtları
const INVENTORY = [
  ['mso_kvkk_consent', 'MSO Teknoloji', 'Çerez tercihlerinizi saklar', 'Zorunlu', '1 yıl', 'Hukuki yükümlülük / meşru menfaat'],
  ['mso_lead_captured', 'MSO Teknoloji', 'Kampanya penceresinin tekrar gösterilmemesi', 'İşlevsel', '30 gün', 'Meşru menfaat'],
  ['mso_token, mso-auth (tarayıcı depolaması)', 'MSO Teknoloji', 'Oturumunuzu açık tutar', 'Zorunlu', 'Oturum kapatılana kadar', 'Sözleşmenin ifası'],
  ['mso-cart (tarayıcı depolaması)', 'MSO Teknoloji', 'Sepetinizi saklar', 'Zorunlu', 'Sepet boşaltılana kadar', 'Sözleşmenin ifası'],
]

const inventory = (
  <div className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs">
    <thead><tr>{['Çerez adı', 'Sağlayıcı', 'Kullanım amacı', 'Kategori', 'Saklama süresi', 'Hukuki sebep'].map(h => <th key={h} className="border border-[#e6e4f0] bg-[#f4f3f9] p-2">{h}</th>)}</tr></thead>
    <tbody>{INVENTORY.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i} className="border border-[#e6e4f0] p-2">{cell}</td>)}</tr>)}</tbody>
  </table></div>
)

export default function CookiesPage() {
  return (
    <LegalDocument
      doc={doc as LegalDoc}
      templateTable={inventory}
      vars={{ cerez_tercih_linki: <a href="#tercihler" className="text-[#373071] underline underline-offset-2">Çerez tercihlerini yönet</a> }}
    >
      <CookiePreferences />
    </LegalDocument>
  )
}
