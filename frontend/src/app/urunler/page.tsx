'use client'
import { Suspense } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, ChevronRight, Search, X, SlidersHorizontal } from 'lucide-react'
import { productsAPI } from '@/lib/api'
import { ProductCard, ProductSkeleton, Product } from '@/components/home/FeaturedProducts'
import { useCatalog } from '@/lib/catalog'
const sorts = [{value:'newest',label:'En yeni ürünler'}, {value:'popular',label:'Çok satanlar'}, {value:'price_asc',label:'Fiyat: Düşükten yükseğe'}, {value:'price_desc',label:'Fiyat: Yüksekten düşüğe'}, {value:'rating',label:'En yüksek puan'}]
function ProductListContent() {
  const router = useRouter()
  const params = useSearchParams()
  const { data: catalog } = useCatalog()
  const q = params.get('q') || ''
  const sort = params.get('sort') || 'newest'
  const collection = params.get('collection') || ''
  const category = params.get('category') || ''
  const min = params.get('min_price') || ''
  const max = params.get('max_price') || ''
  const hasImage = params.get('has_image') === 'true'
  const inStock = params.get('in_stock') === 'true'
  const page = Math.max(1, Number(params.get('page')) || 1)
  const group = catalog?.groups.find(g => g.slug === collection)
  const leaf = (group ? group.categories : catalog?.groups.flatMap(g => g.categories))?.find(c => c.slug === category)
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['products', q, sort, collection, category, min, max, page, hasImage, inStock], queryFn: async () => (await productsAPI.list({q, sort, collection, category, page, per_page:20, ...(min && {min_price:min}), ...(max && {max_price:max}), ...(hasImage && {has_image:true}), ...(inStock && {in_stock:true})})).data.data as {data:Product[]; total:number; last_page:number} })
  const setParam = (key:string, value:string) => {
    const next = new URLSearchParams(params.toString())
    if(value) next.set(key,value); else next.delete(key)
    if(key !== 'page') next.delete('page')
    if(key === 'collection') next.delete('category')
    router.push(`/urunler?${next.toString()}`, { scroll: key === 'page' })
  }
  const last = data?.last_page || 1
  const pages = Array.from(new Set([1,...Array.from({length:5},(_,i)=>page-2+i).filter(p=>p>1 && p<last),last])).sort((a,b)=>a-b)
  return <div className="storefront"><div className="store-container catalog-list-page"><div className="store-breadcrumb"><Link href="/">ANA SAYFA</Link><span>/</span><Link href="/urunler">ÜRÜNLER</Link>{group && <><span>/</span>{group.name.toLocaleUpperCase('tr')}</>}</div><div className="catalog-page-intro"><div><span className="eyebrow">İYİ EKİPMAN. YENİ KEŞİFLER.</span><h1>{q ? `“${q}” için sonuçlar` : leaf?.name || group?.name || 'Tüm ürünleri keşfet'}<span className="accent-dot">.</span></h1><p>{group?.description || 'Balıkçılık, outdoor ve günlük yaşam için ihtiyacınız olan her şey.'}</p></div><span className="catalog-total">{isLoading ? '…' : data?.total.toLocaleString('tr-TR') || '0'} <small>ürün</small></span></div>
  <div className="catalog-layout"><aside className="catalog-sidebar"><h2><SlidersHorizontal size={15} /> Kategoriler & filtreler</h2><div className="catalog-group-links"><button className={!collection ? 'active' : ''} onClick={()=>setParam('collection','')}>Tüm ürünler <span>{catalog?.total}</span></button>{catalog?.groups.map(g=><button key={g.slug} className={collection===g.slug?'active':''} onClick={()=>setParam('collection',g.slug)}>{g.name}<span>{g.products_count}</span></button>)}</div>
    {group && <label className="filter-label">Alt kategori<select value={category} onChange={e=>setParam('category',e.target.value)}><option value="">Tüm {group.name.toLocaleLowerCase('tr')} ürünleri</option>{group.categories.map(c=><option key={c.slug} value={c.slug}>{c.name === 'Sentos' ? 'Diğer ürünler' : c.name}</option>)}</select></label>}
    <form className="catalog-price-filter" key={`${min}-${max}`} onSubmit={e=>{e.preventDefault();const form=new FormData(e.currentTarget);const next=new URLSearchParams(params.toString());for(const key of ['min_price','max_price']){const value=String(form.get(key)||'');if(value)next.set(key,value);else next.delete(key)}next.delete('page');router.push(`/urunler?${next}`)}}><label className="filter-label">Fiyat aralığı (₺)</label><div><input type="number" min="0" step="0.01" name="min_price" defaultValue={min} placeholder="En az" aria-label="En düşük fiyat" /><span>–</span><input type="number" min="0" step="0.01" name="max_price" defaultValue={max} placeholder="En çok" aria-label="En yüksek fiyat" /></div><button type="submit">Fiyatı uygula <ArrowRight size={13} /></button></form>
    <label className="catalog-checkbox"><input type="checkbox" checked={hasImage} onChange={e=>setParam('has_image',e.target.checked?'true':'')} /> Yalnızca görselli ürünler</label><label className="catalog-checkbox"><input type="checkbox" checked={inStock} onChange={e=>setParam('in_stock',e.target.checked?'true':'')} /> Yalnızca stoktakiler</label>
    {(collection || category || min || max || q || hasImage || inStock) && <Link href="/urunler" className="clear-filters"><X size={13} /> Filtreleri temizle</Link>}
  </aside><div className="catalog-results"><div className="catalog-toolbar"><span>{group?.name || 'MSO Koleksiyonu'}{q && <button onClick={()=>setParam('q','')} aria-label="Aramayı temizle"><X size={14} /></button>}</span><label>Sırala <select aria-label="Ürünleri sırala" value={sort} onChange={e=>setParam('sort',e.target.value)}>{sorts.map(s=><option value={s.value} key={s.value}>{s.label}</option>)}</select></label></div>
  {isError ? <div className="catalog-empty">Ürünler yüklenemedi. <button onClick={()=>refetch()}>Tekrar dene</button></div> : isLoading ? <div className="store-product-grid">{Array.from({length:12},(_,i)=><ProductSkeleton key={i}/>)}</div> : data?.data.length ? <div className="store-product-grid">{data.data.map((p,i)=><ProductCard product={p} key={p.id} index={i}/>)}</div> : <div className="catalog-empty"><Search size={32} className="mx-auto mb-4" /><h2>Bu filtrelerle ürün bulunamadı</h2><p className="my-3">Farklı bir kategori veya fiyat aralığı deneyin.</p><Link href="/urunler" className="text-link justify-center">Tüm ürünlere dön <ArrowRight size={15} /></Link></div>}
  {last>1 && <nav className="catalog-pagination" aria-label="Ürün sayfaları"><button disabled={page<=1} onClick={()=>setParam('page',String(page-1))} aria-label="Önceki sayfa"><ChevronLeft size={16}/></button>{pages.map((p,i)=><span key={p}>{i>0 && p-pages[i-1]>1 && <span className="pagination-gap">…</span>}<button aria-current={p===page?'page':undefined} className={p===page?'active':''} onClick={()=>setParam('page',String(p))}>{p}</button></span>)}<button disabled={page>=last} onClick={()=>setParam('page',String(page+1))} aria-label="Sonraki sayfa"><ChevronRight size={16}/></button></nav>}
  </div></div></div></div>
}
export default function ProductsPage(){return <Suspense fallback={<div className="storefront min-h-screen"/>}><ProductListContent/></Suspense>}
