# Design

## Context

See `proposal.md` for motivation and `specs/regional-context-resilience/spec.md` for observable behavior. The regions endpoint currently calls Medusa directly, while most server routes use shared proxy utilities. The region store catches and logs failures without exposing state, and server bootstrap consequently continues with an unvalidated cookie value or no region. Several downstream consumers fetch once or silently treat a missing region as empty data.

The solution must remain SSR-safe, work on iOS 15 and Chrome 100, avoid persistent response caching, and fit existing Nuxt, Pinia, and server utility patterns without a new dependency or global error framework.

## Goals / Non-Goals

**Goals:**

- Establish one safe server boundary for regional dependency failures.
- Keep valid and malformed imported regional data from sharing client state.
- Make initialization state and recovery explicit without duplicating error UI.
- Prevent invalid regional identifiers from reaching commerce APIs.
- Give server logs and Sentry one privacy-safe ownership point.
- Recover all one-shot region-dependent data reliably after a successful retry.

**Non-Goals:**

- Redesigning the wider product, cart, or checkout experience.
- Introducing global API response wrappers or a new error-handling framework.
- Adding persistent client or server caching for region responses.
- Automatically retrying dependency failures in the background.
- Changing Medusa's regional data model or fixing the upstream service itself.

## Decisions

### 1. Use the existing Medusa proxy as the server boundary

The regions route will use the shared Medusa request utilities instead of direct `$fetch`. It will set `Cache-Control: no-store` before making the request, preserve the existing three-second timeout, and return a normalized `{ regions }` payload only after validation.

The proxy behavior will distinguish:

- missing server configuration: generic `500`;
- connection, DNS, abort, and timeout failures: `503`;
- upstream 5xx and malformed successful responses: `502`;
- invalid client-provided regional values: `400` before contacting Medusa.

Public responses use stable approved messages. Upstream bodies and status text remain diagnostic-only. Shared status translation will be adjusted narrowly enough not to reclassify intentionally created local H3 errors.

**Alternative considered:** Add Nitro-wide error middleware. Rejected because it cannot validate route-specific payloads, risks changing unrelated responses, and duplicates the existing proxy boundary.

### 2. Normalize region data at the route boundary

The route will treat the decoded payload as `unknown` and use small colocated type guards/normalization logic. A usable region has a non-empty bounded identifier and at least one usable country. A usable country has a two-letter ASCII `iso_2` code, normalized to lowercase. Duplicate region IDs and duplicate countries are removed deterministically; malformed entries are ignored. If no usable region remains, the route returns a safe `502`.

Validation will not attempt to recreate the full Medusa DTO schema. It will validate only fields the storefront needs for selection and safe downstream use, preserving other fields from otherwise usable entries.

**Alternative considered:** Add a schema-validation dependency. Rejected because the required boundary is small and a new runtime dependency would not improve this focused change enough to justify its cost.

### 3. Make validated readiness explicit in the Pinia store

The region store will expose `status: "idle" | "loading" | "ready" | "error"` and a fixed customer-safe `errorMessage`. Cookie values remain selection candidates and do not make the store ready before a successful response validates them.

A module-local in-flight promise will deduplicate concurrent `fetchRegion()` calls without serializing request machinery into Pinia state. Fetching will build the next validated state first and commit regions, selection, cookies, status, and error coherently. A failed refresh preserves an existing ready regional selection; an initial failure enters error state.

Handled request errors will not be logged in the browser. `fetchRegion()` will return a typed success result so bootstrap and retry callers can branch without inspecting raw transport errors.

**Alternative considered:** Let `fetchRegion()` throw and require every caller to catch. Rejected because region initialization has multiple callers and the store owns the same recoverable state for all of them.

### 4. Present one shared recovery notice

A small shared component in the application shell will render only when regional status is `error` and there is no usable validated state. It will use semantic text and a native button with visible focus, an approximately 44px touch target, `aria-busy` while retrying, and a polite status announcement. Copy will explain the customer impact rather than the infrastructure failure:

> Regional pricing is temporarily unavailable. We could not load delivery countries and regional prices. Please try again.

