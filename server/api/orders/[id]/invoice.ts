import type { OrderAddressDTO, OrderDTO, OrderLineItemDTO } from "@medusajs/types"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { fetchStoreOrder } from "#server/utils/orders"

type InvoiceOrderDTO = OrderDTO & {
    payment_status?: string | null
    fulfillment_status?: string | null
}

type InvoiceOrderAddressDTO = OrderAddressDTO & {
    country?: {
        display_name?: string | null
    } | null
}

type FontSet = {
    regular: Awaited<ReturnType<PDFDocument["embedFont"]>>
    bold: Awaited<ReturnType<PDFDocument["embedFont"]>>
}

type DrawContext = {
    doc: PDFDocument
    page: ReturnType<PDFDocument["addPage"]>
    fonts: FontSet
    pageWidth: number
    pageHeight: number
    margin: number
    y: number
}

const INK = rgb(0.1, 0.12, 0.18)
const MUTED = rgb(0.41, 0.45, 0.54)
const BORDER = rgb(0.88, 0.9, 0.94)
const PANEL = rgb(0.97, 0.98, 0.99)
const PANEL_STRONG = rgb(0.95, 0.96, 0.98)
const BRAND = rgb(0.13, 0.22, 0.48)
const BRAND_SOFT = rgb(0.91, 0.94, 0.99)

function formatCurrency(amount: number, currencyCode?: string | null): string {
    const normalizedCurrency = currencyCode?.toUpperCase() ?? "EUR"

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: normalizedCurrency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount / 100)
}

function formatDate(value?: string | Date | null): string {
    if (!value) {
        return "-"
    }

    return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    }).format(new Date(value))
}

function formatStatus(value?: string | null): string {
    if (!value) {
        return "-"
    }

    return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase())
}

function compactLine(parts: Array<string | undefined | null>): string | null {
    const line = parts
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(", ")

    return line || null
}

function addressLines(address?: InvoiceOrderAddressDTO | null, email?: string | null): string[] {
    if (!address) {
        return ["Not provided"]
    }

    const lines = [
        compactLine([address.first_name, address.last_name]),
        address.company ?? null,
        address.address_1 ?? null,
        address.address_2 ?? null,
        compactLine([address.city, address.province, address.postal_code]),
        address.country?.display_name ?? null,
        address.phone ?? null,
        email ?? null
    ].filter((line): line is string => Boolean(line))

    return lines.length ? lines : ["Not provided"]
}

function wrapText(text: string, maxWidth: number, font: FontSet["regular"], fontSize: number): string[] {
    const normalizedText = text.trim()

    if (!normalizedText) {
        return [""]
    }

    const words = normalizedText.split(/\s+/)
    const lines: string[] = []
    let currentLine = ""

    for (const word of words) {
        const nextLine = currentLine ? `${currentLine} ${word}` : word

        if (font.widthOfTextAtSize(nextLine, fontSize) <= maxWidth) {
            currentLine = nextLine
            continue
        }

        if (currentLine) {
            lines.push(currentLine)
            currentLine = word
            continue
        }

        let partialWord = ""
        for (const character of word) {
            const nextWord = `${partialWord}${character}`

            if (font.widthOfTextAtSize(nextWord, fontSize) <= maxWidth) {
                partialWord = nextWord
                continue
            }

            if (partialWord) {
                lines.push(partialWord)
            }
            partialWord = character
        }

        currentLine = partialWord
    }

    if (currentLine) {
        lines.push(currentLine)
    }

    return lines
}

function createPage(doc: PDFDocument): ReturnType<PDFDocument["addPage"]> {
    return doc.addPage([595.28, 841.89])
}

function resetPageState(context: DrawContext): void {
    context.page = createPage(context.doc)
    context.y = context.pageHeight - context.margin
}

function ensureSpace(context: DrawContext, requiredHeight: number): void {
    if (context.y - requiredHeight < context.margin) {
        resetPageState(context)
    }
}

function drawTextLine(
    context: DrawContext,
    text: string,
    options: {
        x?: number
        font?: FontSet["regular"]
        size?: number
        color?: ReturnType<typeof rgb>
    } = {}
): void {
    const x = options.x ?? context.margin
    const font = options.font ?? context.fonts.regular
    const size = options.size ?? 10
    const color = options.color ?? INK

    context.page.drawText(text, {
        x,
        y: context.y,
        size,
        font,
        color
    })
}

