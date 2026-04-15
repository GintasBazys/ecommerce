These instructions apply to the entire repository unless a deeper `AGENTS.md` overrides them.
- App type: Nuxt application using Vue, Pinia, Vuetify, and server routes under `server/`.
- Package manager: Prefer `pnpm` because the repo includes `pnpm-workspace.yaml`.
- Default dev server: `pnpm run dev` on `http://localhost:3000`.
- Keep changes focused and minimal; do not refactor unrelated code.
- Match the existing code style and naming in the surrounding files.
- Prefer fixing root causes over adding one-off workarounds.
- Do not edit generated outputs such as `.nuxt/`, `.output/`, `dist/`, or `node_modules/`.
- Treat `content/`, `public/`, `app/`, and `server/` as source directories.
- Install dependencies: `pnpm install`
- Start development server: `pnpm run dev`
- Build production output: `pnpm run build`
- Preview production build: `pnpm run preview`
- Lint: `pnpm run lint`
- Auto-fix lint issues: `pnpm run lint:fix`
- Type-check: `pnpm run type-check`
- After code changes, run the narrowest relevant validation first.
- For frontend and shared app changes, prefer `pnpm run lint` and `pnpm run type-check`.
- For server-side changes, run the smallest relevant validation available before broader checks.
- If a command fails because of an existing unrelated issue, note it instead of changing unrelated code.
- Keep `.gitignore` aligned with generated outputs and local-only artifacts.
- Do not commit secrets or local environment files.
- Avoid adding new dependencies unless they are necessary for the requested task.
- Search with `rg` or `rg --files` when possible.
- Read large files in chunks.


# AGENTS.md — Ecommerce Tailwind Migration Rules for Nuxt

## Purpose

This document defines the rules for AI agents working on an ecommerce UI refactor from **Vuetify to Tailwind CSS

The goal is to deliver a **mobile-first, accessible, SEO-friendly, scalable, and secure ecommerce frontend** through **incremental changes**, not a full rewrite.

---

## Core Mission

Agents must refactor the ecommerce frontend from Vuetify to Tailwind with the following priorities:

1. **Focus on mobile ecommerce UX first**
2. **Replace Vuetify and Swiper**
3. **Keep code lean, clean, and scalable**
4. **Ship incrementally**
5. **Preserve or improve accessibility, SEO, and performance**
6. **Avoid risky architectural rewrites**
7. **Keep all work clearly focused on ecommerce**

---

## Hard Constraints

### Must do

- Migrate from **Vuetify to Tailwind CSS**
- Replace **Swiper**
- Prioritize **mobile design**
- Support at least:
    - **iOS 15**
    - **Chrome 100**
- Use **incremental migration**
- Use **subagents** with clear responsibilities
- Follow strong **accessibility**
- Follow strong **SEO**
- Use **good error handling**
- Cover **edge cases**, especially around imported or inconsistent catalog data
- Keep files and components **small and maintainable**
- Prefer files under **500 lines of code**
- Use **code splitting** where useful
- Use **real ecommerce-oriented copy**, not placeholder or weird test text

### Must not do

- Do not rewrite the whole frontend at once
- Do not introduce trendy CSS features with weak support
- Do not over-engineer abstractions
- Do not cache category/product API responses unnecessarily
- Do not add fake demo content that looks unprofessional
- Do not mix multiple competing patterns for the same UI problem
- Do not break SEO-critical routes, metadata, or structured data
- Do not trust imported data blindly
- Do not depend on Vuetify components after a section is migrated

---

## Migration Principles

### 1. Incremental change only

Agents must migrate **page by page** and **component by component**.

Preferred order:

1. Shared design tokens and Tailwind setup
2. Layout shell and common wrappers
3. Shared ecommerce primitives
4. Category/listing pages
5. Product detail pages
6. Cart-related UI
7. Account/support forms
8. Remaining legacy Vuetify pieces

Do not start with a global rewrite.

### 2. Preserve business logic when possible

When replacing Vuetify UI, keep existing business logic, API contracts, analytics hooks, and route behavior intact unless there is a clear bug or performance issue.

### 3. Separate styling refactor from behavior refactor

If possible:
- first replace layout/styling,
- then improve interaction details,
- then optimize performance and cleanup.

Avoid combining many risky changes in one PR.

### 4. One clear responsibility per change

Each PR or generated patch should have a narrow scope:
- one page,
- one component family,
- one UX improvement,
- or one cleanup step.

---

## Required Subagents

Agents should split work into focused subagents.

### 1. Audit subagent

