import { Suspense } from 'react'
import { ProductListContent } from './ProductListContent'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9f6] flex items-center justify-center"><div className="h-8 w-8 border-2 border-[#4d7138] border-t-transparent rounded-full animate-spin" /></div>}>
      <ProductListContent />
    </Suspense>
  )
}
