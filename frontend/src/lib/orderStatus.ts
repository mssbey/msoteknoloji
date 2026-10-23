export const ORDER_STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Ödeme bekleniyor', cls: 'text-[#9c7226] bg-[#faf3e2]' },
  payment_failed: { label: 'Ödeme başarısız', cls: 'text-[#b0463c] bg-[#fbeceb]' },
  received: { label: 'Sipariş alındı', cls: 'text-[#373071] bg-[#edebf7]' },
  confirmed: { label: 'Onaylandı', cls: 'text-[#373071] bg-[#edebf7]' },
  processing: { label: 'Hazırlanıyor', cls: 'text-[#373071] bg-[#edebf7]' },
  shipped: { label: 'Kargoda', cls: 'text-[#7c5e77] bg-[#f2eaf0]' },
  delivered: { label: 'Teslim edildi', cls: 'text-[#2f7d4f] bg-[#e7f4ec]' },
  cancelled: { label: 'İptal edildi', cls: 'text-[#b0463c] bg-[#fbeceb]' },
  return_requested: { label: 'İade talebi oluşturuldu', cls: 'text-[#9c7226] bg-[#faf3e2]' },
  refunded: { label: 'İade edildi', cls: 'text-[#646773] bg-[#f0eff6]' },
}

export function orderStatusBadge(status: string) {
  return ORDER_STATUS[status] || { label: status, cls: 'text-[#646773] bg-[#f0eff6]' }
}

export type OrderStatusHistory = { id: number; status: string; created_at: string }
