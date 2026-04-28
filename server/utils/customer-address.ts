type CustomerAddressPayload = {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
    company?: string
    address_name?: string
    metadata?: Record<string, unknown>
    is_default_shipping?: boolean
    is_default_billing?: boolean
}

const requiredAddressFields = ["first_name", "last_name", "address_1", "city", "province", "postal_code", "country_code", "phone"] as const

type RequiredAddressField = (typeof requiredAddressFields)[number]

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getTrimmedString(body: Record<string, unknown>, field: string): string {
    const value = body[field]
    return typeof value === "string" ? value.trim() : ""
}

export function validateCustomerAddressPayload(body: unknown): CustomerAddressPayload {
    if (!isRecord(body)) {
        throw createError({ statusCode: 400, statusMessage: "Address details are required" })
    }

    const missingFields = requiredAddressFields.filter((field: RequiredAddressField) => !getTrimmedString(body, field))

    if (missingFields.length) {
        throw createError({ statusCode: 400, statusMessage: "Complete all required address fields" })
    }

    const phone = getTrimmedString(body, "phone")

    if (!/^[+]?\d[\d\s-]{6,}$/.test(phone)) {
        throw createError({ statusCode: 400, statusMessage: "Enter a valid phone number" })
    }

    const metadata = body.metadata

    return {
        first_name: getTrimmedString(body, "first_name"),
        last_name: getTrimmedString(body, "last_name"),
        address_1: getTrimmedString(body, "address_1"),
        address_2: getTrimmedString(body, "address_2"),
        city: getTrimmedString(body, "city"),
        province: getTrimmedString(body, "province"),
        postal_code: getTrimmedString(body, "postal_code"),
        country_code: getTrimmedString(body, "country_code").toLowerCase(),
        phone,
        company: getTrimmedString(body, "company"),
        address_name: getTrimmedString(body, "address_name"),
        metadata: isRecord(metadata) ? metadata : {},
        is_default_shipping: body.is_default_shipping === true,
        is_default_billing: body.is_default_billing === true
    }
}
