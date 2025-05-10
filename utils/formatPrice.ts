export function formatPrice(cents: number, currency: string) {
    if (!currency) {
        console.warn("Missing currency code, defaulting")
        currency = DEFAULT_CURENCY
    }
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2
    }).format(cents)
}
