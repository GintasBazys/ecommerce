import * as Sentry from "@sentry/nuxt"

Sentry.init({
    dsn: process.env.NUXT_SENTRY_DSN || process.env.SENTRY_DSN || process.env.NUXT_PUBLIC_SENTRY_DSN || undefined,

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Enable sending of user PII (Personally Identifiable Information)
    // https://docs.sentry.io/platforms/javascript/guides/nuxt/configuration/options/#sendDefaultPii
    sendDefaultPii: true,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false
})
