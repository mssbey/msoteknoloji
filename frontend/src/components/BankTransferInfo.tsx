'use client'

import { useState } from 'react'

export interface BankTransfer {
  bank_name: string
  account_name: string
  iban: string
  reference: string
  is_test: boolean
}

export default function BankTransferInfo({ bank }: { bank: BankTransfer }) {
  const [copied, setCopied] = useState(false)
  return <section className="glass-card p-5 space-y-3 border border-[#d6d3ee]">
    <h2 className="font-bold text-[#373071]">Havale / EFT ödeme bilgileri</h2>
    {bank.is_test && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Deneme banka bilgileridir. Bu hesaba para göndermeyin.</p>}
    <dl className="text-sm space-y-2"><div><dt className="text-[#7c7f8a]">Banka</dt><dd>{bank.bank_name}</dd></div><div><dt className="text-[#7c7f8a]">Hesap sahibi</dt><dd>{bank.account_name}</dd></div><div><dt className="text-[#7c7f8a]">IBAN</dt><dd className="font-semibold break-all">{bank.iban}</dd></div></dl>
    <div className="rounded-xl bg-[#edebf7] p-4 space-y-2"><p className="font-semibold">Havale açıklamasına sipariş numaranızı yazın:</p><p className="font-mono font-bold break-all">{bank.reference}</p><button type="button" className="text-sm underline" onClick={async () => { try { await navigator.clipboard.writeText(bank.reference); setCopied(true) } catch { setCopied(false) } }}>{copied ? 'Kopyalandı' : 'Sipariş numarasını kopyala'}</button></div>
    <p className="text-sm text-[#585c68]">Siparişiniz kaydedildi, ödemeniz bekleniyor. Ödemeniz kontrol edildikten sonra siparişiniz hazırlanacaktır.</p>
  </section>
}
