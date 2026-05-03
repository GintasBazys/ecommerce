import { assertMedusaResponse, fetchMedusaResponse } from "#server/utils/medusa-proxy"

export default defineEventHandler(async (event) => {
    const { id } = event.context.params!

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Missing order id" })
    }

    const response = await fetchMedusaResponse(event, `/store/orders/${encodeURIComponent(id)}/invoices`, {
        method: "GET",
        headers: {
            accept: "application/pdf"
        }
    })

    await assertMedusaResponse(response, "Invoice download failed")

    const buffer = Buffer.from(await response.arrayBuffer())
    const contentDisposition = response.headers.get("content-disposition") || `attachment; filename="invoice-${id}.pdf"`

    setHeader(event, "Content-Type", response.headers.get("content-type") || "application/pdf")
    setHeader(event, "Content-Disposition", contentDisposition)
    setHeader(event, "Content-Length", buffer.length)

    return buffer
})