function drawParagraph(
    context: DrawContext,
    text: string,
    options: {
        x?: number
        width?: number
        font?: FontSet["regular"]
        size?: number
        color?: ReturnType<typeof rgb>
        lineHeight?: number
    } = {}
): void {
    const x = options.x ?? context.margin
    const width = options.width ?? context.pageWidth - context.margin * 2
    const font = options.font ?? context.fonts.regular
    const size = options.size ?? 10
    const color = options.color ?? INK
    const lineHeight = options.lineHeight ?? size + 4
    const lines = wrapText(text, width, font, size)

    ensureSpace(context, lines.length * lineHeight)

    for (const line of lines) {
        drawTextLine(context, line, { x, font, size, color })
        context.y -= lineHeight
    }
}

function drawKeyValueRows(
    context: DrawContext,
    rows: Array<{ label: string; value: string }>,
    x: number,
    valueX: number,
    width: number
): void {
    for (const row of rows) {
        ensureSpace(context, 28)
        context.page.drawRectangle({
            x,
            y: context.y - 12,
            width: width + (valueX - x),
            height: 24,
            color: PANEL,
            borderColor: BORDER,
            borderWidth: 0.75
        })
        drawTextLine(context, row.label, {
            x: x + 10,
            size: 9,
            color: MUTED
        })

        const lines = wrapText(row.value, width, context.fonts.bold, 10)
        let currentY = context.y + 1
        for (const line of lines) {
            context.page.drawText(line, {
                x: valueX,
                y: currentY,
                size: 10,
                font: context.fonts.bold,
                color: INK
            })
            currentY -= 14
        }

        context.y = currentY - 10
    }
}

function drawSectionHeading(context: DrawContext, text: string): void {
    ensureSpace(context, 30)
    context.page.drawRectangle({
        x: context.margin,
        y: context.y - 8,
        width: context.pageWidth - context.margin * 2,
        height: 20,
        color: BRAND_SOFT
    })
    drawTextLine(context, text.toUpperCase(), {
        x: context.margin + 10,
        font: context.fonts.bold,
        size: 9,
        color: BRAND
    })
    context.y -= 24
}

function drawAddressBlock(context: DrawContext, title: string, lines: string[], x: number, width: number): number {
    const startY = context.y
    const blockHeight = Math.max(90, 26 + lines.reduce((total, line) => total + wrapText(line, width - 20, context.fonts.regular, 10).length * 14, 0))

    context.page.drawRectangle({
        x,
        y: startY - blockHeight + 8,
        width,
        height: blockHeight,
        color: PANEL,
        borderColor: BORDER,
        borderWidth: 0.75
    })

    context.page.drawText(title, {
        x: x + 10,
        y: startY - 2,
        size: 9,
        font: context.fonts.bold,
        color: MUTED
    })

    let currentY = startY - 22
    for (const line of lines) {
        const wrappedLines = wrapText(line, width - 20, context.fonts.regular, 10)
        for (const wrappedLine of wrappedLines) {
            context.page.drawText(wrappedLine, {
                x: x + 10,
                y: currentY,
                size: 10,
                font: context.fonts.regular,
                color: INK
            })
            currentY -= 14
        }
    }

    return startY - blockHeight
}

function drawTableHeader(context: DrawContext): void {
    ensureSpace(context, 30)
    const topY = context.y
    const columns = [
        { label: "Item", x: 50 },
        { label: "SKU", x: 285 },
        { label: "Qty", x: 370 },
        { label: "Unit price", x: 425 },
        { label: "Line total", x: 495 }
    ]

    context.page.drawRectangle({
        x: context.margin,
        y: topY - 6,
        width: context.pageWidth - context.margin * 2,
        height: 20,
        color: PANEL_STRONG
    })

    for (const column of columns) {
        context.page.drawText(column.label, {
            x: column.x,
            y: topY,
            size: 9,
            font: context.fonts.bold,
            color: MUTED
        })
    }

    context.page.drawLine({
        start: { x: context.margin, y: topY - 8 },
        end: { x: context.pageWidth - context.margin, y: topY - 8 },
        thickness: 1,
        color: BORDER
    })

    context.y -= 22
}