Responsible for:
- inventory of Vuetify usage
- inventory of Swiper usage
- identifying shared UI patterns
- spotting SEO, accessibility, and mobile issues
- detecting risky dependencies before migration

### 2. Design system subagent

Responsible for:
- Tailwind setup
- spacing, typography, color, radius, shadow, and breakpoint rules
- reusable ecommerce primitives
- consistent button, input, badge, card, modal, drawer, and form styles

### 3. Listing page subagent

Responsible for:
- category pages
- product grid/listing
- mobile filters
- sorting
- pagination or load-more UX
- empty/loading/error states

### 4. Product page subagent

Responsible for:
- gallery replacement
- product media
- variant selectors
- add-to-cart area
- sticky mobile purchase actions
- product info structure
- related/recommended product sections

### 5. Accessibility and QA subagent

Responsible for:
- keyboard support
- screen reader support
- semantic HTML
- focus management
- form labeling
- contrast and touch target checks
- compatibility checks for iOS 15 / Chrome 100

### 6. SEO and performance subagent

Responsible for:
- meta tags
- headings
- canonical rules
- structured data
- route-level code splitting
- image handling
- payload reduction
- avoiding unnecessary JS

### 7. Security and data robustness subagent

Responsible for:
- handling malformed imported data
- sanitization
- reCAPTCHA where relevant
- route/input validation
- safe rendering of descriptions and user-provided content

---

## Browser and CSS Compatibility Rules

Support must include **iOS 15** and **Chrome 100**.

### Avoid relying on

- `:has()`
- container queries
- CSS subgrid
- view transitions API
- scroll-driven animations
- newer viewport unit behavior without fallback
- fragile sticky/overflow combinations without testing
- any CSS feature that requires latest Safari/Chrome to work correctly

### Prefer

- standard Flexbox/Grid
- simple media queries
- progressive enhancement
- tested sticky positioning
- accessible dialogs/drawers
- scroll snapping only if tested well
- JS-powered behavior where compatibility is more predictable

---

## Tailwind Rules

### General

- Use Tailwind as the primary styling system
- Build a **small, reusable ecommerce design language**
- Keep utility usage readable
- Extract repeated patterns into components when duplication becomes obvious
- Prefer semantic Vue components over giant template files
- Avoid large utility strings repeated across many files

### Recommended shared primitives

Create small reusable building blocks such as:
- `BaseButton`
- `BaseInput`
- `BaseSelect`
- `BaseCheckbox`
- `BaseRadio`
- `BaseDrawer`
- `BaseModal`
- `BaseTabs`
- `ProductCard`
- `PriceDisplay`
- `RatingDisplay`
- `BadgePill`
- `EmptyState`
- `ErrorState`
- `LoadingSkeleton`

### Do not

- recreate Vuetify as a custom mini-framework
- make one giant shared component for everything
- hide simple Tailwind markup behind unnecessary abstraction

---

## Vuetify Replacement Rules

- Remove Vuetify usage gradually
- Replace component-by-component, not all at once
- Do not leave migrated pages dependent on Vuetify layout helpers
- Replace Vuetify grid/layout with clean Tailwind layout patterns
- Replace Vuetify dialogs/menus/drawers with lightweight accessible alternatives
- Replace Vuetify form controls with accessible custom or headless implementations

### After migration of a page

- no Vuetify imports should remain in that page or its newly migrated child components
- styling should not depend on Vuetify global classes
- behavior should remain stable or improve

---

## Swiper Replacement Rules

Swiper must be replaced.

### Preferred direction

Use a lighter and simpler solution appropriate for ecommerce:
- **Embla Carousel**
- **Keen Slider**
- or a minimal native scroll-snap approach where sufficient

### Rules

- choose the lightest solution that satisfies the UX
- prioritize touch support, accessibility, and predictable performance
- avoid heavy slider logic where a simple horizontal scroll would work
- avoid autoplay on critical commerce UI
- ensure pagination/arrows are keyboard accessible if present

### Product gallery guidance

- mobile: swipe or horizontal scroll gallery
- desktop: primary media with thumbnail navigation
- support image fallback and missing media safely
- ensure zoom or expanded media does not trap the user

---

## Mobile-First Ecommerce UX Rules

Agents must optimize for mobile first.

### Required mobile patterns

- product listing should show **2 products per row on small screens** where content still fits clearly
- filters on category pages should use a **mobile slide-over / drawer / bottom-sheet pattern**
- sorting must be easy to reach on mobile
- important actions must remain thumb-friendly
- touch targets should be at least approximately **44x44**
- sticky purchase actions are encouraged on product pages where useful

### Category page best practices

Required expectations:

