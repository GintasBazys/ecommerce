import { fetchStoreOrder } from "#server/utils/orders"

export default defineEventHandler(async (event) => {
    const { id } = event.context.params!

    return { order: await fetchStoreOrder(event, id ?? "") }
})
