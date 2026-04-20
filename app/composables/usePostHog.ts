import { disablePostHogClient, getPostHogClient } from "~/utils/posthog-client"

type PostHogProperties = Record<string, unknown>

export type PostHogTracker = {
    capture: (event: string, properties?: PostHogProperties) => void
    identify: (distinctId: string, properties?: PostHogProperties) => void
    reset: () => void
}

export function usePostHog(): PostHogTracker | null {
    if (import.meta.server) {
        return null
    }

    return {
        capture(event: string, properties?: PostHogProperties): void {
            const posthog = getPostHogClient()
            if (!posthog) {
                return
            }

            posthog.capture(event, properties)
        },

        identify(distinctId: string, properties?: PostHogProperties): void {
            const posthog = getPostHogClient()
            if (!posthog) {
                return
            }

            posthog.identify(distinctId, properties)
        },

        reset(): void {
            disablePostHogClient()
        }
    }
}
