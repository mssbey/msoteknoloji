'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from './api'
export interface CatalogGroup { slug: string; name: string; description: string; products_count: number; image: string | null; categories: { slug: string; name: string }[] }
export interface CatalogSummary { groups: CatalogGroup[]; total: number; has_sales: boolean }
export function useCatalog() {
  return useQuery({ queryKey: ['storefront-catalog'], queryFn: async () => (await api.get('/storefront')).data.data as CatalogSummary, staleTime: 60_000 })
}
export const collectionHref = (slug: string) => `/urunler?collection=${encodeURIComponent(slug)}`
export const categoryLabel = (name?: string) => !name || name === 'Sentos' ? 'MSO Koleksiyonu' : name.split('>').at(-1)?.trim()
