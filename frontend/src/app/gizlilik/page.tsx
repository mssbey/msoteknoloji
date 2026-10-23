import type { Metadata } from 'next'
import LegalDocument, { type LegalDoc } from '@/components/legal/LegalDocument'
import doc from '@/content/legal/gizlilik-kvkk.json'

export const metadata: Metadata = { title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni' }

export default function PrivacyPage() {
  return <LegalDocument doc={doc as LegalDoc} />
}