The retry action calls the deduplicated store request. On success, the app will perform one controlled current-route reload so SSR bootstrap and existing one-shot catalog consumers all restart from the validated region. This avoids adding bespoke refresh wiring across every product, cart, and checkout consumer. Failed retries retain the notice and never loop automatically.

**Alternative considered:** Refresh every dependent store and component in place. Rejected for this increment because current consumers use mixed `callOnce`, store, and page-fetch patterns, making partial or duplicate recovery likely.

### 5. Guard downstream operations at both client and server boundaries

Client bootstrap and region-dependent UI will require `status === "ready"` and a validated identifier before loading catalog, cart, wishlist, address, or checkout data. Missing regional context will map to the shared regional-unavailability state, not an empty-results state.

Server endpoints that accept regional identifiers will reject non-scalar, blank, repeated, oversized, control-character, `"null"`, and `"undefined"` values before an upstream request. Client query construction will use encoded query parameters rather than string interpolation.

Address and checkout controls that depend on countries will have distinct loading and error states and remain disabled until regional context is ready.

**Alternative considered:** Rely on Medusa to reject invalid identifiers. Rejected because strings such as `"null"` currently pass local presence checks, cause unnecessary upstream traffic, and produce less useful failures.

### 6. Log once with allowlisted context

Handled regional failures will be logged once at the server dependency boundary. Fields are limited to operation, failure category, mapped status, upstream status when available, malformed-entry counts, and a correlation identifier. Raw exceptions, payloads, headers, cookies, API keys, full URLs, and customer identifiers will not be logged or explicitly attached to Sentry events.

Client stores and components will not log normalized failures. Unexpected programming errors remain eligible for the existing Sentry integration.

**Alternative considered:** Log at every catch point for visibility. Rejected because it duplicates events and increases the chance of exposing transport or customer details.

### 7. Keep fatal 5xx content independent of server status text

The fatal error page will derive customer copy from an allowlist by status class. Arbitrary `statusText` or `statusMessage` will not be rendered for 5xx responses. Known non-5xx states may retain approved specific copy.

**Alternative considered:** Sanitize arbitrary server messages. Rejected because an allowlist is simpler and prevents future internal messages from becoming public accidentally.

### 8. Resolve public error copy from existing locale resources

Regional recovery and fatal error components will resolve approved copy from the existing English and Lithuanian message files using the active locale store. The server response remains stable and generic; client UI does not render transport messages. Keeping these strings with existing locale resources avoids a second translation mechanism and updates visible copy reactively when locale changes.

**Alternative considered:** Store translated text in the region store. Rejected because serialized text can become stale after a locale change and mixes presentation copy with request state.

## Risks / Trade-offs

- **[Controlled route reload interrupts local UI state]** -> Use it only after explicit successful retry; it provides reliable recovery for all one-shot data consumers and can be replaced by targeted refresh later.
- **[Filtering malformed entries can hide upstream data defects]** -> Record aggregate malformed counts server-side while never logging full payloads.
- **[Changing shared proxy status mapping affects existing routes]** -> Add focused utility tests and preserve intentional local H3 errors before applying upstream translation.
- **[Stale cookies can select the wrong fallback]** -> Treat cookies only as candidates and replace them atomically after validation.
- **[SSR and hydration can diverge]** -> Serialize the explicit error state through Pinia and avoid client-only state resets before hydration completes.
- **[Repeated callers can initialize dependent data more than once]** -> Deduplicate region requests and use one controlled reload rather than dispatching multiple recovery callbacks.

## Migration Plan

1. Extend and test safe Medusa error translation and regional payload normalization.
2. Move the regions endpoint onto the shared boundary without changing its successful response shape.
3. Add explicit store state and in-flight deduplication while retaining existing selection APIs.
4. Update bootstrap and downstream guards to require validated readiness.
5. Add the shared recovery notice and address/checkout failure states.
6. Harden fatal 5xx presentation and remove duplicate handled-error logging.
7. Run unit, component, integration, lint, and type checks before deployment.

Rollback can revert the client notice and readiness guards independently after reverting the region-store state change. The endpoint keeps the same successful payload shape, so server-boundary changes can also be reverted without data migration.
