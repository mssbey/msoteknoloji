import { Suspense } from 'react'
import { ProductListContent } from './ProductListContent'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f6f5fb] flex items-center justify-center"><div className="h-8 w-8 border-2 border-[#373071] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductListContent />
    </Suspense>
  )
}
