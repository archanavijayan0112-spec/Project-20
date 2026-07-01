# Project-20
Shelf sense 2
[README.md](https://github.com/user-attachments/files/29536802/README.md)
# Shelfsense

An e-commerce storefront with AI-powered, personalized product recommendations — built with **Next.js (App Router)**, **MongoDB**, **TensorFlow.js**, and **Stripe** (with a built-in mock-payment fallback so it's testable without a Stripe account).

This is the **deployment-ready** version: it talks to real MongoDB and is set up to deploy straight to Vercel. See "Deploying to Vercel" below for the full walkthrough.

The product catalog is fixed, but the *order* the storefront shows things in is not: every view, cart-add, and purchase is logged as a weighted implicit signal, a small neural matrix-factorization model trains on that signal, and the storefront ranks the catalog per-user by embedding similarity at request time.

## Features

- **Product catalog** — 39 products across 10 categories, filterable and searchable.
- **AI-powered recommendations** — a trained recommender ranks the catalog per user; logged-out visitors see a popularity fallback.
- **Cart & checkout** — client-side cart, real Stripe Checkout if configured, otherwise a built-in mock payment flow that completes orders for real (no Stripe account needed to demo it).
- **User accounts & order history** — email/password auth (JWT in an httpOnly cookie), profile page with past orders.
- **Full training pipeline** — `ml/train.js` trains a TensorFlow.js model and saves both a portable model artifact and per-product embeddings.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router, Route Handlers) |
| Database | MongoDB via Mongoose |
| ML | TensorFlow.js (`@tensorflow/tfjs`) — neural matrix factorization |
| Payments | Built-in mock checkout by default; drop-in swap for live Stripe Checkout + webhooks |
| Styling | Tailwind CSS |
| Auth | JWT in an httpOnly cookie, bcrypt password hashing |
| Client state | Zustand (in-memory cart) |

## How the recommender works

```
views / cart-adds / purchases  →  interactions collection (lib/track.js)
                                          │
                                          ▼
                         ml/train.js  (run offline / on a schedule)
                         ├─ blends in synthetic shoppers (ml/data.js) so the
                         │  model has signal even on day one
                         ├─ trains a 2-tower embedding model:
                         │    user_embedding · item_embedding → sigmoid → affinity
                         ├─ saves ml/models/recommender/  (model.json + weights.bin)
                         ├─ saves ml/models/item-embeddings.json
                         └─ writes the learned vector onto each Product.embedding
                                          │
                                          ▼
                    lib/recommend.js  (runs on every request, no TF needed)
                    ├─ builds a "user vector": weighted average of the
                    │  embeddings of everything that user has interacted with
                    ├─ ranks all products by cosine similarity to that vector
                    ├─ applies a light per-category diversity pass
                    └─ falls back to favoriteCategories + popularity for
                       brand-new ("cold start") users
```

Splitting training (TensorFlow, offline, in `ml/`) from inference (plain array math, online, in `lib/recommend.js`) is deliberate: the request path never has to load TensorFlow at all, which keeps `/api/recommendations` fast.

Implicit signal weights (`lib/track.js`): `view = 1`, `add_to_cart = 3`, `purchase = 8`.

## Project structure

```
app/
  page.js                    Home: hero + recommendation rail + filterable catalog
  product/[slug]/page.js     Product detail page
  cart/page.js                Cart + checkout trigger
  login/, register/, profile/ Auth pages, order history
  checkout/success/page.js   Post-payment confirmation
  checkout/mock/[orderId]/   Built-in mock payment page (used when Stripe isn't configured)
  api/
    auth/{register,login,logout,me}/route.js
    products/route.js, products/[slug]/route.js
    recommendations/route.js  ← the AI recommendation endpoint
    track/route.js             Logs add_to_cart events from the client
    checkout/route.js          Creates a Stripe Checkout session, or a mock order
    checkout/mock/[orderId]/confirm/route.js   Confirms a mock payment
    webhook/stripe/route.js    Confirms real Stripe payments, logs purchase interactions
    orders/route.js, orders/[orderId]/route.js, orders/by-session/[sessionId]/route.js
components/         Navbar, ProductCard, RecommendationRail
lib/                 db connection, auth, cart store, recommender, stripe, formatting
models/              User, Product, Order, Interaction (Mongoose schemas)
ml/
  data.js             Synthetic interaction generator
  train.js            Training script — run with `npm run train`
  models/             Written by train.js (gitignored, generated)
scripts/
  seed.js             Seeds the catalog + a demo user — run with `npm run seed`
```

## Database setup

You need a MongoDB connection string. The free tier of MongoDB Atlas is the easiest path if you don't already have one:

1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Create a free (M0) cluster — any region is fine.
3. Under **Database Access**, add a database user with a username/password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — fine for a demo project; tighten this for anything real.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Add a database name to the path so collections land somewhere predictable, e.g. `.../shelfsense?retryWrites=true&w=majority`.

(Running locally instead is also fine — install MongoDB Community Edition and use `mongodb://localhost:27017/shelfsense`.)

## Running locally

```bash
npm install
cp .env.example .env.local   # then paste in MONGODB_URI and a JWT_SECRET
npm run seed                  # populates the catalog + a demo account
npm run train                 # trains the recommender (~10 seconds)
npm run dev                    # http://localhost:3000
```

Sign in with the seeded demo account: **demo@shelfsense.app / password123** — or register your own.

Add something to your cart and check out. With no `STRIPE_SECRET_KEY` set, you'll land on a built-in mock payment page (pre-filled with a fake test card) instead of a real Stripe page. Click pay, and the order completes for real: it's marked paid, logged to your order history, and counted as a purchase signal for your recommendations the next time `npm run train` runs.

## Deploying to Vercel

1. **Push to GitHub.** Create a new repo and push this project (`git init && git add . && git commit -m "Shelfsense" && git remote add origin <your-repo-url> && git push -u origin main`). `node_modules`, `.next`, and `ml/models` are already gitignored.
2. **Import into Vercel.** Go to [vercel.com/new](https://vercel.com/new), sign in with GitHub, and import the repo. Vercel auto-detects Next.js — no build config changes needed.
3. **Add environment variables.** In the Vercel project's *Settings → Environment Variables*, add:
   - `MONGODB_URI` — your Atlas connection string from above.
   - `JWT_SECRET` — a long random string (e.g. `openssl rand -base64 32`).
   - `NEXT_PUBLIC_BASE_URL` — your Vercel URL, e.g. `https://your-project.vercel.app` (you can add this after the first deploy once you know the URL, then redeploy).
   - Stripe vars only if you're using live Stripe (see below) — otherwise leave them unset and the mock checkout works automatically.
4. **Deploy.** Vercel builds and deploys automatically on push. First deploy takes a couple of minutes.
5. **Seed the live database.** The seed/train scripts run locally against whatever `MONGODB_URI` is in your `.env.local`, not against Vercel directly — that's normal, since they both point at the same Atlas cluster. Locally:
   ```bash
   # make sure .env.local has the SAME MONGODB_URI as your Vercel env vars
   npm run seed
   npm run train
   ```
   This populates the live database your deployed app reads from.

That's it — your live URL will have the full catalog, working auth, the trained recommender, and a working (mock) checkout.

### Using real Stripe instead of the mock checkout (optional)

`lib/stripe.js`'s `getStripe()` returns `null` until you set a real `STRIPE_SECRET_KEY` (starting with `sk_`), at which point `app/api/checkout/route.js` automatically switches from the mock flow to creating a real Stripe Checkout session, and `app/api/webhook/stripe/route.js` confirms payment instead of the mock confirm route. To wire it up:

1. Get test-mode keys from your [Stripe dashboard](https://dashboard.stripe.com/test/apikeys).
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to your env vars (locally and on Vercel).
3. In the Stripe dashboard, add a webhook endpoint pointing at `https://your-project.vercel.app/api/webhook/stripe`, listening for `checkout.session.completed`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. To test locally before deploying: `stripe listen --forward-to localhost:3000/api/webhook/stripe`, copy the printed `whsec_...` into `.env.local`, and use Stripe's [test card `4242 4242 4242 4242`](https://docs.stripe.com/testing).

## Extending this project

- **Multi-vendor support** — add a `Vendor` model, a `vendor` ref on `Product`, and a vendor-scoped dashboard for managing listings and viewing payouts.
- **Advanced analytics** — the `interactions` collection already has everything needed for funnels (view → cart → purchase) and cohort analysis; a simple aggregation pipeline + chart page would surface it.
- **Custom recommendation algorithms** — `ml/train.js` is intentionally a single, readable file. Swap matrix factorization for a two-tower model with content features (price, tags) concatenated into the item tower, or add a re-ranking step that boosts in-stock / high-margin items.
- **Real interaction volume** — once the store has organic traffic, drop the synthetic-shopper blend in `ml/train.js` (or lower its weight) so the model trains purely on real behavior. Re-run `npm run train` on a schedule (cron, GitHub Action) to keep it fresh.

## Notes

- The cart is kept in memory (Zustand) rather than `localStorage`, so it resets on a hard refresh — swap in a server-persisted `Cart` collection if you want it to survive across sessions/devices.
- All prices are stored in cents (Stripe's `unit_amount` convention) and formatted with `Intl.NumberFormat` in `lib/format.js`.
- `ml/models/` and `node_modules/` are gitignored; run `npm install` and `npm run train` after cloning.

