# Vape Express — online store

A mobile-first store for Vape Express (Harare). Customers browse products, pick a flavour, add to cart and send the order to WhatsApp **+263 78 024 7322**. The website never takes payment; payment and delivery are arranged on WhatsApp.

**Stack:** React + Vite, static output. No backend, no secrets, deploys to Vercel as-is.

---

## What's in the store

- **Catalogue:** 6 products from the client brief (`public/products.json`): Tropic Bar 30K, Tropic Bar Ultra, Oxbar Dualblend, Life Pod Eco Kit, Life Pod Eco Pro Pod and Tropic Bar Blast Pod, with every flavour, price, puff count and nicotine value exactly as supplied.
- **Logo:** `public/brand/logo.webp`, cut from the supplied logo file with the Instagram story ring masked off. It's only 242px wide, which is sharp up to about 120px on screen. **Ask the owner for the original high-resolution logo file** and drop it in with the same name.
- **Product photos:** `public/images/*.webp`, cropped from the Instagram post graphics. The price, logo and Instagram on-screen UI (cursor arrow, notification badge) were removed so the site can show live prices. The Tropic Bar 30K image and hero use the higher-resolution post the owner sent. Clean studio product shots would look better; replace any file with the same name when available.
- **Design:** built on the ClientFlow web-design system: a cinematic dark hero, then editorial paper sections with numbered headings, thin rules and a numbered product index (no card grid). Type: Archivo Expanded for headlines (echoes the wide "EXPRESS" in the logo), Inter Tight for body text, IBM Plex Mono for labels and numbers. Colours: ink `#0B0F17`, paper `#F3F2EE`, brand blue `#1E9BFF` (on dark) and `#0B5FD0` (text on light). All tokens are at the top of `src/styles.css`.

## Updating products, prices and flavours

Everything lives in **`public/products.json`**. Edit it, save, and redeploy.

```json
{
  "products": [
    {
      "id": "unique-short-id",
      "name": "Product name",
      "brand": "Brand",
      "category": "Disposable",
      "puffs": "12000",
      "price": 15,
      "image": "/images/my-photo.jpg",
      "featured": true,
      "new": true,
      "description": "Optional short description.",
      "flavours": [
        { "name": "Flavour name", "nicotine": "5%", "stock": "available" },
        { "name": "Another flavour", "nicotine": "5%", "stock": "out" }
      ]
    }
  ]
}
```

- **Price:** a number in USD (`15`, not `"$15"`). If it's unknown, write `"CONFIRM"` and the site shows "Price on request".
- **Nicotine:** set it once on the product (`"nicotine": "5%"`), or per flavour when strengths differ (see Tropic Bar Ultra).
- **Any unverified value:** write `"CONFIRM"` and the site shows "To be confirmed" instead of guessing.
- **Sold out flavour:** add `"inStock": false` to that flavour. Customers can still see it but can't select it. If you leave it out, the flavour counts as available. Plain-text flavours like `"Mango"` become `{ "name": "Mango", "inStock": false }`.
- **Hero image:** `"heroImage"` on a featured product sets the large hero picture. Otherwise its normal image is used.
- **Notes:** `"notes"` is for the owner only and never shown on the site.
- **Featured / new:** `"featured": true` puts a product in the "Top picks" row (the first featured product also appears in the hero). `"new": true` adds a pink "New" badge.
- **Photos:** square images around 800×800px, JPG or WebP, under 200 KB each.

## Updating payment options, delivery terms and contact details

Edit **`src/config.js`**:

- `paymentMethods`: rename a method, or set `enabled: false` to hide it.
- `delivery`: replace each `[CONFIRM WITH OWNER]` with the real wording. Placeholders appear on the site as dashed orange tags, so nothing is hidden by accident.
- `business`: WhatsApp number, Instagram link, tagline.

## Hero background video

