# Vape Express — online store

A mobile-first store for Vape Express (Harare). Customers browse products, pick a flavour, add to cart and send the order to WhatsApp **+263 78 024 7322**. The website never takes payment; payment and delivery are arranged on WhatsApp.

**Stack:** React + Vite static site on Vercel, with Supabase (database, sign-in and image storage) behind the owner's admin dashboard at `/admin`. No secrets in the code.

---

## What's in the store

- **Catalogue:** 6 products from the client brief, imported into the database (originally `public/products.json`, which remains the offline fallback): Tropic Bar 30K, Tropic Bar Ultra, Oxbar Dualblend, Life Pod Eco Kit, Life Pod Eco Pro Pod and Tropic Bar Blast Pod, with every flavour, price, puff count and nicotine value exactly as supplied.
- **Logo:** `public/brand/logo.webp`, cut from the supplied logo file with the Instagram story ring masked off. It's only 242px wide, which is sharp up to about 120px on screen. **Ask the owner for the original high-resolution logo file** and drop it in with the same name.
- **Product photos:** `public/images/*.webp`, cropped from the Instagram post graphics. The price, logo and Instagram on-screen UI (cursor arrow, notification badge) were removed so the site can show live prices. The Tropic Bar 30K image and hero use the higher-resolution post the owner sent. Clean studio product shots would look better; replace any file with the same name when available.
- **Design:** built on the ClientFlow web-design system: a cinematic dark hero, then editorial paper sections with numbered headings, thin rules and a numbered product index (no card grid). Type: Archivo Expanded for headlines (echoes the wide "EXPRESS" in the logo), Inter Tight for body text, IBM Plex Mono for labels and numbers. Colours: ink `#0B0F17`, paper `#F3F2EE`, brand blue `#1E9BFF` (on dark) and `#0B5FD0` (text on light). All tokens are at the top of `src/styles.css`.

## Pages

| Page | Address | What's on it |
|---|---|---|
| Home | `/` | Hero with background video, brand ticker, top picks, three steps, order band |
| Shop | `/shop` | Full catalogue with brand filters, search, puff filter and sorting |
| How to order | `/how-it-works` | The three steps and payment preferences (no online payment) |
| Delivery | `/delivery` | Delivery terms (placeholders until the owner confirms) |
| Contact | `/contact` | WhatsApp and Instagram |
| Admin (owner only) | `/admin` | Sign in / sign up, products, store settings, team. Reached from the small **Admin only** link in the footer; hidden from search engines |

The cart, checkout and product details work on every page. `vercel.json` sends every page address to the app, so direct links and refreshes work.

## Managing the store: the admin dashboard

The owner manages products and store details at **`/admin`** (for example `https://vape-express.vercel.app/admin`). Changes save to the database and show on the live store the next time a page is opened. There's no code to edit, nothing to push to GitHub, and no redeploy.

### What you can do there

**Products tab**
- Search by name or flavour, and filter by brand, type, or status (visible, hidden, out of stock, featured, new).
- **Edit:** name, brand, type, description, price (US$), puffs, nicotine, flavours, photos, status and display order.
- **Hide / Show:** takes a product off the store without deleting it. Hidden products stay in the dashboard.
- **Duplicate:** copies a product, which is handy for a new device in the same range. The copy starts hidden, so change what's different and then switch on **Show in store**.
- **Delete:** asks for confirmation first and can't be undone. Use **Hide** if you might bring the product back.
- **↑ ↓:** moves a product up or down. The store shows products in this order.

**Product editor tips**
- **Price:** leave it empty if the price isn't confirmed. The store then shows "Price on request".
- **Nicotine:** set it once for the product. A flavour only needs its own value when it's different (for example 2% vs 5%). Type `CONFIRM` for a value you haven't verified, and the store shows "To be confirmed".
- **Flavours:** untick **In stock** on a flavour that's sold out. Customers still see it but can't choose it. Turn off **In stock** for the whole product to mark everything sold out.
- **Photos:** upload a JPG, PNG or WebP. It's resized and converted in the browser before upload, so phone photos are fine. Square photos look best.
- **Large home-page photo:** only used when the product is the first **Featured** one.
- **Private notes:** for the owner only. They are never shown on the website.
- **Featured:** the first three featured products are the home page's "Top picks", and the first one is the hero product.

