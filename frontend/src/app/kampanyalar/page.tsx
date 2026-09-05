import Link from 'next/link'

const CAMPAIGNS = [
  { title: 'Yaz Firsati', desc: 'Secili urunlerde %30 indirim', code: 'YAZ30' },
  { title: 'Sepet Kurtarma', desc: 'Terk edilen sepetlerde ozel kupon', code: 'GERIDON10' },
  { title: 'Ilk Siparis', desc: 'Yeni uyeye hos geldin indirimi', code: 'WELCOME15' },
]

export default function CampaignsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-[#202c28]">Kampanyalar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {CAMPAIGNS.map((c) => (
          <article key={c.code} className="glass-card p-5">
            <p className="font-bold text-[#202c28]">{c.title}</p>
            <p className="text-sm text-[#8c958c] mt-1">{c.desc}</p>
            <p className="text-xs text-[#4d7138] mt-2">Kod: {c.code}</p>
            <Link href="/urunler" className="inline-flex mt-3 text-sm text-[#4d7138] hover:text-[#33613f]">Alisverise git</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
