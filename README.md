# Medusa Commerce

Medusa Commerce is a Nuxt 4 ecommerce storefront built for product discovery, account management, cart and checkout flows, and SEO-friendly catalog pages. The project combines a Vue-based frontend with Nuxt server routes that integrate with Medusa and other commerce services.

## Overview

- Mobile-first ecommerce storefront built with Nuxt 4 and Vue 3
- Product listing and category pages with filters, sorting, pagination, and structured data
- Product detail pages with image galleries, variants, pricing, reviews, and related products
- Cart, checkout, order completion, and account management flows
- Content pages including blog, FAQ, privacy, shipping, returns, about, and contact
- Analytics, cookie consent, bot protection, and sitemap support

## Tech Stack

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Tailwind CSS
- Medusa APIs via Nuxt server routes
- Stripe
- PostHog
- Cloudflare Turnstile

## Main Application Areas

- `app/pages/`: storefront, category, product, cart, checkout, account, and content pages
- `app/components/`: UI for catalog, product details, cart, checkout, blog, shared controls, and layout sections
- `app/composables/`: reusable frontend logic such as pricing, category listings, cookie consent, and structured data
- `app/stores/`: Pinia stores for cart, customer, product, and region state
- `server/api/`: server routes for products, categories, cart, orders, account, blog, reviews, contact, search, and subscriptions
- `server/utils/`: Medusa proxy helpers, cart utilities, analytics helpers, and shared server-side logic
- `public/`: static assets, icons, images, manifest, and robots configuration

## Integrations

- Medusa for catalog, cart, region, customer, and order data
- Stripe for payment-related checkout flows
- PostHog for product analytics
- Cloudflare Turnstile for bot protection on public-facing forms
- Mailchimp for newsletter subscriptions
- `@nuxtjs/sitemap` for dynamic sitemap generation

## Getting Started

This repository uses `pnpm`.

```bash
pnpm install
pnpm run dev
```

The local development server runs at `http://localhost:3000`.

## Environment Variables

The app reads runtime configuration from environment variables. Common variables used by the project include:

```bash
NUXT_PUBLIC_MEDUSA_URL=
NUXT_PUBLIC_PUBLISHABLE_KEY=
NUXT_PUBLIC_STRIPE_PUBLIC_KEY=
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
SITE_NAME=Medusa Commerce
NUXT_PUBLIC_SITE_URL=
MAILCHIMP_API_KEY=
MAILCHIMP_AUDIENCE_ID=
NUXT_PUBLIC_POSTHOG_PUBLIC_KEY=
NUXT_PUBLIC_POSTHOG_PROJECT_TOKEN=
NUXT_PUBLIC_POSTHOG_HOST=
```

## Available Scripts

```bash
pnpm run dev
pnpm run build
pnpm run preview
pnpm run lint
pnpm run lint:fix
pnpm run type-check
```

## Production

Build the application for production:

```bash
pnpm run build
```

Preview the production build locally:

```bash
pnpm run preview
```

## Docker

The repository includes a multi-stage `Dockerfile` for production builds and a `docker-compose.prod.yml` file for running the storefront container.

Build the image directly:

```bash
docker build \
  --build-arg NUXT_PUBLIC_STRIPE_PUBLIC_KEY=your_public_stripe_key \
  -t medusa-commerce .
```

Run the container:

```bash
docker run --rm -p 3000:3000 \
  --env-file .env.production \
  medusa-commerce
```

Or start it with Docker Compose:

```bash
docker compose -f docker-compose.prod.yml up --build
```

Notes:

- The container serves the Nuxt production output on port `3000`.
- `docker-compose.prod.yml` expects an `.env.production` file.
- `NUXT_PUBLIC_STRIPE_PUBLIC_KEY` is passed as a build argument during image creation.
- Runtime configuration such as Medusa, PostHog, Turnstile, and site settings should be provided through the environment file.

## Notes

- The frontend is being migrated incrementally toward Tailwind-based ecommerce UI patterns.
- Keep changes focused and prefer preserving existing business logic when updating UI.
- Do not edit generated directories such as `.nuxt/`, `.output/`, `dist/`, or `node_modules/`.
