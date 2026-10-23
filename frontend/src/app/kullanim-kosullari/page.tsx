import { permanentRedirect } from 'next/navigation'

// Kullanım koşulları Üyelik Sözleşmesi'nde yer alır.
export default function TermsPage() {
  permanentRedirect('/uyelik-sozlesmesi')
}