**Team tab**
- **Waiting for approval:** people who used **Sign up** on the admin page. **Approve** gives them full admin access; **Decline** deletes the account. Only approve people you know.
- **Admins:** everyone with access. **Remove** takes access away straight away.

**Store settings tab**
- **WhatsApp order number:** every order and every WhatsApp button uses it. Tap the preview link after changing it to check it opens the right chat.
- Instagram handle and link, and the tagline.
- **Delivery terms:** anything ticked **Not confirmed yet** shows as "Confirm with owner" on the Delivery page. Only enter terms you actually offer.
- **Payment preferences:** choose which options customers can pick at checkout, and tick **Confirmed** once you're sure you accept each one. The website never takes payment or asks for card details.

Saving shows a confirmation message. If something is wrong, the field is highlighted with an explanation, and nothing is saved until it's fixed. If you leave a page with unsaved changes, the browser asks first.

---

## One-time setup (for the developer)

This is done once. After that, all updates happen in the dashboard.

### 1. Supabase project

A Supabase project called **Vape Express** already exists in the ClientFlow Digital organisation (`sjbmemythyggokmesadh`, Frankfurt region). The database tables, security rules, image storage and current catalogue are already installed. To set up a **new** project from scratch instead:

1. Create a project at [supabase.com](https://supabase.com) and open **SQL Editor**.
2. Paste and run each file in **`supabase/migrations/`**, in name order, starting with `20261029000000_admin_dashboard.sql`. This creates the tables, Row Level Security policies and the `product-images` storage bucket.
3. Paste and run **`supabase/seed.sql`**. This imports the six current products, all 30 flavours, the owner notes, contact details, delivery placeholders and payment options from `public/products.json` and `src/config.js`. It's safe to run twice; it never overwrites dashboard changes. If you edit `products.json` before importing, regenerate the file first with `node scripts/make-seed.mjs`.

### 2. Auth settings (Supabase → Authentication)

- **Sign In / Providers → Email:** leave "Allow new users to sign up" **on**. The admin page has a **Sign up** tab. New accounts have no rights and wait in **Team → Waiting for approval** until an existing admin approves them. This is enforced by the database, not the page.
- **URL Configuration:** set **Site URL** to `https://vape-express.vercel.app` (or the custom domain), and add `https://vape-express.vercel.app/admin` to **Redirect URLs**. Confirmation and password-reset emails link back there.
- Optional, for reliable emails: Supabase's built-in email sender only sends a few emails per hour, and only to members of the Supabase organisation. Add your own SMTP under **Authentication → Emails → SMTP settings** so password-reset emails reach the owner. Approval doesn't depend on email: approving an account also confirms it.

### 3. The first admin

1. Open `/admin` (or tap **Admin only** at the bottom of any page), choose **Sign up**, and create the owner's account.
2. Nobody can approve the very first account from the dashboard, so approve it once in **Supabase → SQL Editor**:

   ```sql
   insert into public.admins (user_id, email)
   select user_id, email from public.admin_requests where email = 'owner@example.com';
   update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now()) where email = 'owner@example.com';
   delete from public.admin_requests where email = 'owner@example.com';
   ```

3. Locked out? Set a temporary password in **SQL Editor** (pick your own value), and the owner is asked to choose their own the first time they sign in:

   ```sql
   update auth.users
   set encrypted_password = extensions.crypt('Temporary-Password-123', extensions.gen_salt('bf', 10)),
       raw_user_meta_data = coalesce(raw_user_meta_data, '{}') || '{"must_change_password": true}'
   where email = 'owner@example.com';
   ```

   Signed-in admins can also change their password any time from **Change password** at the bottom of the dashboard.

4. From then on, the owner approves or declines new sign-ups and removes people in the dashboard's **Team** tab. Admins can't remove themselves, so the store always keeps at least one.

### 4. Environment variables (Vercel)

In **Vercel → vape-express → Settings → Environment Variables**, add both for **Production** (and Preview if you want previews connected):

| Name | Where to find the value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL, e.g. `https://sjbmemythyggokmesadh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → **Publishable key** (`sb_publishable_…`) |

Both values are public by design: they are built into the browser code. What a visitor can read or change is controlled by the database's Row Level Security, not by keeping these values secret. **Never** add the `service_role` / secret key to Vercel, `.env` files or this repository. Nothing in this project needs it.

For local development, copy `.env.example` to `.env.local` and fill in the same two values. `.env.local` is ignored by git.

### 5. Deploy once

Merge the `admin-dashboard` branch into `main` (or redeploy after adding the variables). Vercel builds the site with the database connection, and from then on product and settings changes go live from the dashboard.

Until the variables are set, the site keeps working exactly as before from `public/products.json` and `src/config.js`, and `/admin` shows "Admin isn't connected yet".

### After launch: quick live check (5 minutes)

1. Open `/admin` while signed out: you should see the sign-in page only.
2. Sign in as the owner. Change a product's price, save, and open the store in a private window: the new price shows. Change it back.
3. Upload a photo on a test product and check it shows in the store.
4. Add an item to the cart and go to checkout: the total and the WhatsApp message (don't send it) use the current price.

---

## Hosting somewhere other than Vercel (cPanel, Hostinger, Netlify, …)

The website is a set of ready-made files. It doesn't need Node, PHP or a database on your hosting. The **database, sign-in and photos stay on Supabase**, and the website talks to Supabase straight from the visitor's browser. So the store and the admin dashboard keep working wherever the files are hosted, as long as the files were **built with the two Supabase values** (see step 4 above).

**Upload the ready-made files** (`vape-express-website-upload.zip`, or the `dist/` folder after `npm run build`):

1. Unzip it on your computer.
2. In your host's **File Manager**, open the website's root folder (usually `public_html`, or `htdocs` / `www`).
3. Upload **everything inside** the unzipped folder: `index.html`, the `assets`, `images`, `brand`, `media` and `fx` folders, `products.json`, and the hidden **`.htaccess`** file. Upload the contents, not the folder itself.
4. Open your domain. Then open `yourdomain.com/shop`: if it shows the shop rather than a "404" page, `.htaccess` is working.

**Which settings file your host uses:**
- **Apache, cPanel, Hostinger, LiteSpeed:** `.htaccess`. It sends page addresses like `/shop` and `/admin` to the app, forces HTTPS, and keeps `/admin` out of search engines. If you can't see it, turn on "Show hidden files".
- **Netlify, Cloudflare Pages:** `_redirects` and `_headers`. Just drag the folder in.
- **Nginx:** add `try_files $uri $uri/ /index.html;` to the site's `location /` block.

**After moving to your own domain:**
- In **Supabase → Authentication → URL Configuration**, set the **Site URL** to your domain and add `https://yourdomain.com/admin` to **Redirect URLs**. Sign-in works without this, but password-reset emails need it.
- Update the address in `index.html` (search listing) if you want Google to show your domain.

**To rebuild after changing code:** `npm install`, then `npm run build` with `.env.local` filled in (copy `.env.example`), then upload the new `dist/` contents. Product, price and settings changes **don't** need a rebuild; they're made in `/admin`.

## How security works

- **Sign-in:** Supabase Auth with email and password. Sessions are kept in the browser and refreshed automatically. Password-reset links come back to `/admin`.
- **Sign-up needs approval:** anyone can create an account on `/admin`, but a database trigger files it as a request in `public.admin_requests`. It can't read hidden data or change anything until an admin approves it. Approve, decline and remove run as database functions that check the caller is an admin.
- **Admin rights:** an account is an admin only if it's listed in `public.admins`. The website can't write to that list directly; only the approve/remove functions (admins only) or the SQL editor can change it.
- **Row Level Security** on every table:
  - Anyone can read products marked visible, and the store settings.
  - Hidden products, owner notes and the admin list can't be read by the public.
  - Only admins can add, edit, hide or delete products, change settings, or upload and delete images.
- **Images:** the `product-images` bucket is public to view (so the store can show photos) and can't be listed. Only admins can upload, replace or delete. Images only (JPG, PNG, WebP, AVIF), 5 MB max.
- **No secrets in the browser:** only the public publishable key is used.
- `/admin` is excluded from search engines (`noindex`) and can't be embedded in other sites.
- The storefront never loads the admin code or the Supabase library. It reads the catalogue with a small anonymous request.
- **If the database is briefly unreachable:** returning visitors see the last saved catalogue with a notice. First-time visitors see a friendly message with **Try again** and **Order on WhatsApp**.

## Hero background video

The hero plays `public/media/hero.webm` (or `hero.mp4` on browsers without WebM) behind the headline, with `hero-poster.webp` shown instantly while it loads. The current clip was made in Higgsfield, then compressed for the web with the audio removed (about 230–490 KB).

- To replace it, export an 8–10 second clip with the same names into `public/media/`. Keep each file under about 3 MB, with no audio.
- The video is skipped for visitors who use reduced motion or data saver (they see the poster), and it pauses when scrolled off screen.
- To turn it off, set `heroVideo.enabled = false` in `src/config.js`.

## Preview and deploy

```bash
npm install
npm run dev        # local preview at http://localhost:5173 (uses .env.local if present)
npm run build      # production build into /dist
```

Vercel builds from GitHub automatically: pushing to `main` deploys production, and other branches get preview links.

---

## Needs owner confirmation

| # | Item | Where to fix it |
|---|------|-----------------|
| 1 | **Tropic Bar Ultra, Blue Razz.** Nicotine strength unknown (shown as "To be confirmed"), and it's not confirmed that Blue Razz is the Ultra device. | Admin → Products |
| 2 | **Tropic Bar Blast Pod price.** $8 was read from a cut-off graphic. | Admin → Products |
| 3 | **Life Pod Eco Kit nicotine.** The graphic says 4.5%, the caption says 5% (site shows 5%). | Admin → Products |
| 4 | **Life Pod Eco Pro "Cherry Hulls".** Copied as written; possibly a typo. Also confirm whether the pod needs the Eco Kit device, and say so in the product's Description if it does. | Admin → Products |
| 5 | **"New" badge on Tropic Bar Ultra.** Based on it being the newest post. The "Top picks" choice (30K, Ultra, Oxbar) is a design choice for the owner to approve. | Admin → Products |
| 6 | **Stock levels.** Nothing is marked sold out because no stock data was supplied. The owner can now set this per flavour. | Admin → Products |
| 7 | **High-resolution logo** and, ideally, clean product photos. | `public/brand/`; product photos via Admin |
| 8 | **"Imbax" vs InnBucks.** The site assumes InnBucks. | Admin → Store settings |
| 9 | Which payment methods are actually accepted: EcoCash, InnBucks, bank transfer, USD cash on arrival. | Admin → Store settings |
| 10 | Delivery fees, areas, times, collection, minimum order, opening hours, returns, warranty (all shown as `[CONFIRM WITH OWNER]`). | Admin → Store settings |
| 11 | Instagram URL (`instagram.com/vapeexpresszw` assumed from the handle). | Admin → Store settings, and `index.html` (search listing) |
| 12 | WhatsApp +263 78 024 7322 is the right orders line. | Admin → Store settings |
| 13 | **Legal:** the 18+ screen is a self-declaration only. Confirm which age-verification, advertising and nicotine-warning rules apply in Zimbabwe before launch. | Owner |
| 14 | **Who gets admin access.** Which email the owner will sign in with, and whether anyone else (staff, ClientFlow support) should have an account. | Supabase → Authentication |
| 15 | The brief's bio line "Best vape shop out there" was **not** used, because it's an unverifiable claim. | n/a |

## How it's built (for developers)

```
public/products.json          original catalogue: one-time import source + fallback when Supabase isn't configured
src/config.js                 default business, payment, delivery and hero-video settings (overridden by the dashboard)
src/lib/backend.js            env vars + anonymous read-only fetch to Supabase (no SDK on the storefront)
src/lib/catalogue.js          loads + normalises products (database or products.json), flags CONFIRM values
src/lib/settings.js           applies dashboard settings; caches the last good store for outages
src/lib/useCart.js            cart state in localStorage; reconcileCart() re-prices and drops unavailable lines
src/lib/whatsapp.js           wa.me links built with URLSearchParams; order message format
src/components/               storefront: AgeGate, Header, Hero, Shop, ProductCard, ProductModal, CartDrawer, …
src/admin/                    /admin (separate bundle): AdminApp (auth gate + routes), Auth, ProductList,
                              ProductEditor, Settings, Team, data.js (Supabase calls), admin.css
supabase/migrations/          schema, RLS policies, storage bucket + policies
supabase/seed.sql             one-time import (generated by scripts/make-seed.mjs)
```

- Dialogs use the native `<dialog>` element, so focus trapping and Escape-to-close work by default.
- The hero's motion is CSS-only (transform and opacity) and finishes in under 1.5 s. It is removed under `prefers-reduced-motion`, and ambient motion pauses while the tab is hidden.
- If a browser blocks the WhatsApp popup, the checkout always shows a manual "Open WhatsApp with my order" button.
- Product IDs (used in cart keys) are created from the name when a product is added and never change, so saved carts keep working after edits.
