import type { Metadata } from 'next'
import LegalDocument, { type LegalDoc } from '@/components/legal/LegalDocument'
import doc from '@/content/legal/uyelik-sozlesmesi.json'

export const metadata: Metadata = { title: 'Üyelik Sözleşmesi' }

export default function MembershipAgreementPage() {
  return <LegalDocument doc={doc as LegalDoc} />
}
