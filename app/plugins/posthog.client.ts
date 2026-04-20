import { disablePostHogClient, initPostHogClient } from "~/utils/posthog-client"

export default defineNuxtPlugin(() => {
    const runtimeConfig = useRuntimeConfig()
    const router = useRouter()
    const { analyticsAllowed } = useCookieConsent()

    if (analyticsAllowed.value) {
        initPostHogClient(runtimeConfig.public.posthog, router)
    } else {
        disablePostHogClient()
    }

    watch(
        analyticsAllowed,
        (isAllowed) => {
            if (isAllowed) {
                initPostHogClient(runtimeConfig.public.posthog, router)
                return
            }

            disablePostHogClient()
        },
        { immediate: false }
    )
})
