import * as Sentry from "@sentry/nuxt"

const config = useRuntimeConfig()
const sentryDsn = config.public.sentry.dsn || undefined

if (sentryDsn) {
    Sentry.init({
        dsn: sentryDsn,
        tracesSampleRate: 0.1,
        enableLogs: false,
        sendDefaultPii: false,
        debug: false
    })
}
