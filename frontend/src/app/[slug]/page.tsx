import Link from 'next/link'

const CATEGORY_SLUGS: Record<string, string> = {
  'telefon-aksesuar': 'Telefon Aksesuar',
  bilgisayar: 'Bilgisayar',
  'sarj-kablo': 'Sarj ve Kablo',
  kulaklik: 'Kulaklik',
  'akilli-saat': 'Akilli Saat',
  kamera: 'Kamera',
  monitor: 'Monitor',
  gaming: 'Gaming',
}

export default async function GenericCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const name = CATEGORY_SLUGS[slug] ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-white">{name}</h1>
      <p className="text-sm text-white/50">Bu sayfa hazirlaniyor. Simdilik tum urunleri goruntuleyebilir veya ana sayfaya donebilirsiniz.</p>
      <Link href="/urunler" className="btn-primary text-sm py-2.5 px-5 rounded-xl inline-flex">Tum Urunler</Link>
    </main>
  )
}