- mobile filter drawer or bottom sheet
- visible current sort option
- visible selected filter chips or summary
- 2-column product grid on small screens
- stable image ratio to reduce layout shift
- clear prices, discounts, badges, and stock status
- clean empty state when no products match
- clean error state with retry option
- clear pagination or load-more behavior
- avoid infinite scroll unless there is a strong reason and good fallback

### Product page best practices

Required expectations:

- clear product title, price, variant controls, CTA hierarchy
- media first, purchase info next
- sticky or easy-to-reach add-to-cart on mobile
- accessible variant selection
- stock and delivery info clearly visible
- accordions/tabs only when they improve scanning
- related products below primary product info
- avoid clutter and over-animation

---

## Accessibility Rules

Accessibility is required, not optional.

### Must do

- use semantic HTML first
- use proper heading hierarchy
- label all form controls
- ensure keyboard access for drawers, modals, filters, carousels, and menus
- manage focus when dialogs/drawers open and close
- show visible focus states
- provide alt text for product images
- support screen readers for price, discounts, variant state, and stock messages
- ensure contrast is acceptable
- use `aria-live` carefully for add-to-cart/error feedback
- ensure disabled/unavailable variants are announced clearly

### Specific ecommerce requirements

- filter groups must have clear labels
- sorting control must be labeled
- product cards must have meaningful link text
- color swatches must not rely only on color
- sale badges and crossed-out prices must still make sense for screen readers
- validation errors must be attached to the right fields

---

## SEO Rules

SEO must be preserved or improved during migration.

### Must preserve

- route structure
- canonical product/category URLs unless explicitly changed
- crawlable product and category content
- metadata handling already in place, unless improved safely

### Must implement or verify

- unique title and meta description per category/product page
- proper H1 usage
- structured data where appropriate:
    - Product
    - BreadcrumbList
    - ItemList for listing pages where appropriate
- canonical tags
- indexability rules for faceted navigation
- clean internal linking
- image alt text
- SSR-friendly important content

### Faceted navigation guidance

- do not let every filter combination create index bloat by default
- keep filtering usable for users without accidentally generating harmful SEO duplication
- be deliberate about canonical/noindex strategy for filter states

---

## Performance and Scalability Rules

### General

- keep code lean
- prefer small focused components
- prefer simple reactivity over clever abstractions
- reduce JS on initial render
- use route-level and component-level code splitting where helpful
- lazy-load non-critical UI

### File size rules

- prefer files under **500 LOC**
- if a file grows too large, split by responsibility
- separate:
    - presentation
    - state/composables
    - utilities
    - API adapters

### Code splitting

Use lazy loading for:
- filter drawers
- large galleries
- recommendation sections
- reviews widgets
- rarely used modal content

Do not lazy-load above-the-fold essentials that cause UX regressions.

### Data fetching

- keep category/product API fetching straightforward
- do **not** add unnecessary client-side caching for category/product requests
- do not add stale caching layers unless there is a proven need and explicit agreement
- avoid duplicate fetches
- ensure loading and error states are explicit

### Images

- use responsive image practices supported by current stack
- preserve aspect ratio to reduce layout shift
- lazy-load below-the-fold images
- avoid oversized images in product grids

---

## Error Handling Rules

All critical ecommerce flows must have clean error handling.

### Must cover

- category fetch failure
- product fetch failure
- missing product
- missing category
- empty search/listing results
- add-to-cart failure
- variant unavailable
- pricing missing or malformed
- image load failure
- import data missing required fields
- unexpected API payload changes

### UX rules for errors

- show human-readable ecommerce-specific messages
- offer retry where useful
- do not expose raw internal errors to users
- log useful diagnostics in a controlled way
- avoid broken blank sections

### Example expectations

- missing image -> show product placeholder image
- unavailable variant -> disable CTA and explain why
- malformed price -> hide broken price formatting and surface safe fallback
- add-to-cart API failure -> non-blocking error feedback with retry path

---

## Handling Imported / Inconsistent Catalog Data

Agents must assume imported data can be messy.

### Must safely handle

- missing SKU
- duplicate SKU
- missing slug
- missing title
- missing brand
- missing or invalid price
- empty image arrays
- broken image URLs
- inconsistent variant shape
- missing stock value
- long category names
- deeply nested categories
- unsafe HTML in descriptions
- duplicate attribute values
- unexpected currency formatting

### Rules

- never trust imported data shape blindly
- normalize data at boundaries
- use fallback rendering for missing fields
- sanitize any HTML content before rendering
- never let one malformed field break the whole page
- keep UI resilient under partial data quality issues

---

## Security Rules

