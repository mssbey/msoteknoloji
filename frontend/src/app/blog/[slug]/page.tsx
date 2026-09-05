import Link from 'next/link'

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Link href="/blog" className="text-sm text-[#4d7138] hover:text-[#33613f]">← Bloga don</Link>
      <article className="glass-card p-6 space-y-4">
        <h1 className="text-2xl font-black text-[#202c28]">{slug.replace(/-/g, ' ')}</h1>
        <p className="text-xs text-[#98a191]">Yayin tarihi: 02.06.2026</p>
        <p className="text-sm text-[#4a563f] leading-relaxed">
          Bu sayfa dinamik blog detay rotasidir. Backend blog API entegrasyonu tamamlandiginda icerik otomatik olarak yuklenecektir.
        </p>
      </article>
    </main>
  )
}
