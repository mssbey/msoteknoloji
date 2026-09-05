import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'

export interface CartItem {
  productId: number
  variantId?: number
  name: string
  slug: string
  image: string
  price: number
  salePrice?: number
  quantity: number
  sku: string
  storeName: string
  storeSlug: string
  stock: number
  variantLabel?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  couponCode: string | null
  couponDiscount: number
  addItem: (item: CartItem) => void
  removeItem: (productId: number, variantId?: number) => void
  updateQty: (productId: number, variantId: number | undefined, qty: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  subtotal: () => number
  total: () => number
  itemCount: () => number
  shippingCost: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
          )
          if (existing) {
            const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock)
            toast.success(`${newItem.name} güncellendi`)
            return {
              items: state.items.map((i) =>
                i.productId === newItem.productId && i.variantId === newItem.variantId
                  ? { ...i, quantity: newQty }
                  : i
              ),
              isOpen: true,
            }
          }
          toast.success(`${newItem.name} sepete eklendi`, {
            description: formatPrice(newItem.salePrice ?? newItem.price),
            action: { label: 'Sepete Git', onClick: () => get().openCart() },
          })
          return { items: [...state.items, newItem], isOpen: true }
        })
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
      },

      updateQty: (productId, variantId, qty) => {
        if (qty <= 0) { get().removeItem(productId, variantId); return }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId && i.variantId === variantId
              ? { ...i, quantity: Math.min(qty, i.stock) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [], couponCode: null, couponDiscount: 0 }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      applyCoupon: (code, discount) =>
        set({ couponCode: code, couponDiscount: discount }),
      removeCoupon: () =>
        set({ couponCode: null, couponDiscount: 0 }),

      subtotal: () =>
        get().items.reduce(
          (sum, i) => sum + (i.salePrice ?? i.price) * i.quantity, 0
        ),

      shippingCost: () => (get().subtotal() >= 199 ? 0 : 29.90),

      total: () => {
        const sub = get().subtotal()
        const shipping = get().shippingCost()
        const discount = get().couponDiscount
        return Math.max(0, sub + shipping - discount)
      },

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'mso-cart',
      partialize: (s) => ({
        items: s.items,
        couponCode: s.couponCode,
        couponDiscount: s.couponDiscount,
      }),
    }
  )
)
