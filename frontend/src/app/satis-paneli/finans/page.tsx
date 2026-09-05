'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, Clock,
  CheckCircle, XCircle, Download, Building2,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { formatPrice } from '@/lib/utils'

const REVENUE_DATA = [
  { ay: 'Oca', ciro: 28000, odeme: 22400 },
  { ay: 'Şub', ciro: 32000, odeme: 25600 },
  { ay: 'Mar', ciro: 45000, odeme: 36000 },
  { ay: 'Nis', ciro: 38000, odeme: 30400 },
  { ay: 'May', ciro: 52000, odeme: 41600 },
  { ay: 'Haz', ciro: 48000, odeme: 38400 },
]

const TRANSACTIONS = [
  { type: 'earning', desc: 'Sipariş #MSO260601', amount: 1170, date: '01.06.2026 14:32', status: 'completed' },
  { type: 'earning', desc: 'Sipariş #MSO260600', amount: 404, date: '01.06.2026 11:15', status: 'completed' },
  { type: 'payout', desc: 'Para Çekimi', amount: -5000, date: '31.05.2026 09:00', status: 'completed' },
  { type: 'earning', desc: 'Sipariş #MSO260598', amount: 270, date: '30.05.2026 16:44', status: 'pending' },
  { type: 'subscription', desc: 'Professional Abonelik', amount: -699, date: '01.05.2026 00:00', status: 'completed' },
]

export default function SellerFinancePage() {
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const balance = 12400
  const pendingBalance = 3200

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div>
        <h1 className="text-xl font-black text-white">Finans</h1>
        <p className="text-sm text-white/40 mt-0.5">Bakiye ve işlem geçmişi</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="h-4 w-4 text-green-400" />
            <span className="text-xs font-bold text-white/50">KULLANILABİLİR BAKİYE</span>
          </div>
          <p className="text-3xl font-black text-white">{formatPrice(balance)}</p>
          <p className="text-xs text-white/40 mt-1">Son güncelleme: Şimdi</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-white/50">BEKLEYEN ÖDEME</span>
          </div>
          <p className="text-3xl font-black text-amber-400">{formatPrice(pendingBalance)}</p>
          <p className="text-xs text-white/40 mt-1">5 iş günü içinde aktarılır</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-bold text-white/50">TOPLAM KAZANÇ</span>
          </div>
          <p className="text-3xl font-black text-blue-400">{formatPrice(243000)}</p>
          <p className="text-xs text-white/40 mt-1">Tüm zamanlar</p>
        </motion.div>
      </div>

      {/* Revenue Chart + Withdrawal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-bold text-white mb-4">Aylık Ciro & Ödeme Grafiği</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ciroGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="odemeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="ay" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A1A22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#F8FAFC', fontSize: 12 }}
                formatter={(val, name) => [formatPrice(Number(val ?? 0)), String(name) === 'ciro' ? 'Ciro' : 'Ödeme']}
              />
              <Area type="monotone" dataKey="ciro" stroke="#3B82F6" strokeWidth={2} fill="url(#ciroGrad)" />
              <Area type="monotone" dataKey="odeme" stroke="#10B981" strokeWidth={2} fill="url(#odemeGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Withdrawal */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="h-4 w-4 text-green-400" />
            <h3 className="font-bold text-white">Para Çekimi</h3>
          </div>

          <div className="mb-3">
            <label className="text-xs font-bold text-white/50 mb-1.5 block">TUTAR (TL)</label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={`Max: ${formatPrice(balance)}`}
              className="input-glass py-2.5 text-sm"
            />
          </div>

          <div className="p-3 rounded-xl bg-white/4 border border-white/8 mb-4">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Building2 className="h-3.5 w-3.5" />
              <span>Garanti BBVA</span>
            </div>
            <p className="text-xs text-white/30 mt-1 font-mono">TR•• •••• •••• •••• •••</p>
          </div>

          <button className="btn-primary w-full py-3 text-sm rounded-xl flex items-center justify-center gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Para Çekme Talebi
          </button>

          <p className="text-[10px] text-white/30 text-center mt-2">
            Min: 100 TL · 1-3 iş günü içinde aktarılır
          </p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h3 className="font-bold text-white">İşlem Geçmişi</h3>
          <button className="btn-ghost py-1.5 px-3 text-xs rounded-xl flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Excel İndir
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/8">
              <th className="text-left py-3 px-4 text-xs font-bold text-white/40 uppercase">Açıklama</th>
              <th className="text-left py-3 px-4 text-xs font-bold text-white/40 uppercase hidden md:table-cell">Tarih</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-white/40 uppercase">Tutar</th>
              <th className="text-right py-3 px-4 text-xs font-bold text-white/40 uppercase hidden sm:table-cell">Durum</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((tx, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-xl flex-shrink-0 ${
                      tx.amount > 0 ? 'bg-green-500/15 border border-green-500/25' : 'bg-red-500/15 border border-red-500/25'
                    }`}>
                      {tx.amount > 0
                        ? <ArrowUpRight className="h-3.5 w-3.5 text-green-400" />
                        : <ArrowDownLeft className="h-3.5 w-3.5 text-red-400" />
                      }
                    </div>
                    <span className="text-sm text-white/80">{tx.desc}</span>
                  </div>
                </td>
                <td className="py-3 px-4 hidden md:table-cell">
                  <span className="text-xs text-white/40">{tx.date}</span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatPrice(Math.abs(tx.amount))}
                  </span>
                </td>
                <td className="py-3 px-4 text-right hidden sm:table-cell">
                  <span className={`flex items-center justify-end gap-1 text-xs ${tx.status === 'completed' ? 'text-green-400' : 'text-amber-400'}`}>
                    {tx.status === 'completed'
                      ? <><CheckCircle className="h-3 w-3" /> Tamamlandı</>
                      : <><Clock className="h-3 w-3" /> Bekliyor</>
                    }
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
