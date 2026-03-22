import type { OrderAddressDTO, OrderDTO, OrderLineItemDTO } from "@medusajs/types"

import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

import { fetchStoreOrder } from "#server/utils/orders"

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

function addressLines(address?: OrderAddressDTO | null, email?: string | null): string[] {
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
    const color = options.color ?? rgb(0.09, 0.13, 0.2)

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
    const color = options.color ?? rgb(0.09, 0.13, 0.2)
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
        ensureSpace(context, 18)
        drawTextLine(context, row.label, {
            x,
            size: 10,
            color: rgb(0.39, 0.44, 0.52)
        })

        const lines = wrapText(row.value, width, context.fonts.bold, 10)
        let currentY = context.y
        for (const line of lines) {
            context.page.drawText(line, {
                x: valueX,
                y: currentY,
                size: 10,
                font: context.fonts.bold,
                color: rgb(0.09, 0.13, 0.2)
            })
            currentY -= 14
        }

        context.y = currentY - 4
    }
}

function drawSectionHeading(context: DrawContext, text: string): void {
    ensureSpace(context, 26)
    drawTextLine(context, text.toUpperCase(), {
        font: context.fonts.bold,
        size: 10,
        color: rgb(0.15, 0.28, 0.6)
    })
    context.y -= 20
}

function drawAddressBlock(context: DrawContext, title: string, lines: string[], x: number, width: number): number {
    const startY = context.y

    context.page.drawText(title, {
        x,
        y: startY,
        size: 10,
        font: context.fonts.bold,
        color: rgb(0.39, 0.44, 0.52)
    })

    let currentY = startY - 18
    for (const line of lines) {
        const wrappedLines = wrapText(line, width, context.fonts.regular, 10)
        for (const wrappedLine of wrappedLines) {
            context.page.drawText(wrappedLine, {
                x,
                y: currentY,
                size: 10,
                font: context.fonts.regular,
                color: rgb(0.09, 0.13, 0.2)
            })
            currentY -= 14
        }
    }

    return currentY
}

function drawTableHeader(context: DrawContext): void {
    ensureSpace(context, 28)
    const topY = context.y
    const columns = [
        { label: "Item", x: 50 },
        { label: "SKU", x: 285 },
        { label: "Qty", x: 370 },
        { label: "Unit price", x: 425 },
        { label: "Line total", x: 495 }
    ]

    for (const column of columns) {
        context.page.drawText(column.label, {
            x: column.x,
            y: topY,
            size: 9,
            font: context.fonts.bold,
            color: rgb(0.39, 0.44, 0.52)
        })
    }

    context.page.drawLine({
        start: { x: context.margin, y: topY - 8 },
        end: { x: context.pageWidth - context.margin, y: topY - 8 },
        thickness: 1,
        color: rgb(0.88, 0.9, 0.94)
    })

    context.y -= 22
}

function drawItemRow(context: DrawContext, item: OrderLineItemDTO, currencyCode?: string | null): void {
    const descriptionLines = wrapText(item.product_title ?? "Item", 220, context.fonts.bold, 10)
    const optionText = [item.variant_title, item.product_description].filter(Boolean).join(" - ")
    const optionLines = optionText ? wrapText(optionText, 220, context.fonts.regular, 9) : []
    const skuLines = wrapText(item.variant_sku ?? "-", 70, context.fonts.regular, 9)
    const rowLineCount = Math.max(descriptionLines.length + optionLines.length, skuLines.length, 1)
    const rowHeight = Math.max(30, rowLineCount * 13 + 8)

    ensureSpace(context, rowHeight + 8)

    if (context.y < context.pageHeight - context.margin - 26 && context.y + rowHeight > context.pageHeight - context.margin - 26) {
        drawTableHeader(context)
    }

    let textY = context.y
    for (const line of descriptionLines) {
        context.page.drawText(line, {
            x: 50,
            y: textY,
            size: 10,
            font: context.fonts.bold,
            color: rgb(0.09, 0.13, 0.2)
        })
        textY -= 13
    }

    for (const line of optionLines) {
        context.page.drawText(line, {
            x: 50,
            y: textY,
            size: 9,
            font: context.fonts.regular,
            color: rgb(0.39, 0.44, 0.52)
        })
        textY -= 12
    }

    let skuY = context.y
    for (const line of skuLines) {
        context.page.drawText(line, {
            x: 285,
            y: skuY,
            size: 9,
            font: context.fonts.regular,
            color: rgb(0.09, 0.13, 0.2)
        })
        skuY -= 12
    }

    context.page.drawText(String(item.quantity ?? 0), {
        x: 370,
        y: context.y,
        size: 10,
        font: context.fonts.regular,
        color: rgb(0.09, 0.13, 0.2)
    })

    context.page.drawText(formatCurrency(Number(item.unit_price ?? 0), currencyCode), {
        x: 425,
        y: context.y,
        size: 10,
        font: context.fonts.regular,
        color: rgb(0.09, 0.13, 0.2)
    })

    context.page.drawText(formatCurrency(Number(item.total ?? 0), currencyCode), {
        x: 495,
        y: context.y,
        size: 10,
        font: context.fonts.bold,
        color: rgb(0.09, 0.13, 0.2)
    })

    context.page.drawLine({
        start: { x: context.margin, y: context.y - rowHeight + 8 },
        end: { x: context.pageWidth - context.margin, y: context.y - rowHeight + 8 },
        thickness: 1,
        color: rgb(0.94, 0.95, 0.97)
    })

    context.y -= rowHeight
}

