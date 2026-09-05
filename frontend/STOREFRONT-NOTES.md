# Storefront redesign

The storefront uses the existing catalog without modifying imported products, inventory, sales, or original categories. Seven storefront collections are derived by StorefrontCatalog; category counts and filters share the same classification. Imported generic categories use product names to determine their collection.

Home collections request products with images. The showcase displays a balanced selection across collections when sales counts are zero, and automatically uses the sales ranking when sales exist. Out-of-stock cards cannot add products to the cart. Original product photography is used for product cards; generated imagery is decorative collection photography.

Preview: http://localhost:3001

Validation: Next.js production build and TypeScript passed; lint passed for modified frontend files; PHP syntax passed; StorefrontCatalogTest passed (8 assertions); live API checks passed for 252 products, seven collection counts, subcategory filtering, nonoverlapping pagination and both price sort directions. All 22 remote product image URLs returned HTTP 200 with image content types. Browser runtime reported no available browser, so interactive visual verification could not be performed.

Generated assets (built-in image_gen, no CLI):
- public/images/storefront/fishing-hero.png
- public/images/storefront/camp-editorial.png

Final fishing prompt:
Use case: ads-marketing. Create a premium photorealistic editorial website hero photograph for MSO, a Turkish fishing and outdoor equipment shop. Wide landscape 1536x1024. A quiet deep teal mountain lake at dawn with layered misty forest mountains in the background. On the right half, a beautifully detailed black and bronze fishing spinning reel attached to a graphite fishing rod lies diagonally on a weathered dark wooden jetty, a small tackle box and two realistic colorful fishing lures beside it. Subtle warm morning sunlight from upper right; cinematic editorial photography, rich natural textures, sophisticated muted pine green, charcoal and amber palette. Left 55 percent primarily uncluttered dark lake and forest for white text overlay. No people, no text, no logos, no watermarks. Realistic equipment not fantasy. This is an atmospheric category banner, not a specific branded product photo.

Final camping prompt:
Use case: ads-marketing. Premium photorealistic editorial banner photograph for an outdoor equipment shop. Wide landscape 1536x1024. Quiet pine forest at blue hour with warm amber glow from a compact black camping lantern standing on a rustic wooden camp table on the right alongside a rolled olive canvas bag and a stainless steel camping mug. Tent softly blurred in background on far right, atmospheric mist among pine trees. Left half uncluttered dark pine forest for white text overlay. Sophisticated deep forest green, charcoal, moss and warm amber palette. Cinematic natural product lifestyle photography, tactile materials, no people, no lettering, no brand logos or watermark. Beautiful editorial magazine quality. Objects fill right half, no knives.

The previous automatic discount popup was removed from the global layout because it generates an unverified coupon. WhatsApp appears only when NEXT_PUBLIC_WHATSAPP_PHONE is configured. Existing detailed product, account, checkout and seller pages retain their internal design; the shared header/footer and product cards are refreshed.

