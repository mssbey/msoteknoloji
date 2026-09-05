/**
 * Ürün verisini arayüzün anlayacağı hale getiren yardımcılar.
 *
 * Sentos'tan gelen kayıtlar iki yerde ham: varyant seçenekleri JSON string
 * içinde saklanıyor ve açıklamalar kendi yazı tipi/rengini dayatan inline
 * stillerle geliyor. İkisini de burada temizliyoruz.
 */

export interface RawVariant {
  id: number
  sku: string
  price: string | number
  sale_price?: string | number | null
  stock: number
  image?: string | null
  attributes?: string | Record<string, unknown> | null
}

export interface VariantOption {
  id: number
  sku: string
  price: number
  salePrice: number | null
  stock: number
  image: string | null
  groupName: string
  label: string
}

export interface VariantGroup {
  name: string
  options: VariantOption[]
}

const toNumber = (value: string | number | null | undefined): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return typeof num === 'number' && Number.isFinite(num) ? num : 0
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value) return null
  if (typeof value === 'object') return value as Record<string, unknown>
  if (typeof value !== 'string') return null
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null
  } catch {
    return null
  }
}

/** `{"model":{"name":"Seçenek","value":"Bordo"},"color":""}` → { groupName, label } */
function readVariantLabel(attributes: RawVariant['attributes'], fallback: string) {
  const record = asRecord(attributes)
  const model = asRecord(record?.model)

  const value = typeof model?.value === 'string' ? model.value.trim() : ''
  const color = typeof record?.color === 'string' ? record.color.trim() : ''
  const name = typeof model?.name === 'string' ? model.name.trim() : ''

  return {
    groupName: name || (value ? 'Seçenek' : color ? 'Renk' : 'Seçenek'),
    label: value || color || fallback,
  }
}

export function parseVariants(raw: RawVariant[] | undefined | null): VariantOption[] {
  if (!Array.isArray(raw)) return []

  return raw.map((variant) => {
    const { groupName, label } = readVariantLabel(variant.attributes, variant.sku)
    const salePrice = toNumber(variant.sale_price)

    return {
      id: variant.id,
      sku: variant.sku,
      price: toNumber(variant.price),
      salePrice: salePrice > 0 ? salePrice : null,
      stock: Number(variant.stock) || 0,
      image: variant.image || null,
      groupName,
      label,
    }
  })
}

/**
 * Tek bir seçeneği olan ve etiketi SKU'dan ibaret varyantlar kullanıcıya bir şey
 * anlatmaz — o durumda seçim alanını hiç göstermiyoruz.
 */
export function groupVariants(options: VariantOption[]): VariantGroup[] {
  if (options.length === 0) return []
  if (options.length === 1 && options[0].label === options[0].sku) return []

  const groups = new Map<string, VariantOption[]>()
  options.forEach((option) => {
    const existing = groups.get(option.groupName)
    if (existing) existing.push(option)
    else groups.set(option.groupName, [option])
  })

  return [...groups].map(([name, groupOptions]) => ({ name, options: groupOptions }))
}

/**
 * Sentos açıklamaları kendi rengini, yazı tipini ve 11px punto ayarını taşıyor;
 * bunları sökünce metin sayfanın kendi tipografisine uyuyor. Aynı geçişte
 * script/iframe ve `on...` olay nitelikleri de temizleniyor.
 */
export function sanitizeDescription(html: string | null | undefined): string {
  if (!html) return ''

  return html
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*(script|style|iframe|object|embed)[^>]*\/?>/gi, '')
    .replace(/<\s*\/?\s*font[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s(?:style|class|face|color|bgcolor|align|width|height)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(<p[^>]*>)(\s|&nbsp;|<br\s*\/?>)*(<\/p>)/gi, '')
    .trim()
}

/** Açıklamada gerçekten okunacak bir metin var mı? */
export function hasReadableText(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

export interface SpecRow {
  label: string
  value: string
}

/** Yalnızca dolu olan teknik alanları tabloya alır — boş satır göstermeyiz. */
export function buildSpecs(product: {
  sku?: string
  barcode?: string | null
  brand?: { name?: string } | null
  category?: { name?: string } | null
  weight?: string | number | null
  width?: string | number | null
  height?: string | number | null
  depth?: string | number | null
}): SpecRow[] {
  const dimension = [product.width, product.height, product.depth]
    .map((value) => toNumber(value as string | number))
    .filter((value) => value > 0)

  const rows: (SpecRow | null)[] = [
    product.brand?.name ? { label: 'Marka', value: product.brand.name } : null,
    product.sku ? { label: 'Ürün kodu', value: product.sku } : null,
    product.barcode ? { label: 'Barkod', value: product.barcode } : null,
    toNumber(product.weight as string | number) > 0
      ? { label: 'Ağırlık', value: `${toNumber(product.weight as string | number)} kg` }
      : null,
    dimension.length === 3 ? { label: 'Ölçüler', value: `${dimension.join(' × ')} cm` } : null,
  ]

  return rows.filter((row): row is SpecRow => row !== null)
}
