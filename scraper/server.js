const express = require('express')
const { chromium } = require('playwright')

const app = express()
app.use(express.json())

const PORT = process.env.SCRAPER_PORT ?? 3001
const SECRET = process.env.SCRAPER_SECRET ?? ''

// Bearer token auth middleware
app.use((req, res, next) => {
  if (!SECRET) return next()
  const auth = req.headers['authorization'] ?? ''
  if (auth !== `Bearer ${SECRET}`) return res.status(401).json({ error: 'Unauthorized' })
  next()
})

// ── Trendyol Ürün Yorumları ─────────────────────────────────
async function scrapeTrendyolReviews(productUrl, maxReviews = 50) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  try {
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForSelector('[data-testid="comment-card-body"]', { timeout: 10000 }).catch(() => {})

    const reviews = await page.evaluate((max) => {
      const cards = [...document.querySelectorAll('[data-testid="comment-card-body"]')].slice(0, max)
      return cards.map(card => ({
        author: card.querySelector('.oa-rating-author')?.textContent?.trim() ?? 'Anonim',
        rating: [...card.querySelectorAll('[class*="full"]')].length || null,
        text: card.querySelector('.comment-text')?.textContent?.trim()
          ?? card.querySelector('p')?.textContent?.trim() ?? '',
        date: card.querySelector('.comment-date, time')?.textContent?.trim() ?? null,
      }))
    }, maxReviews)

    return reviews
  } finally {
    await browser.close()
  }
}

// ── Hepsiburada Ürün Yorumları ──────────────────────────────
async function scrapeHepsiburadaReviews(productUrl, maxReviews = 50) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  try {
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForSelector('[data-test-id="review"]', { timeout: 10000 }).catch(() => {})

    const reviews = await page.evaluate((max) => {
      const cards = [...document.querySelectorAll('[data-test-id="review"]')].slice(0, max)
      return cards.map(card => ({
        author: card.querySelector('[data-test-id="review-author"]')?.textContent?.trim() ?? 'Anonim',
        rating: Number(card.querySelector('[data-test-id="review-rating"]')?.getAttribute('data-score')) || null,
        text: card.querySelector('[data-test-id="review-comment"]')?.textContent?.trim() ?? '',
        date: card.querySelector('[data-test-id="review-date"]')?.textContent?.trim() ?? null,
      }))
    }, maxReviews)

    return reviews
  } finally {
    await browser.close()
  }
}

// ── Generic Ürün Fiyat + Stok Scraper ──────────────────────
async function scrapeProductInfo(productUrl) {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  try {
    await page.goto(productUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })

    const data = await page.evaluate(() => {
      // JSON-LD structured data
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')]
        .map(s => { try { return JSON.parse(s.textContent ?? '') } catch { return null } })
        .filter(Boolean)
        .find(d => d['@type'] === 'Product' || d['@type'] === 'ItemPage')

      if (ld) {
        const offer = ld.offers ?? ld.Offers
        return {
          name: ld.name,
          price: offer?.price ?? offer?.lowPrice ?? null,
          currency: offer?.priceCurrency ?? 'TRY',
          availability: offer?.availability ?? null,
          image: Array.isArray(ld.image) ? ld.image[0] : ld.image,
          rating: ld.aggregateRating?.ratingValue ?? null,
          review_count: ld.aggregateRating?.reviewCount ?? null,
          source: 'json-ld',
        }
      }

      // Fallback: og + meta
      const og = n => document.querySelector(`meta[property="og:${n}"]`)?.getAttribute('content')
      const meta = n => document.querySelector(`meta[name="${n}"]`)?.getAttribute('content')
      return {
        name: og('title') ?? document.title,
        price: null,
        currency: 'TRY',
        availability: null,
        image: og('image'),
        rating: null,
        review_count: null,
        source: 'meta',
      }
    })

    return data
  } finally {
    await browser.close()
  }
}

// ── API Endpoints ───────────────────────────────────────────

// POST /scrape/reviews
// body: { url: string, source: "trendyol"|"hepsiburada", max?: number }
app.post('/scrape/reviews', async (req, res) => {
  const { url, source, max = 50 } = req.body ?? {}
  if (!url || !source) return res.status(400).json({ error: 'url and source are required' })

  try {
    let reviews = []
    if (source === 'trendyol') {
      reviews = await scrapeTrendyolReviews(url, max)
    } else if (source === 'hepsiburada') {
      reviews = await scrapeHepsiburadaReviews(url, max)
    } else {
      return res.status(400).json({ error: `Unsupported source: ${source}` })
    }
    res.json({ data: reviews, count: reviews.length, source, url })
  } catch (err) {
    console.error('[scraper] reviews error', err)
    res.status(500).json({ error: err.message })
  }
})

// POST /scrape/product
// body: { url: string }
app.post('/scrape/product', async (req, res) => {
  const { url } = req.body ?? {}
  if (!url) return res.status(400).json({ error: 'url is required' })

  try {
    const data = await scrapeProductInfo(url)
    res.json({ data, url })
  } catch (err) {
    console.error('[scraper] product error', err)
    res.status(500).json({ error: err.message })
  }
})

// GET /health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'mso-scraper' }))

app.listen(PORT, () => {
  console.log(`MSO Scraper çalışıyor → http://localhost:${PORT}`)
  if (!SECRET) console.warn('[WARN] SCRAPER_SECRET ayarlanmamış — API korumasız!')
})
