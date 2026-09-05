import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'

export interface WishlistItem {
  id: number
  slug: string
  name: string
  price: number
  image?: string
}

interface WishlistStore {
  ids: number[]
  items: WishlistItem[]
  toggle: (productId: number, productName?: string, item?: Partial<WishlistItem>) => void
  add: (item: WishlistItem) => void
  remove: (productId: number) => void
  isWishlisted: (productId: number) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      ids: [],
      items: [],
      toggle: (productId, productName, itemData) => {
        const isIn = get().ids.includes(productId)
        if (isIn) {
          set((s) => ({
            ids: s.ids.filter((id) => id !== productId),
            items: s.items.filter((i) => i.id !== productId),
          }))
          toast.success('Favorilerden çıkarıldı')
        } else {
          const newItem: WishlistItem = {
            id: productId,
            slug: itemData?.slug ?? String(productId),
            name: itemData?.name ?? productName ?? 'Ürün',
            price: itemData?.price ?? 0,
            image: itemData?.image,
          }
          set((s) => ({ ids: [...s.ids, productId], items: [...s.items, newItem] }))
          toast.success(`${productName ?? 'Ürün'} favorilere eklendi`, { icon: '❤️' })
        }
      },
      add: (item) => {
        if (get().ids.includes(item.id)) return
        set((s) => ({ ids: [...s.ids, item.id], items: [...s.items, item] }))
      },
      remove: (productId) => {
        set((s) => ({
          ids: s.ids.filter((id) => id !== productId),
          items: s.items.filter((i) => i.id !== productId),
        }))
      },
      isWishlisted: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [], items: [] }),
    }),
    { name: 'mso-wishlist' }
  )
)
