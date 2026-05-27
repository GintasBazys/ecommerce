import { canTrackServerAnalytics, useServerPostHog } from "../../utils/posthog"
import { assertCartOwnership } from "#server/utils/cart"
import { assertMedusaResponse, fetchMedusaResponse, forwardSetCookies, getSetCookieHeaders, safeJson } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const { cartId } = await readBody(event)
    const trustedCartId = assertCartOwnership(event, cartId)

    const medusaRes = await fetchMedusaResponse(event, `/store/carts/${trustedCartId}/complete`, { method: "POST" })

    forwardSetCookies(event, getSetCookieHeaders(medusaRes))
    await assertMedusaResponse(medusaRes, "Could not complete this cart.")

    deleteCookie(event, "cart_id", { path: "/" })

    const result = await safeJson<{ order?: { id?: string } } & Record<string, unknown>>(medusaRes)

    if (!result) {
        throw createError({ statusCode: 502, statusMessage: "Could not complete this cart." })
    }

    const sessionId = getHeader(event, "x-posthog-session-id")
    const distinctId = getHeader(event, "x-posthog-distinct-id")

    if (distinctId && canTrackServerAnalytics(event)) {
        const posthog = useServerPostHog()
        posthog?.capture({
            distinctId,
            event: "server_cart_completed",
            properties: {
                $session_id: sessionId,
                cart_id: trustedCartId,
                order_id: result?.order?.id
            }
        })
    }

    return result
})
