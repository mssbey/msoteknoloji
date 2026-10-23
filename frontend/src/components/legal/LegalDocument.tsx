import Link from 'next/link'
import type { ReactNode } from 'react'

// Kaynak: proje kökündeki .docx dosyaları → scripts/import_legal_docs.py
type Block =
  | { type: 'title' | 'heading' | 'item'; text: string }
  | { type: 'paragraph'; text: string; strong?: boolean }
  | { type: 'field'; label: string; text: string }
  | { type: 'table'; rows: string[][] }
  | { type: 'products' }

export type LegalDoc = { version: string; title: string; blocks: Block[] }

type Props = {
  doc: LegalDoc
  /** {{alan}} yer tutucularının değerleri; değeri olmayan alan satırları gösterilmez. */
  vars?: Record<string, ReactNode>
  /** Yer tutucu içeren tabloların yerine gösterilecek içerik (ör. çerez envanteri) */
  templateTable?: ReactNode
  children?: ReactNode
}

const PLACEHOLDER = /\{\{\s*([a-z_]+)\s*\}\}/g

function fill(text: string, vars: Record<string, ReactNode>): ReactNode {
  const parts = text.split(PLACEHOLDER)
  if (parts.length === 1) return linkify(text)
  return parts.map((part, i) => (i % 2 ? <span key={i}>{vars[part] ?? '—'}</span> : <span key={i}>{linkify(part)}</span>))
}

function linkify(text: string): ReactNode {
  const parts = text.split(/(https?:\/\/[^\s,)]+|[\w.+-]+@[\w-]+\.[\w.]+)/g)
  return parts.map((part, i) => {
    if (i % 2 === 0) return part
    const href = part.includes('@') && !part.startsWith('http') ? `mailto:${part}` : part
    return <a key={i} href={href} className="text-[#373071] underline underline-offset-2 break-all">{part}</a>
  })
}

const unresolved = (text: string, vars: Record<string, ReactNode>) =>
  [...text.matchAll(PLACEHOLDER)].some(m => vars[m[1]] === undefined)

export default function LegalDocument({ doc, vars = {}, templateTable, children }: Props) {
  const out: ReactNode[] = []
  let list: ReactNode[] = []
  const flush = (key: number) => {
    if (list.length) out.push(<ul key={`ul-${key}`} className="list-disc pl-5 space-y-1">{list}</ul>)
    list = []
  }

  doc.blocks.forEach((block, i) => {
    if (block.type !== 'item') flush(i)
    switch (block.type) {
      case 'title':
        return
      case 'item':
        list.push(<li key={i}>{fill(block.text, vars)}</li>)
        return
      case 'heading':
        out.push(<h2 key={i} className="text-base font-bold text-[#23262b] pt-4">{fill(block.text, vars)}</h2>)
        return
      case 'field':
        if (unresolved(block.text, vars)) return
        out.push(<p key={i}><b className="text-[#23262b]">{block.label}:</b> {fill(block.text, vars)}</p>)
        return
      case 'table':
        if (block.rows.some(r => r.some(c => unresolved(c, vars)))) {
          if (templateTable) out.push(<div key={i}>{templateTable}</div>)
          return
        }
        out.push(
          <div key={i} className="overflow-x-auto"><table className="w-full text-left border-collapse text-xs">
            <tbody>{block.rows.map((row, r) => <tr key={r}>{row.map((cell, c) => r === 0
              ? <th key={c} className="border border-[#e6e4f0] bg-[#f4f3f9] p-2">{cell}</th>
              : <td key={c} className="border border-[#e6e4f0] p-2">{fill(cell, vars)}</td>)}</tr>)}</tbody>
          </table></div>,
        )
        return
      case 'products':
        return
      default:
        if (unresolved(block.text, vars)) return
        out.push(<p key={i} className={block.strong ? 'font-semibold text-[#23262b]' : undefined}>{fill(block.text, vars)}</p>)
    }
  })
  flush(doc.blocks.length)

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-[#23262b]">{doc.title}</h1>
        <p className="text-xs text-[#8e909b] mt-1">Sürüm {doc.version}</p>
      </div>
      {children}
      <article className="glass-card p-6 space-y-3 text-sm text-[#474b57] leading-relaxed break-words">{out}</article>
      <nav aria-label="Diğer hukuki metinler" className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#585c68]">
        <Link href="/kvkk">KVKK ve Gizlilik</Link>
        <Link href="/cerezler">Çerez Politikası</Link>
        <Link href="/iptal-iade">İptal ve İade Koşulları</Link>
        <Link href="/uyelik-sozlesmesi">Üyelik Sözleşmesi</Link>
      </nav>
    </main>
  )
}
