const DEFAULT_DATE_LOCALE = "en-US"
const DEFAULT_DATE_TIMEZONE = "UTC"

type DateInput = string | number | Date | null | undefined

function normalizeDate(value: DateInput): Date | null {
    if (!value) {
        return null
    }

    const date = value instanceof Date ? value : new Date(value)

    return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(
    value: DateInput,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric"
    }
): string {
    const date = normalizeDate(value)

    if (!date) {
        return ""
    }

    return new Intl.DateTimeFormat(DEFAULT_DATE_LOCALE, {
        timeZone: DEFAULT_DATE_TIMEZONE,
        ...options
    }).format(date)
}

export function formatDateTime(
    value: DateInput,
    options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }
): string {
    const date = normalizeDate(value)

    if (!date) {
        return ""
    }

    return new Intl.DateTimeFormat(DEFAULT_DATE_LOCALE, {
        timeZone: DEFAULT_DATE_TIMEZONE,
        ...options
    }).format(date)
}
