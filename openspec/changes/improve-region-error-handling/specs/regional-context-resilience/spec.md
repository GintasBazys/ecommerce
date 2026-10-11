# Spec Delta

## Purpose

Ensure the storefront acquires and validates regional context safely, communicates failures clearly, and recovers without exposing technical details or corrupting commerce flows.

## ADDED Requirements

### Requirement: Safe regional service errors
The system SHALL translate regional dependency failures into stable public responses while retaining technical details only in protected diagnostics.

#### Scenario: Upstream service returns a server error
- **WHEN** the regional dependency returns a 5xx response
- **THEN** the storefront SHALL return a safe gateway error that contains approved public copy and no upstream body, URL, stack trace, credential, or internal service detail

#### Scenario: Regional service is unreachable
- **WHEN** the regional dependency cannot be reached or the request times out
- **THEN** the storefront SHALL return a temporary-unavailability response with approved public copy

#### Scenario: Storefront configuration is invalid
- **WHEN** required server-side regional configuration is absent
- **THEN** the storefront SHALL return a generic internal error without naming the missing configuration or exposing its value

### Requirement: Validated regional payloads
The system SHALL treat regional dependency responses as untrusted and SHALL expose only usable regions and countries to storefront state.

#### Scenario: Payload contains valid and malformed entries
- **WHEN** a regional response includes both usable entries and malformed or duplicate entries
- **THEN** the storefront SHALL retain the usable unique entries and exclude malformed entries from client state

#### Scenario: Payload has no usable region
- **WHEN** a successful upstream response is invalid, empty, or contains no region with a valid identifier and usable country
- **THEN** the storefront SHALL report a safe invalid-dependency-response error instead of treating the result as an empty catalog

#### Scenario: Country code normalization
- **WHEN** a usable country code is received with supported casing differences
- **THEN** the storefront SHALL normalize it consistently before selection or comparison

### Requirement: Explicit regional readiness
The system SHALL distinguish idle, loading, ready, and error regional states, and SHALL consider regional context ready only after validating fetched data and selecting a usable region.

#### Scenario: Cookie contains a stale region
- **WHEN** a saved region or country does not exist in the validated response
- **THEN** the storefront SHALL select a valid fallback and update the saved selection

#### Scenario: Initial regional request fails
- **WHEN** regional initialization fails during server rendering
- **THEN** the error state SHALL remain available after hydration and the application SHALL not treat cookie-derived identifiers as validated regional context

#### Scenario: Refresh fails after successful initialization
- **WHEN** valid regional state already exists and a later refresh fails
- **THEN** the storefront SHALL preserve the last validated state while exposing the refresh failure for recovery

#### Scenario: Concurrent regional requests
- **WHEN** multiple consumers request regional initialization while one request is in flight
- **THEN** the storefront SHALL share that request and apply its result once

### Requirement: Human-readable regional recovery
The storefront SHALL present one accessible regional-availability message with a retry action when regional context required for shopping cannot be loaded.

#### Scenario: Regional initialization fails
- **WHEN** the storefront enters the regional error state without usable prior state
- **THEN** it SHALL explain that regional pricing and delivery options are temporarily unavailable and offer a clearly labelled retry action

#### Scenario: Customer retries
- **WHEN** the customer activates retry
- **THEN** the action SHALL become unavailable while loading, expose its busy state accessibly, and prevent duplicate requests

#### Scenario: Retry succeeds
- **WHEN** retry returns valid regional context
- **THEN** the storefront SHALL clear the error, announce recovery without moving focus unexpectedly, and initialize dependent commerce data once

#### Scenario: Retry fails
- **WHEN** retry does not return valid regional context
- **THEN** the storefront SHALL remain in an actionable error state without entering an automatic retry loop or permanent loading state

#### Scenario: Customer uses a supported locale
- **WHEN** regional recovery UI is shown while English or Lithuanian is active
- **THEN** all regional failure, loading, retry, and recovery messages SHALL use the active locale

### Requirement: Guarded regional commerce operations
The system MUST NOT start a region-dependent commerce operation until it has a validated regional identifier and any other regional values required by that operation.

#### Scenario: Regional context is unavailable
- **WHEN** catalog, cart, address, wishlist, or checkout logic requires regional context that is not ready
- **THEN** the operation SHALL not contact its downstream service and the UI SHALL show loading or regional-unavailability state rather than valid empty results

#### Scenario: Invalid region query value
- **WHEN** a region-dependent server endpoint receives a blank, repeated, oversized, control-character, `null`, or `undefined` region value
- **THEN** it SHALL reject the request as invalid without forwarding it to the commerce dependency

#### Scenario: Delivery countries are unavailable
- **WHEN** regional initialization has failed on an address or checkout flow
- **THEN** country controls and dependent continuation actions SHALL be disabled with a human-readable explanation and retry action

### Requirement: Privacy-safe diagnostic ownership
The system SHALL record each handled regional dependency failure once at the server boundary using allowlisted diagnostic fields.

#### Scenario: Regional dependency request fails
- **WHEN** a handled regional request fails
- **THEN** diagnostics SHALL identify the operation, failure category, mapped status, request correlation value, and upstream status when available
- **AND** diagnostics SHALL exclude cookies, keys, authorization values, customer identifiers, full URLs, payloads, and upstream response bodies

#### Scenario: Client receives a handled error
- **WHEN** the client receives a normalized regional failure
- **THEN** it SHALL render recoverable state without logging the raw error again

### Requirement: Safe fatal error presentation
The storefront SHALL use approved fixed public copy for fatal 5xx pages and MUST NOT render arbitrary server status text as customer-facing content.

#### Scenario: Fatal error contains internal status text
- **WHEN** a fatal 5xx error includes technical or upstream status text
- **THEN** the page SHALL show generic customer-safe copy and recovery navigation without rendering the internal text

#### Scenario: Fatal error uses a supported locale
- **WHEN** a fatal error page is shown while English or Lithuanian is active
- **THEN** the approved public error message SHALL use the active locale

### Requirement: Supported recovery interaction
Regional error and retry interactions SHALL remain operable with keyboard and touch input on iOS 15 and Chrome 100.

#### Scenario: Customer uses keyboard or touch
- **WHEN** the customer navigates to or activates the regional retry action
- **THEN** the action SHALL have a visible focus state, semantic button behavior, and a touch target of at least approximately 44 by 44 CSS pixels