function drawItemRow(context: DrawContext, item: OrderLineItemDTO, currencyCode?: string | null): void {
    const descriptionLines = wrapText(item.product_title ?? "Item", 220, context.fonts.bold, 10)
    const optionText = [item.variant_title, item.product_description].filter(Boolean).join(" - ")
    const optionLines = optionText ? wrapText(optionText, 220, context.fonts.regular, 9) : []
    const skuLines = wrapText(item.variant_sku ?? "-", 70, context.fonts.regular, 9)
    const rowLineCount = Math.max(descriptionLines.length + optionLines.length, skuLines.length, 1)
    const rowHeight = Math.max(34, rowLineCount * 13 + 12)

    ensureSpace(context, rowHeight + 8)

    if (context.y < context.pageHeight - context.margin - 26 && context.y + rowHeight > context.pageHeight - context.margin - 26) {
        drawTableHeader(context)
    }

    context.page.drawRectangle({
        x: context.margin,
        y: context.y - rowHeight + 10,
        width: context.pageWidth - context.margin * 2,
        height: rowHeight,
        color: PANEL,
        borderColor: BORDER,
        borderWidth: 0.5
    })

    let textY = context.y - 2
    for (const line of descriptionLines) {
        context.page.drawText(line, {
            x: 50,
            y: textY,
            size: 10,
            font: context.fonts.bold,
            color: INK
        })
        textY -= 13
    }

    for (const line of optionLines) {
        context.page.drawText(line, {
            x: 50,
            y: textY,
            size: 9,
            font: context.fonts.regular,
            color: MUTED
        })
        textY -= 12
    }

    let skuY = context.y - 2
    for (const line of skuLines) {
        context.page.drawText(line, {
            x: 285,
            y: skuY,
            size: 9,
            font: context.fonts.regular,
            color: INK
        })
        skuY -= 12
    }

    context.page.drawText(String(item.quantity ?? 0), {
        x: 370,
        y: context.y - 2,
        size: 10,
        font: context.fonts.regular,
        color: INK
    })

    const unitPrice = formatCurrency(Number(item.unit_price ?? 0), currencyCode)
    const lineTotal = formatCurrency(Number(item.total ?? 0), currencyCode)

    context.page.drawText(unitPrice, {
        x: 425,
        y: context.y - 2,
        size: 10,
        font: context.fonts.regular,
        color: INK
    })

    context.page.drawText(lineTotal, {
        x: 495,
        y: context.y - 2,
        size: 10,
        font: context.fonts.bold,
        color: INK
    })

    context.y -= rowHeight
}

function drawTotals(context: DrawContext, order: InvoiceOrderDTO): void {
    const totalXLabel = 390
    const totalXValue = 495

    const rows = [
        { label: "Subtotal", value: formatCurrency(Number(order.subtotal ?? 0), order.currency_code), bold: false },
        { label: "Shipping", value: formatCurrency(Number(order.shipping_total ?? 0), order.currency_code), bold: false },
        { label: "Tax", value: formatCurrency(Number(order.tax_total ?? 0), order.currency_code), bold: false },
        { label: "Total", value: formatCurrency(Number(order.total ?? 0), order.currency_code), bold: true }
    ]

    ensureSpace(context, 118)
    context.page.drawRectangle({
        x: 360,
        y: context.y - 82,
        width: context.pageWidth - 360 - context.margin,
        height: 96,
        color: PANEL,
        borderColor: BORDER,
        borderWidth: 0.75
    })

    for (const row of rows) {
        context.page.drawText(row.label, {
            x: totalXLabel,
            y: context.y,
            size: 10,
            font: row.bold ? context.fonts.bold : context.fonts.regular,
            color: row.bold ? INK : MUTED
        })
        const valueWidth = (row.bold ? context.fonts.bold : context.fonts.regular).widthOfTextAtSize(row.value, 10)
        context.page.drawText(row.value, {
            x: totalXValue + 40 - valueWidth,
            y: context.y,
            size: 10,
            font: row.bold ? context.fonts.bold : context.fonts.regular,
            color: INK
        })
        context.y -= 18

        if (row.label === "Tax") {
            context.page.drawLine({
                start: { x: totalXLabel, y: context.y + 8 },
                end: { x: context.pageWidth - context.margin, y: context.y + 8 },
                thickness: 1,
                color: BORDER
            })
            context.y -= 8
        }
    }
}

function buildInvoiceNumber(order: InvoiceOrderDTO): string {
    return `INV-${order.display_id ?? order.id.slice(0, 8)}`
}

