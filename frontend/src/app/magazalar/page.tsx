import Link from 'next/link'

const STORES = [
  { name: 'TechStore Pro', slug: 'techstore-pro', rating: 4.8, products: 1247 },
  { name: 'PowerHub', slug: 'powerhub', rating: 4.6, products: 832 },
  { name: 'MobileHouse', slug: 'mobilehouse', rating: 4.7, products: 690 },
]

export default function StoresPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-[#23262b]">Magazalar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {STORES.map((s) => (
          <article key={s.slug} className="glass-card p-5">
            <p className="font-bold text-[#23262b]">{s.name}</p>
            <p className="text-xs text-[#8e909b] mt-1">Puan: {s.rating} · Urun: {s.products}</p>
            <Link href={`/urunler?store=${s.slug}`} className="inline-flex mt-3 text-sm text-[#373071] hover:text-[#2e2862]">Urunleri gor</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
