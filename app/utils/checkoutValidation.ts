export const checkoutEmailRules = [
    (value: string) => !!value || "E-mail is required",
    (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || "E-mail must be valid"
]

export const checkoutPasswordRules = [(value: string) => !!value || "Password is required"]

export const checkoutAddressRules = {
    required: (value: unknown): boolean | string => (value !== null && value !== undefined && value !== "") || "This field is required",
    phone: (value: string): boolean | string => /^[+]?[\d\s-]{7,}$/.test(value) || "Enter a valid phone number"
}

export function clearValidationErrors<T extends Record<string, string>>(errors: T): void {
    for (const key of Object.keys(errors) as Array<keyof T>) {
        errors[key] = "" as T[keyof T]
    }
}

export function runValidationRules(value: unknown, rules: Array<(_value: string) => boolean | string>): string {
    const normalizedValue = typeof value === "string" ? value : String(value ?? "")

    for (const rule of rules) {
        const result = rule(normalizedValue)

        if (result !== true) {
            return typeof result === "string" ? result : "Invalid value"
        }
    }

    return ""
}

export function getCheckoutErrorMessage(
    error: unknown,
    fallbackMessage: string
): string {
    if (typeof error === "object" && error !== null) {
        const typedError = error as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
        return typedError.data?.statusMessage ?? typedError.statusMessage ?? typedError.message ?? fallbackMessage
    }

    return fallbackMessage
}
