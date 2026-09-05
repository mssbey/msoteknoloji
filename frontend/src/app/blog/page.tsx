import Link from 'next/link'

const POSTS = [
  { slug: 'iphone-kilif-rehberi', title: 'iPhone Kilif Secim Rehberi', excerpt: 'Dogru kilif secerken dikkat edilmesi gereken 7 madde.' },
  { slug: 'hizli-sarj-teknolojisi', title: 'Hizli Sarj Teknolojisi', excerpt: 'PD, QC ve GaN farklari nelerdir?' },
  { slug: 'kulaklik-alma-rehberi', title: 'Kulaklik Alma Rehberi', excerpt: 'Kablosuz kulaklikta ses kalitesini nasil anlarsiniz?' },
]

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-white">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {POSTS.map((post) => (
          <article key={post.slug} className="glass-card p-5">
            <h2 className="font-bold text-white">{post.title}</h2>
            <p className="text-sm text-white/50 mt-2">{post.excerpt}</p>
            <Link href={`/blog/${post.slug}`} className="inline-flex mt-3 text-sm text-blue-400 hover:text-blue-300">Devamini oku</Link>
          </article>
        ))}
      </div>
    </main>
  )
}
