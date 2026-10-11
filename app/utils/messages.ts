import enMessages from "../../messages/en.json"
import ltMessages from "../../messages/lt.json"
import type { AppLocale } from "../../shared/route-slugs"

export type ErrorMessages = typeof enMessages.errors

const errorsByLocale: Record<AppLocale, ErrorMessages> = {
    en: enMessages.errors,
    lt: ltMessages.errors
}

export function getErrorMessages(locale: AppLocale): ErrorMessages {
    return errorsByLocale[locale]
}
