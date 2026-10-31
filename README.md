# ShopNest

A responsive e-commerce storefront built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Redux Toolkit**, **TanStack Query** and **Tailwind CSS v4**. Product data comes from the [FakeStore API](https://fakestoreapi.com). There is no backend: authentication, orders and token refresh are simulated in the browser (see [Architecture decisions](#architecture-decisions)).

- **Live demo:** _add your Vercel URL here_
- **Demo login:** sign up with any 10-digit Indian mobile number (starting 6–9). The OTP is always **`111111`**.

---

## Features

| Area                  | What's included                                                                                                                                                                                                                                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home                  | Hero with a load animation, shop-by-category tiles, customer favourites, deals band                                                                                                                                                                                                                                                                                |
| Product listing (PLP) | Search, multi-category filter, type, **dual-handle price slider** + presets, rating, **in-stock toggle**, custom **sort menu** (keyboard accessible). State lives in the URL. **Infinite scroll (8 per page) + window virtualization**, filter counts, active-filter chips, sticky filter sidebar that follows the header, mobile filter sheet, "no results" state |
| Product detail (PDP)  | Image gallery with hover zoom, variants (size / finish / warranty with price changes and out-of-stock options), quantity, Add to cart, Buy now, delivery estimate, similar products                                                                                                                                                                                |
| Header                | Debounced live search with suggestions and keyboard navigation, desktop mega menu, mobile drawer, cart badge, hide-on-scroll (throttled)                                                                                                                                                                                                                           |
| Auth                  | Login and signup with mobile + OTP, form validation, resend timer, access + refresh tokens with automatic refresh                                                                                                                                                                                                                                                  |
| Guest rules           | Guests can see prices and the Add to cart button. Clicking it opens a **login popup**; the item is remembered and added right after login. Cart, checkout, order confirmation and My Account are protected                                                                                                                                                         |
| Cart                  | Quantity updates, remove with undo, price breakdown, free-delivery progress bar, empty state                                                                                                                                                                                                                                                                       |
| Checkout              | 3 steps (address, payment, review) with validation, order placed via `POST /carts`                                                                                                                                                                                                                                                                                 |
| Order confirmation    | Animated confirmation, delivery date, items and payment summary                                                                                                                                                                                                                                                                                                    |
| My Account            | Profile view/edit (`PUT /users/:id`), virtualized order history, cancel order (`DELETE /carts/:id`), log out                                                                                                                                                                                                                                                       |
| States                | Skeletons for every async view, error boundaries per section and per route, toasts on every action, empty states, 404 page                                                                                                                                                                                                                                         |

## Tech stack

- **Framework:** Next.js 16.4 (App Router, Cache Components, Partial Prerendering, Turbopack for dev and build)
- **Language:** TypeScript (strict)
- **State:** Redux Toolkit (client state) + TanStack Query (server state and caching)
- **Styling:** Tailwind CSS v4, self-hosted variable fonts (Bricolage Grotesque, Plus Jakarta Sans)
- **Forms:** React Hook Form + Zod
- **Lists:** TanStack Virtual
- **Toasts:** Sonner · **Icons:** Lucide
- **Testing:** Jest + React Testing Library (117 tests)
- **Quality:** ESLint (Next.js + React Hooks/Compiler rules) + Prettier (with Tailwind class sorting)
- **CI/CD:** GitHub Actions (lint, format, type-check, test, build, deploy to Vercel)

## Getting started

Requirements: **Node.js 20.9+** (22 recommended) and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env.local
#    then change NEXT_PUBLIC_ENCRYPTION_KEY and NEXT_PUBLIC_TOKEN_SECRET to long random strings

# 3. Start the dev server (Turbopack)
npm run dev
# open http://localhost:3000
```

### Environment variables

| Variable                     | Purpose                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL`   | API base URL (`https://fakestoreapi.com`)                                                                                  |
| `NEXT_PUBLIC_SITE_URL`       | Public site URL, used for canonical URLs, sitemap and Open Graph. Optional on Vercel (falls back to the production domain) |
| `NEXT_PUBLIC_ENCRYPTION_KEY` | Key for AES-GCM encryption of cookie values                                                                                |
| `NEXT_PUBLIC_TOKEN_SECRET`   | Secret used to sign the mock JWTs                                                                                          |

### Scripts

| Command                                   | Description                             |
| ----------------------------------------- | --------------------------------------- |
| `npm run dev`                             | Dev server with Turbopack               |
| `npm run build` / `npm start`             | Production build (Turbopack) and server |
| `npm run lint` / `npm run lint:fix`       | ESLint                                  |
| `npm run format` / `npm run format:check` | Prettier                                |
| `npm run typecheck`                       | TypeScript, no emit                     |
| `npm test` / `npm run test:coverage`      | Jest                                    |
| `npm run validate`                        | Lint + format + type-check + tests      |

## Project structure

```
src/
├── app/                    Routes (App Router), metadata, sitemap.ts, robots.ts, manifest.ts
│   ├── products/           PLP (page.tsx) and PDP ([slug]/page.tsx)
│   ├── login/ signup/      Auth pages
│   ├── cart/ checkout/     Protected pages
│   ├── order-confirmation/[orderId]/
│   ├── account/
│   ├── error.tsx, global-error.tsx, not-found.tsx
│   └── layout.tsx          Fonts, providers, header/footer, Organization JSON-LD
├── components/
│   ├── ui/                 Small reusable building blocks (Button, Input, Modal, Skeleton, Price…)
│   ├── layout/             Header, SearchBar, NavBar + MegaMenuPanel, MobileMenu, Footer
│   ├── product/            ProductCard, ProductGrid (virtualized), listing, filters, detail
│   ├── auth/ cart/ checkout/ account/ home/
│   ├── common/             ErrorBoundary, RouteError
│   └── seo/                JsonLd
├── config/env.ts           Typed env access
├── constants/              All hard-coded values: routes, messages, catalog, API endpoints…
├── hooks/                  useDebounce, useDebouncedCallback, useThrottledCallback,
│                           useProductFilters, useAddToCart, useMediaQuery, useScrollState…
├── lib/                    Pure helpers: pricing, filters, mapper, crypto, token, SEO, validation
│   └── server/products.ts  Server-only cached data ("use cache" + cacheLife)
├── providers/              Redux store, TanStack Query client, session bootstrap
├── services/
│   ├── api/client.ts       The single HTTP client (GET, POST, PUT, DELETE)
│   ├── api/headers.ts      The single place headers are built
│   ├── auth/               Mock auth server + token manager (refresh, single-flight)
│   ├── queries/            TanStack Query keys and options
│   └── *.service.ts        Product, auth and order APIs
├── store/                  Redux Toolkit slices, memoised selectors, persistence middleware, thunks
├── proxy.ts                Route protection (Next 16's replacement for middleware)
├── types/
└── __tests__/              Jest tests
```

## Architecture decisions

### API layer

- `services/api/client.ts` exposes `apiClient.get / post / put / delete`. All four go through one `request()` function that applies the base URL from `.env`, a 10 s timeout, retry with exponential backoff (GET only), JSON parsing and conversion of every failure into a typed `ApiError`.
- `services/api/headers.ts` is the only place headers are built (`Accept`, `Content-Type`, `Authorization`, client id). The client calls it once per request, so individual API calls never pass headers.
- On a `401`, the client refreshes the access token once and replays the request. If the refresh fails, the session ends and the user is sent to login.

### Authentication (mocked)

FakeStore has no OTP, no persistent signup and no refresh tokens, so `services/auth/mock-auth-server.ts` acts as the backend:

- Users are stored **encrypted** in localStorage. The OTP is always `111111`.
- It issues HS256-signed JWTs: a **15-minute access token** and a **7-day refresh token**.
- `token-manager.ts` refreshes the access token shortly before it expires. Concurrent callers share one in-flight refresh, and the refresh token is rotated each time.
- Signup and profile updates are also sent to FakeStore (`POST /users`, `PUT /users/:id`) to exercise the real API.

### Security notes

- Tokens, user id and profile are stored in **cookies**, each value **AES-256-GCM encrypted** (key derived with PBKDF2) and set with `SameSite=Strict` and `Secure` on HTTPS.
- `proxy.ts` decrypts the refresh-token cookie and verifies its signature and expiry before allowing protected routes. It also clears invalid cookies and blocks open redirects.
- **Limitation:** without a backend, cookies cannot be `httpOnly` and the encryption key is part of the client bundle. This protects against casual inspection and cookie tampering, not a determined attacker. With a real backend, tokens would be issued in `httpOnly` cookies by the server and the key would never reach the browser.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`) are set in `next.config.ts`. JSON-LD output is escaped against `</script>` injection.

### State management

- **TanStack Query** owns server data (products). The PLP, header search, mega menu and PDP share one cached query: one request serves all of them (`staleTime` 5 min, `gcTime` 30 min).
- **Redux Toolkit** owns client state: auth, cart, orders and the login popup.
  - Cart and orders use `createEntityAdapter` (normalised). Each `CartLine` subscribes to its own line by id, so editing one line does not re-render the others.
  - Totals come from memoised `createSelector` selectors.
  - A listener middleware saves each user's cart and orders to localStorage, debounced.

### Rendering, caching and performance

- **Home and all 20 product pages are pre-rendered** at build time with `'use cache'` + `cacheLife('hours')`, so they are revalidated hourly (ISR).
- The **PLP** is partially pre-rendered: a static shell plus a streamed listing that reads `searchParams`, so crawlers get full HTML for any filter URL. Filter changes after load use `history.replaceState` inside a transition, with filtering on a deferred value: no server round-trip, and clicks stay responsive (INP).
- **LCP:** the hero headline is text; first-row product images load eagerly with `fetchPriority="high"`; the PDP main image uses `preload`. Fonts are self-hosted with a size-adjusted fallback.
- **CLS:** every skeleton matches its final layout, images have fixed aspect ratios, and `scrollbar-gutter: stable` prevents layout jumps.
- **Code splitting:** `next/dynamic` is used for the mega menu, mobile menu, mobile filter sheet, login popup and React Query devtools.
- **Re-renders:** `React.memo` on cards, rows, chips and filter panels; `useCallback`/`useMemo` where a memoised child or expensive computation needs it (not everywhere); `useAppStore` in the add-to-cart hook reads state at click time instead of subscribing.
- **Debounce:** search input (300 ms), custom price range (500 ms), cart persistence.
- **Throttle:** scroll handling (header, back-to-top) and Add to cart clicks.
- **Infinite scroll + virtualization (PLP):** `useInfiniteQuery` loads 8 products per page; the next page is requested when the virtualizer reaches the last loaded rows (a "Load more" button remains as a fallback). `useWindowVirtualizer` keeps only the visible rows in the DOM, so the page stays light however many products are loaded. The first page is server-rendered for SEO/LCP. FakeStore has no pagination, so `productQueries.pages()` acts as a mock paginated endpoint over the cached catalogue; with a real API only its `queryFn` changes.
- **Virtualization elsewhere:** order history is always virtualized.
- **Resilience:** if FakeStore is unreachable, the app falls back to a bundled snapshot of the catalogue, so the store never shows a blank page.

### SEO

- Per-page `metadata` / `generateMetadata` with title template, description, **canonical URL**, Open Graph and Twitter cards.
- PLP canonical rules: a single-category listing is canonical to itself; every other filter combination points to `/products`. Search result pages are `noindex`.
- **JSON-LD:** Organization + WebSite (with SearchAction) site-wide, ItemList on home and PLP, Product (Offer + AggregateRating) and BreadcrumbList on PDPs.
- `sitemap.xml` (home, listing, categories, every product with image) and `robots.txt` (private routes disallowed) are generated by `app/sitemap.ts` and `app/robots.ts`.
- Cart, checkout, account, order and auth pages are `noindex`.

### Delivery estimates

- Pincode check on the PDP and cart: India Post's public API returns the area name, and a rule table (`constants/delivery.ts`) gives delivery days: 2-day express for metro pincodes, 3 days standard, 6 days for remote areas, and army postal pincodes are not deliverable.
- International delivery uses country + city from the countries API.

### Scroll behaviour

- Next.js 16 keeps the scroll position when the new page is already visible. `ScrollToTop` resets it to the top on every new page, but not on back/forward, where the browser restores the previous position.

### Hydration safety

- The saved session (user, wishlist, reviews) is restored in the browser after the first render. Content inside `<Suspense>` can hydrate after that point, so components that read browser-only state use `useHydrated()` (built on `useSyncExternalStore`) to render the server's version first. This avoids hydration mismatches.

### Error handling

- Route-level `error.tsx` + `global-error.tsx`, plus component-level boundaries built with Next.js's `catchError()`. Every boundary is a function component, with no class components anywhere.
- Expected errors (wrong OTP, unknown number, validation) are shown inline; unexpected ones as toasts. Failed mutations without their own handler fall back to a global toast via `MutationCache`.

### Data adaptations (FakeStore limitations)

- Prices are converted from USD to INR (rate in `constants/app.ts`) and rounded to retail prices.
- FakeStore has no variants, sub-categories or MRP, so these are added in `constants/catalog.ts`: sizes for clothing, finish for jewellery, warranty for electronics, plus a few out-of-stock options to show disabled states.
- Each product has one photo; the gallery adds close-up framings of it.
- Reviews are seeded per product (deterministic, so pre-rendered HTML matches), and their star distribution is derived from FakeStore's average rating and count. Reviews you write are stored in the browser.
- The countries API falls back to a small built-in list if it is unreachable.

## Testing

```bash
npm test
```

117 tests cover infinite-scroll paging, stock rules, delivery rules, order tracking, coupons (percent cap, flat, free shipping, minimum order), wishlist/address/coupon store logic, the review distribution, the countries API service (including fallback), filters and sorting, pricing and totals, AES encryption, JWT signing/expiry/tampering, validation schemas, the cart slice and memoised selectors, the mock auth flow, the API client (headers, methods, 401 refresh-and-retry, retries, error mapping), the debounce/throttle hooks and UI components (Button, QuantityStepper, Price, EmptyState, OtpInput).

## CI/CD

`.github/workflows/ci.yml` runs on every push and pull request to `main`:

1. **quality**: `npm ci`, ESLint, Prettier check, TypeScript, Jest with coverage
2. **build**: production build (with `.next/cache` caching)
3. **deploy** (pushes to `main` only): deploys to Vercel with the Vercel CLI when the `VERCEL_TOKEN`, `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` secrets are set. Without them, Vercel's Git integration deploys instead.

## Deploying to Vercel

1. Push this repo to GitHub.
2. In Vercel, choose **Add New → Project** and import the repo (the framework is detected automatically).
3. Add the environment variables from `.env.example`. `NEXT_PUBLIC_SITE_URL` is optional on Vercel: it falls back to the project's production domain.
4. Deploy. Every push to `main` redeploys automatically.

## What I'd do with more time

- A real backend (BFF) issuing `httpOnly` cookies, with server-side cart and orders
- Playwright end-to-end tests in CI
- Wishlist, reviews, saved addresses and real payment integration
- Web Vitals reporting to an analytics endpoint
