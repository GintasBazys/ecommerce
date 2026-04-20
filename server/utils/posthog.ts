import { PostHog } from "posthog-node"

import { hasAnalyticsConsent } from "./cookie-consent"

let client: PostHog | null = null

export function useServerPostHog() {
    if (!client) {
        const config = useRuntimeConfig()
        const posthogConfig = config.public.posthog

        if (!posthogConfig.publicKey || !posthogConfig.host) {
            return null
        }

        client = new PostHog(posthogConfig.publicKey, {
            host: posthogConfig.host
        })
    }

    return client
}

export function canTrackServerAnalytics(event: Parameters<typeof hasAnalyticsConsent>[0]): boolean {
    return hasAnalyticsConsent(event)
}
