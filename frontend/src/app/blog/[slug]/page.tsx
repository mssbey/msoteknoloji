import Link from 'next/link'

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Link href="/blog" className="text-sm text-blue-400 hover:text-blue-300">← Bloga don</Link>
      <article className="glass-card p-6 space-y-4">
        <h1 className="text-2xl font-black text-white">{slug.replace(/-/g, ' ')}</h1>
        <p className="text-xs text-white/40">Yayin tarihi: 02.06.2026</p>
        <p className="text-sm text-white/75 leading-relaxed">
          Bu sayfa dinamik blog detay rotasidir. Backend blog API entegrasyonu tamamlandiginda icerik otomatik olarak yuklenecektir.
        </p>
      </article>
    </main>
  )
}
