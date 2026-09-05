import { Suspense } from 'react'
import { ProductListContent } from './ProductListContent'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050507] flex items-center justify-center"><div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductListContent />
    </Suspense>
  )
}
