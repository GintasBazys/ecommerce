import type { PostHog } from "posthog-js"

export function usePostHog(): PostHog | null | undefined {
    if (import.meta.server) {
        return null
    }

    const { $clientPosthog } = useNuxtApp()
    return $clientPosthog as PostHog | null | undefined
}
