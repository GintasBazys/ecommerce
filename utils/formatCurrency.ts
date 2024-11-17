export const formatCurrency = (amount: number | bigint, currencyCode: string) => {
    const formatter = new Intl.NumberFormat("lt-LT", {
        style: "currency",
        currency: currencyCode.toUpperCase()
    })
    return formatter.format(amount)
}
