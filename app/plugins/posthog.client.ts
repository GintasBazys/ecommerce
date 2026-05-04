import { disablePostHogClient, initPostHogClient } from "~/utils/posthog-client"

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()
    const router = useRouter()
    const { analyticsAllowed } = useCookieConsent()

    async function startAnalytics(): Promise<void> {
        if (!analyticsAllowed.value) {
            return
        }

        const requestIdleCallback = window.requestIdleCallback

        if (typeof requestIdleCallback === "function") {
            requestIdleCallback(
                () => {
                    void initPostHogClient(runtimeConfig.public.posthog, router)
                },
                { timeout: 5000 }
            )
            return
        }

        globalThis.setTimeout(() => {
            void initPostHogClient(runtimeConfig.public.posthog, router)
        }, 3500)
    }

    if (analyticsAllowed.value) {
        void startAnalytics()
    } else {
        disablePostHogClient()
    }

    watch(
        analyticsAllowed,
        (isAllowed) => {
            if (isAllowed) {
                void startAnalytics()
                return
            }

            disablePostHogClient()
        },
        { immediate: false }
    )
})
