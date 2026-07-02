# மளிகை கடை Stock Register

Simple, free stock/inventory tracker for a maligai kadai. Pure HTML/CSS/JS —
no build step, no backend, no cost. Data saves in the browser's local storage
on whatever device you open it on.

## Features
- Add / edit / delete items with category, quantity, unit, price, low-stock threshold
- Quick +/− buttons to adjust stock fast (billing counter la use panna easy)
- Low-stock badge + dashboard stats (total items, total stock value, low count)
- Search + filter (all / low stock)
- Backup (export JSON) and Restore (import JSON) — so data safe irukum

## Run locally
Just double-click `index.html`, or serve it:
```
npx serve .
```

## Deploy — GitHub + Netlify (free)

### 1. Push to GitHub
```bash
cd maligai-stock
git init
git add .
git commit -m "Initial commit: maligai kadai stock app"
git branch -M main
git remote add origin https://github.com/<your-username>/maligai-stock.git
git push -u origin main
```
(GitHub la `maligai-stock` peru la oru new empty repo create pannunga, adha oda URL
la mela `<your-username>` maathunga.)

### 2. Deploy on Netlify
1. https://app.netlify.com ku poyi GitHub account oda login pannunga.
2. **Add new site → Import an existing project** click pannunga.
3. GitHub select pannunga, `maligai-stock` repo select pannunga.
4. Build settings: **Build command** — வெறுமையா விடுங்க (empty), **Publish directory** — `.` (root).
5. **Deploy site** click pannanga — 30 seconds la live URL varum (`something.netlify.app`).

Adhukku apram, GitHub la `main` branch ku edhavadhu push panna, automatic ah
Netlify redeploy aagum.

### Optional: custom domain
Netlify site settings → Domain management la free `.netlify.app` subdomain ah
maathi konga peru vachikalam, illa unga own domain add pannikalam.

## Important note on data
Data browser oda `localStorage` la than irukku — so idhu **device/browser
specific**. Phone oda laptop rendulayum same data venumna, **Backup** button
click panni JSON file eduthu, matha device la **Restore** panni load pannunga.
Multi-device real-time sync venumna, adhukku backend (e.g. Supabase/Firebase)
add pannanum — sollunga, adha next step ah build panni tharen.
