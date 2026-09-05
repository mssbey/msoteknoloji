'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

interface NotifPref {
  key: 'order_updates' | 'campaign' | 'review_request' | 'cart_recovery'
  label: string
  desc: string
}

const PREFS: NotifPref[] = [
  { key: 'order_updates', label: 'Sipariş Bildirimleri', desc: 'Sipariş alındı, kargoda, teslim edildi' },
  { key: 'campaign', label: 'Kampanya & İndirimler', desc: 'Yeni kampanya ve özel teklifler' },
  { key: 'review_request', label: 'Ürün Yorum Hatırlatması', desc: 'Sipariş sonrası yorum yapın çağrısı' },
  { key: 'cart_recovery', label: 'Sepet Hatırlatması', desc: 'Sepette kalan ürünler için hatırlatma' },
]

export default function NotificationsPage() {
  const { user } = useAuthStore()
  const [sms, setSms] = useState(user?.phone ? true : false)
  const [whatsapp, setWhatsapp] = useState(false)
  const [email, setEmail] = useState(true)

  const save = () => {
    toast.success('Bildirim tercihleri kaydedildi')
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? 'bg-blue-500' : 'bg-white/15'}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
    </button>
  )

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-black text-white">Bildirim Tercihleri</h1>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-1">Kanallar</h2>
        <p className="text-xs text-white/40 mb-4">Hangi kanallardan bildirim almak istiyorsunuz?</p>
        <div className="space-y-3">
          {[
            { icon: Mail, label: 'E-posta', state: email, set: setEmail },
            { icon: Smartphone, label: 'SMS', state: sms, set: setSms },
            { icon: MessageSquare, label: 'WhatsApp', state: whatsapp, set: setWhatsapp },
          ].map(({ icon: Icon, label, state, set }) => (
            <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
              <Icon className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white flex-1">{label}</span>
              <Toggle checked={state} onChange={set} />
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="font-bold text-white mb-1 flex items-center gap-2"><Bell className="h-4 w-4 text-blue-400" />Bildirim Türleri</h2>
        <p className="text-xs text-white/40 mb-4">Hangi konularda haber almak istiyorsunuz?</p>
        <div className="space-y-2">
          {PREFS.map((p) => (
            <div key={p.key} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/6">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{p.label}</p>
                <p className="text-xs text-white/40">{p.desc}</p>
              </div>
              <Toggle checked={true} onChange={() => {}} />
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} className="btn-primary text-sm py-2.5 px-6 rounded-xl">
        Tercihleri Kaydet
      </button>
    </div>
  )
}
