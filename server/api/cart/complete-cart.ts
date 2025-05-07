export default eventHandler(async (event) => {
    const config = useRuntimeConfig()
    const { cartId } = await readBody(event)

    if (!cartId) {
        throw new Error("Cart ID is required.")
    }

    try {
        const completeResponse = await fetch(`${config.public.MEDUSA_URL}/store/carts/${cartId}/complete`, {
            method: "POST",
            headers: {
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY,
                "Content-Type": "application/json"
            },
            credentials: "include"
        })

        if (!completeResponse.ok) {
            const errorData = await completeResponse.json()
            throw new Error(`Cart completion failed: ${errorData.message}`)
        }

        const result = await completeResponse.json()
        return result
    } catch (error) {
        console.error("Error completing cart:", error)
        throw new Error("Cart completion error.")
    }
})