function drawTotals(context: DrawContext, order: OrderDTO): void {
    const totalXLabel = 390
    const totalXValue = 495

    const rows = [
        { label: "Subtotal", value: formatCurrency(Number(order.subtotal ?? 0), order.currency_code), bold: false },
        { label: "Shipping", value: formatCurrency(Number(order.shipping_total ?? 0), order.currency_code), bold: false },
        { label: "Tax", value: formatCurrency(Number(order.tax_total ?? 0), order.currency_code), bold: false },
        { label: "Total", value: formatCurrency(Number(order.total ?? 0), order.currency_code), bold: true }
    ]

    ensureSpace(context, 90)

    for (const row of rows) {
        context.page.drawText(row.label, {
            x: totalXLabel,
            y: context.y,
            size: 10,
            font: row.bold ? context.fonts.bold : context.fonts.regular,
            color: rgb(0.09, 0.13, 0.2)
        })
        context.page.drawText(row.value, {
            x: totalXValue,
            y: context.y,
            size: 10,
            font: row.bold ? context.fonts.bold : context.fonts.regular,
            color: rgb(0.09, 0.13, 0.2)
        })
        context.y -= 18

        if (row.label === "Tax") {
            context.page.drawLine({
                start: { x: totalXLabel, y: context.y + 8 },
                end: { x: context.pageWidth - context.margin, y: context.y + 8 },
                thickness: 1,
                color: rgb(0.88, 0.9, 0.94)
            })
            context.y -= 8
        }
    }
}

function buildInvoiceNumber(order: OrderDTO): string {
    return `INV-${order.display_id ?? order.id.slice(0, 8)}`
}

function buildFileName(order: OrderDTO): string {
    const dateStamp = new Date(order.created_at ?? Date.now()).toISOString().slice(0, 10)
    return `Invoice-${order.display_id ?? order.id}-${dateStamp}.pdf`
}

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id) {
        throw createError({ statusCode: 400, statusMessage: "Order id is required" })
    }

    const order = await fetchStoreOrder(event, id)
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

    drawTextLine(context, "Ecommerce", {
        font: bold,
        size: 24,
        color: rgb(0.11, 0.2, 0.46)
    })
    context.y -= 18

    drawTextLine(context, "Invoice", {
        font: bold,
        size: 16,
        color: rgb(0.09, 0.13, 0.2)
    })
    context.y -= 24

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
        170,
        pageWidth - 170 - margin
    )

    context.y -= 8
    drawSectionHeading(context, "Bill to / Ship to")
    ensureSpace(context, 120)

    const addressTopY = context.y
    const billEndY = drawAddressBlock(context, "Billing address", billingLines, margin, 220)
    const shipEndY = drawAddressBlock(context, "Shipping address", shippingLines, 310, 220)
    context.y = Math.min(billEndY, shipEndY) - 12

    context.page.drawLine({
        start: { x: margin, y: addressTopY + 18 },
        end: { x: pageWidth - margin, y: addressTopY + 18 },
        thickness: 1,
        color: rgb(0.88, 0.9, 0.94)
    })

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
            color: rgb(0.88, 0.9, 0.94)
        })
        page.drawText(`Invoice ${invoiceNumber}`, {
            x: margin,
            y: 20,
            size: 9,
            font: regular,
            color: rgb(0.39, 0.44, 0.52)
        })
        page.drawText(`Page ${index + 1} of ${pageCount}`, {
            x: pageWidth - margin - 54,
            y: 20,
            size: 9,
            font: regular,
            color: rgb(0.39, 0.44, 0.52)
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