### Must do

- validate route params and identifiers
- sanitize user-generated or imported HTML
- escape unsafe content where needed
- use reCAPTCHA or equivalent bot protection for risky public forms such as:
    - account creation
    - password reset
    - contact/support
    - suspicious add-to-cart or wishlist abuse points if relevant
- keep secrets out of client code
- do not trust client-side validation alone
- assume server validation still owns security decisions

### Must not do

- expose internal error traces
- trust query params without validation
- inject raw HTML from imports without sanitization
- create security theater that replaces real backend validation

---

## Nuxt and Vue Best Practices

### Required practices

- use composables for reusable state/logic
- keep components presentational where possible
- avoid deeply nested prop chains
- keep side effects explicit
- use computed state for derived values
- clean up watchers and event listeners
- keep route/page concerns inside pages or dedicated composables
- avoid large monolithic page files

### Prefer

- server-friendly rendering for SEO-critical content
- composables such as:
    - `useCategoryFilters`
    - `useProductGallery`
    - `useProductPricing`
    - `useAddToCart`
    - `useSafeProductData`
- typed contracts where project supports them
- narrow utilities with clear naming

### Avoid

- giant all-in-one composables
- implicit shared state unless truly global
- duplicated business logic across category/product/cart views
- heavy client-only wrappers around core ecommerce content

---

## Copy and Content Rules

- Do not use weird placeholder text
- Do not use joke product names, fake addresses, or fake checkout text
- Keep all copy ecommerce-appropriate
- Use neutral, professional fallback text when real content is unavailable
- Empty states and errors must sound production-ready

Examples of acceptable fallback tone:
- `No products found`
- `Try removing a filter or changing your search`
- `This variant is currently unavailable`
- `Something went wrong. Please try again`

---

## Definition of Done for Each Migrated Page

A migrated page is only complete when:

- Vuetify is removed from that page scope
- Tailwind styles are clean and consistent
- mobile layout works well
- iOS 15 and Chrome 100 behavior is considered
- accessibility checks pass
- SEO-critical content is preserved
- loading/empty/error states exist
- code remains reasonably small and maintainable
- product/category API behavior is not over-cached
- no fake or strange placeholder text remains
- Swiper is removed where relevant
- visual behavior matches ecommerce expectations

---

## PR / Change Rules for Agents

Each generated change should include:

1. **Scope**
    - what page/component is being migrated

2. **What was replaced**
    - Vuetify parts removed
    - Swiper usage removed if applicable

3. **Why the new approach is better**
    - mobile UX
    - accessibility
    - SEO
    - performance
    - maintainability

4. **Risks**
    - any behavior changes
    - any remaining legacy dependencies

5. **Follow-up tasks**
    - next incremental steps only

---

## Recommended Migration Sequence

### Phase 1 — Foundations
- Tailwind setup
- design tokens
- shared spacing/typography rules
- base primitives
- no visual redesign yet beyond necessary cleanup

### Phase 2 — Shared commerce components
- buttons
- form fields
- product cards
- badges
- drawers/modals
- skeletons
- empty/error states

### Phase 3 — Category/listing experience
- product grid
- mobile filters
- sorting
- pagination/load more
- filter chips
- listing SEO checks

### Phase 4 — Product page
- media/gallery replacement
- variant controls
- sticky mobile CTA
- shipping/returns/info sections
- recommendation blocks
- product structured data verification

### Phase 5 — Remaining legacy UI
- cart/account/support UI
- residual Vuetify cleanup
- final design consistency pass

---

## Agent Output Style Rules

When generating code or plans:

- stay specific to ecommerce
- avoid generic app boilerplate
- avoid unnecessary architectural theory
- prefer direct implementation guidance
- explain tradeoffs briefly
- keep solutions maintainable by a human team
- suggest incremental next steps, not giant rewrites

---

## Non-Goals

These are not part of this migration unless explicitly requested:

- backend replatforming
- redesigning the entire brand identity
- adding aggressive caching for category/product APIs
- introducing experimental CSS patterns
- rewriting all business logic
- rebuilding checkout flows from scratch unless required

---

## Default Decision Rules

If an agent is unsure, prefer:

- simpler over clever
- accessible over flashy
- mobile-first over desktop-first
- semantic HTML over div-heavy markup
- incremental refactor over rewrite
- stable browser support over newest CSS tricks
- lightweight libraries over heavy UI dependencies
- resilient handling of bad product data over optimistic assumptions

---

## Final Rule

Every change must make the ecommerce experience feel **faster, clearer, safer, and easier to buy from on mobile** without destabilizing the existing Nuxt app.