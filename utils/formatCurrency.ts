export const formatCurrency = (amount, currencyCode) => {
    const formatter = new Intl.NumberFormat("lt-LT", {
        style: "currency",
        currency: currencyCode.toUpperCase()
    })
    return formatter.format(amount)
}