The hero plays `public/media/hero.webm` (or `hero.mp4` on browsers without WebM) behind the headline, with `hero-poster.webp` shown instantly while it loads. The current clip was made in Higgsfield, then compressed for the web with the audio removed (about 230–490 KB).

- To replace it, export an 8–10 second clip with the same names into `public/media/`. Keep each file under about 3 MB, with no audio.
- The video is skipped for visitors who use reduced motion or data saver (they see the poster), and it pauses when scrolled off screen.
- To turn it off, set `heroVideo.enabled = false` in `src/config.js`.

## Preview and deploy

```bash
npm install
npm run dev        # local preview at http://localhost:5173
npm run build      # production build into /dist
```

**Vercel:** push this folder to a GitHub repo, import it in Vercel, keep the default "Vite" settings, and deploy. Any later edit to `products.json` or `config.js` goes live on the next push.

---

## Needs owner confirmation

| # | Item | Where to fix it |
|---|------|-----------------|
| 1 | **Tropic Bar Ultra, Blue Razz.** Nicotine strength unknown (shown as "To be confirmed"), and it's not confirmed that Blue Razz is the Ultra device. | `products.json` |
| 2 | **Tropic Bar Blast Pod price.** $8 was read from a cut-off graphic. | `products.json` |
| 3 | **Life Pod Eco Kit nicotine.** The graphic says 4.5%, the caption says 5% (site shows 5%). | `products.json` |
| 4 | **Life Pod Eco Pro "Cherry Hulls".** Copied as written; possibly a typo. Also confirm whether the pod needs the Eco Kit device, and say so in a `description` if it does. | `products.json` |
| 5 | **"New" badge on Tropic Bar Ultra.** Based on it being the newest post. The "Top picks" choice (30K, Ultra, Oxbar) is a design choice for the owner to approve. | `products.json` |
| 6 | **Stock levels.** Nothing is marked sold out because no stock data was supplied. | `products.json` |
| 7 | **High-resolution logo** and, ideally, clean product photos. | `public/brand/`, `public/images/` |
| 8 | **"Imbax" vs InnBucks.** The site assumes InnBucks. | `src/config.js` → `paymentMethods` |
| 9 | Which payment methods are actually accepted: EcoCash, InnBucks, bank transfer, USD cash on arrival. | `src/config.js` |
| 10 | Delivery fees, areas, times, collection, minimum order, opening hours, returns, warranty (all shown as `[CONFIRM WITH OWNER]`). | `src/config.js` → `delivery` |
| 11 | Instagram URL (`instagram.com/vapeexpresszw` assumed from the handle). | `src/config.js`, `index.html` |
| 12 | WhatsApp +263 78 024 7322 is the right orders line. | `src/config.js` |
| 13 | **Legal:** the 18+ screen is a self-declaration only. Confirm which age-verification, advertising and nicotine-warning rules apply in Zimbabwe before launch. | Owner |
| 14 | The brief's bio line "Best vape shop out there" was **not** used, because it's an unverifiable claim. | n/a |

## How it's built (for developers)

```
public/products.json      catalogue (source of truth, fetched at runtime)
src/config.js             business, payment, delivery, hero-video settings
src/lib/catalogue.js      loads + normalises products, flags CONFIRM values
src/lib/useCart.js        cart state (one line per product + flavour), saved in localStorage
src/lib/whatsapp.js       wa.me links built with URLSearchParams; order message format
src/components/           AgeGate, Header, Hero, Shop, ProductCard, ProductModal,
                          CartDrawer (cart + checkout), InfoSections, Footer, Dialog
src/styles.css            tokens, layout, hero intro animation, reduced-motion rules
```

- Dialogs use the native `<dialog>` element, so focus trapping and Escape-to-close work by default.
- The hero's motion is CSS-only (transform and opacity) and finishes in under 1.5 s. It is removed under `prefers-reduced-motion`, and ambient motion pauses while the tab is hidden.
- If a browser blocks the WhatsApp popup, the checkout always shows a manual "Open WhatsApp with my order" button.
