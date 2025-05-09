export function formatPrice(cents: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: 2
    }).format(cents)
}
