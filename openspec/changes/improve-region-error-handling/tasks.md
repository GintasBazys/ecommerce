# Tasks

## 1. Regional Server Boundary

- [x] 1.1 Add narrow upstream error classification to the Medusa proxy so intentional local H3 errors remain intact while timeout/network failures map to safe temporary-unavailability responses and upstream 5xx responses map to safe gateway failures; verify with focused cases in `test/unit/server/utils/medusa-proxy.spec.ts` using `pnpm test:unit -- test/unit/server/utils/medusa-proxy.spec.ts`.
- [x] 1.2 Add a small regional payload normalizer that accepts `unknown`, retains only uniquely identified regions with normalized usable countries, and reports an unusable payload without logging source data; verify mixed, duplicate, malformed, empty, and invalid payload cases with focused unit tests.
- [x] 1.3 Refactor `server/api/regions.ts` to use the shared Medusa boundary, apply `Cache-Control: no-store` before success or failure, preserve the request timeout, and return only validated `{ regions }`; verify success, upstream 5xx, timeout, invalid JSON, empty payload, safe public copy, and one structured log per failure in a focused route test.
- [x] 1.4 Restrict regional server diagnostics to allowlisted fields and verify route/proxy tests assert that cookies, keys, customer identifiers, full URLs, payloads, upstream bodies, and stack details are absent from logs and public responses.

## 2. Validated Region State

- [x] 2.1 Add typed `idle`, `loading`, `ready`, and `error` state plus customer-safe error state to `app/stores/region.ts`, treating cookie values only as candidates until fetched data validates them; verify initial, loading, ready, stale-cookie fallback, and error transitions in a new region store unit test.
- [x] 2.2 Deduplicate concurrent region requests with one non-serialized in-flight promise, commit valid state atomically, preserve previously validated state on refresh failure, and remove raw client error logging; verify concurrent calls issue one request and failed refreshes retain valid state in the region store test.
- [x] 2.3 Return a typed success result from regional initialization and update SSR/client bootstrap to branch on validated readiness rather than cookie presence; verify an SSR failure survives hydration and prevents dependent initialization in a focused Nuxt integration test.

## 3. Accessible Recovery Experience

- [x] 3.1 Add a focused shared regional availability notice to the application shell with production copy, semantic status output, a native retry button, visible focus, an approximately 44px touch target, and an accessible busy state; verify rendering, keyboard activation, busy labeling, and retry deduplication with a component test.
- [x] 3.2 On successful manual retry, clear the regional error and perform one controlled current-route reload so all one-shot data consumers restart from validated context; verify failed retry remains actionable and successful retry reloads exactly once in the notice/component integration test.
- [x] 3.3 Replace indefinite country-loading states in address and checkout UI with distinct loading and regional-error states, keeping dependent controls and continuation actions disabled until ready; verify failure copy, retry access, and disabled behavior with focused component tests.
- [x] 3.4 Add English and Lithuanian regional recovery and fatal error copy to the existing locale resources, resolve it from the active locale, and verify both locales plus in-modal retry access with focused Nuxt component tests.

## 4. Commerce Guards

- [x] 4.1 Update catalog, product, cart, wishlist, address, and checkout entry points to require validated regional readiness and show regional unavailability rather than valid empty-results UI; verify representative category, product, cart, and checkout flows do not issue downstream requests while the region store is not ready.
- [x] 4.2 Add a shared narrow validator for server endpoints that accept region identifiers, rejecting arrays, repeated values, blanks, oversized/control-character values, `"null"`, and `"undefined"` before upstream calls; verify accepted and rejected values with unit tests for the validator and affected endpoint guards.
- [x] 4.3 Replace direct region query interpolation with encoded query construction and ensure cart creation/loading never sends a missing identifier; verify request assertions cover valid encoding and the absence of `region_id=null` or `region_id=undefined`.

## 5. Fatal Error Safety

- [x] 5.1 Update the Nuxt fatal error page to use approved fixed copy for 5xx responses instead of rendering arbitrary status text, while retaining useful approved behavior for known non-5xx errors; verify technical status text is absent and recovery navigation remains keyboard accessible in a focused Nuxt component test.

## 6. Integration Verification

- [x] 6.1 Add an end-to-end Nuxt test for initial `/api/regions` failure followed by successful manual retry, verifying no misleading empty state, no region-dependent request before readiness, stable hydration, and exactly one dependent initialization after recovery.
- [ ] 6.2 Run `pnpm run lint`, `pnpm run type-check`, `pnpm run test:unit`, and `pnpm run test:nuxt`, and resolve only failures introduced by this change.
