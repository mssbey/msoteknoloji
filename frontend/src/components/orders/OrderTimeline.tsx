import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatusHistory } from '@/lib/orderStatus'

const STEPS = [
  { key: 'received', label: 'Sipariş alındı' },
  { key: 'confirmed', label: 'Onaylandı' },
  { key: 'processing', label: 'Hazırlanıyor' },
  { key: 'shipped', label: 'Kargoda' },
  { key: 'delivered', label: 'Teslim edildi' },
] as const

const NOTICES: Record<string, { text: string; cls: string }> = {
  pending: { text: 'Ödemeniz onaylandığında siparişiniz işleme alınacak.', cls: 'bg-[#faf3e2] text-[#7a5a1e]' },
  payment_failed: { text: 'Ödemeniz alınamadı. Lütfen ödeme bilgilerinizi kontrol edin.', cls: 'bg-[#fbeceb] text-[#8f3a31]' },
  cancelled: { text: 'Bu sipariş iptal edildi.', cls: 'bg-[#fbeceb] text-[#8f3a31]' },
  return_requested: { text: 'İade talebiniz işleme alındı.', cls: 'bg-[#faf3e2] text-[#7a5a1e]' },
  refunded: { text: 'Bu siparişin ücret iadesi yapıldı.', cls: 'bg-[#f0eff6] text-[#4a4d58]' },
}

const timeFormat = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function OrderTimeline({ status, histories }: { status: string; histories: OrderStatusHistory[] }) {
  const reachedAt = new Map<string, string>()
  for (const h of histories) reachedAt.set(h.status, h.created_at)

  const stepIndex = (key: string) => STEPS.findIndex(s => s.key === key)
  let current = stepIndex(status)
  if (status === 'return_requested' || status === 'refunded') current = STEPS.length - 1
  // İptal edilen siparişte, iptalden önce ulaşılan son aşama gösterilir.
  if (status === 'cancelled') current = Math.max(-1, ...STEPS.map((s, i) => (reachedAt.has(s.key) ? i : -1)))
  const stopped = status === 'cancelled'
  const notice = NOTICES[status]

  return (
    <div className="space-y-4">
      <ol className="flex flex-col sm:flex-row gap-0 sm:gap-2" aria-label="Sipariş takip çizelgesi">
        {STEPS.map((step, i) => {
          const done = i < current || (i === current && (step.key === 'delivered' || stopped))
          const active = i === current && !done
          const at = reachedAt.get(step.key)
          return (
            <li key={step.key} aria-current={active ? 'step' : undefined}
              className="relative flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:flex-1 pb-5 sm:pb-0 last:pb-0">
              {i < STEPS.length - 1 && (
                <span aria-hidden className={cn(
                  'absolute left-[15px] top-8 bottom-0 w-0.5 sm:left-[calc(50%+20px)] sm:right-[calc(-50%+20px)] sm:top-[15px] sm:bottom-auto sm:w-auto sm:h-0.5',
                  i < current ? 'bg-[#2f7d4f]' : 'bg-[#e1e0ea]',
                )} />
              )}
              <span className={cn(
                'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold',
                done && 'bg-[#2f7d4f] border-[#2f7d4f] text-white',
                active && 'bg-[#373071] border-[#373071] text-white ring-4 ring-[#373071]/15',
                !done && !active && 'bg-white border-[#d3d3dd] text-[#a3a5b0]',
              )}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="sm:text-center">
                <span className={cn('block text-sm font-semibold', done ? 'text-[#2f7d4f]' : active ? 'text-[#373071]' : 'text-[#a3a5b0]')}>
                  {step.label}
                </span>
                <span className="block text-xs text-[#8e909b] mt-0.5">
                  {at ? timeFormat.format(new Date(at)) : active ? 'Şu anki aşama' : ''}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
      {notice && <p role="status" className={cn('rounded-xl px-4 py-3 text-sm', notice.cls)}>{notice.text}</p>}
    </div>
  )
}
