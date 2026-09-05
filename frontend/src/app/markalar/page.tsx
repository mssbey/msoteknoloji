const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Anker', 'Logitech', 'JBL', 'Sony', 'Lenovo']

export default function BrandsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-5">
      <h1 className="text-2xl font-black text-white">Markalar</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BRANDS.map((brand) => (
          <div key={brand} className="glass-card p-5 text-center">
            <p className="font-semibold text-white">{brand}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