function buildFileName(order: InvoiceOrderDTO): string {
    const dateStamp = new Date(order.created_at ?? Date.now()).toISOString().slice(0, 10)
    return `Invoice-${order.display_id ?? order.id}-${dateStamp}.pdf`
}

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Order id is required" })
    }

    const order = (await fetchStoreOrder(event, id)) as InvoiceOrderDTO
    const doc = await PDFDocument.create()
    const regular = await doc.embedFont(StandardFonts.Helvetica)
    const bold = await doc.embedFont(StandardFonts.HelveticaBold)
    const firstPage = createPage(doc)
    const pageWidth = firstPage.getWidth()
    const pageHeight = firstPage.getHeight()
    const margin = 50

    const context: DrawContext = {
        doc,
        page: firstPage,
        fonts: { regular, bold },
        pageWidth,
        pageHeight,
        margin,
        y: pageHeight - margin
    }

    const invoiceNumber = buildInvoiceNumber(order)
    const billingLines = addressLines(order.billing_address, order.email)
    const shippingLines = addressLines(order.shipping_address, order.email)

    context.page.drawRectangle({
        x: margin,
        y: context.y - 72,
        width: pageWidth - margin * 2,
        height: 82,
        color: BRAND
    })
    context.page.drawRectangle({
        x: margin,
        y: context.y - 72,
        width: 148,
        height: 82,
        color: rgb(0.16, 0.27, 0.56)
    })

    context.page.drawText("Ecommerce", {
        x: margin + 18,
        y: context.y - 18,
        size: 22,
        font: bold,
        color: rgb(1, 1, 1)
    })
    context.page.drawText("Premium order invoice", {
        x: margin + 18,
        y: context.y - 38,
        size: 10,
        font: regular,
        color: rgb(0.9, 0.93, 0.98)
    })
    context.page.drawText("INVOICE", {
        x: pageWidth - margin - 82,
        y: context.y - 22,
        size: 11,
        font: bold,
        color: rgb(0.87, 0.91, 0.99)
    })
    context.page.drawText(invoiceNumber, {
        x: pageWidth - margin - 92,
        y: context.y - 42,
        size: 16,
        font: bold,
        color: rgb(1, 1, 1)
    })
    context.y -= 92

    drawKeyValueRows(
        context,
        [
            { label: "Invoice number", value: invoiceNumber },
            { label: "Order reference", value: `#${order.display_id ?? order.id}` },
            { label: "Issue date", value: formatDate(order.created_at) },
            { label: "Payment terms", value: order.payment_status === "captured" ? "Paid in full" : "Due on receipt" },
            { label: "Payment status", value: formatStatus(order.payment_status) },
            { label: "Fulfillment status", value: formatStatus(order.fulfillment_status) }
        ],
        margin,
        188,
        pageWidth - 188 - margin - 10
    )

    context.y -= 4
    drawSectionHeading(context, "Bill to / Ship to")
    ensureSpace(context, 132)

    const billEndY = drawAddressBlock(context, "Billing address", billingLines, margin, 232)
    const shipEndY = drawAddressBlock(context, "Shipping address", shippingLines, 312, 232)
    context.y = Math.min(billEndY, shipEndY) - 16

    drawSectionHeading(context, "Line items")
    drawTableHeader(context)

    for (const item of order.items ?? []) {
        if (context.y - 48 < margin) {
            resetPageState(context)
            drawSectionHeading(context, "Line items")
            drawTableHeader(context)
        }

        drawItemRow(context, item, order.currency_code)
    }

    context.y -= 12
    drawTotals(context, order)
    context.y -= 16

    drawSectionHeading(context, "Additional information")
    drawParagraph(context, `Shipping method: ${order.shipping_methods?.[0]?.name ?? "Unavailable"}`, { size: 10 })
    drawParagraph(context, `Customer email: ${order.email ?? "Unavailable"}`, { size: 10 })
    drawParagraph(
        context,
        order.payment_status === "captured"
            ? "This document serves as a payment receipt and invoice for the completed order above."
            : "This document reflects the current order totals. Payment is still pending for this order.",
        { size: 10 }
    )

    const pageCount = doc.getPageCount()
    for (let index = 0; index < pageCount; index += 1) {
        const page = doc.getPage(index)
        page.drawLine({
            start: { x: margin, y: 34 },
            end: { x: pageWidth - margin, y: 34 },
            thickness: 1,
            color: BORDER
        })
        page.drawText(`Invoice ${invoiceNumber}`, {
            x: margin,
            y: 20,
            size: 9,
            font: regular,
            color: MUTED
        })
        page.drawText(`Page ${index + 1} of ${pageCount}`, {
            x: pageWidth - margin - 54,
            y: 20,
            size: 9,
            font: regular,
            color: MUTED
        })
    }

    const pdfBytes = await doc.save()

    return new Response(Buffer.from(pdfBytes), {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${buildFileName(order)}"`,
            "Cache-Control": "no-store"
        }
    })
})
