const FALLBACK_API_URL = 'http://localhost:8000/api'

const LOOPBACK_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'])

// Geliştirme ortamındaki adresler (loopback + özel ağ IP'leri) cihazdan cihaza
// değişir: telefondan girildiğinde "localhost" telefonun kendisini gösterir.
const isLocalNetworkHostname = (hostname: string) =>
  LOOPBACK_HOSTNAMES.has(hostname) ||
  hostname.endsWith('.local') ||
  /^10\./.test(hostname) ||
  /^192\.168\./.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)

/**
 * Tarayıcıda API adresini siteyi açan cihazın gördüğü host üzerinden kurar.
 * Böylece site localhost, LAN IP veya telefon hotspot IP'si — hangisinden
 * açılırsa açılsın API istekleri aynı makineye gider. NEXT_PUBLIC_API_URL
 * gerçek bir alan adı gösteriyorsa (production) olduğu gibi bırakılır.
 */
export function resolveApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL || FALLBACK_API_URL
  if (typeof window === 'undefined') return configured

  try {
    const url = new URL(configured, window.location.origin)
    if (isLocalNetworkHostname(url.hostname) && url.hostname !== window.location.hostname) {
      url.hostname = window.location.hostname
    }
    return url.toString().replace(/\/+$/, '')
  } catch {
    return configured
  }
}

/** API adresinin `/api` öneki olmadan hali — admin paneli gibi backend sayfaları için. */
export function backendUrl(path = ''): string {
  const origin = resolveApiBaseUrl().replace(/\/api\/?$/, '')
  return path ? `${origin}/${path.replace(/^\/+/, '')}` : origin
}
