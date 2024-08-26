export const formatCurrency = (amount, currencyCode) => {
    // Create a formatter based on the currency code and locale
    const formatter = new Intl.NumberFormat("lt-LT", {
        style: "currency",
        currency: currencyCode.toUpperCase()
    })
    return formatter.format(amount)
}
