import { DEFAULT_LOCALE, getPathLocale, localizePath, normalizeLocale } from "~/utils/locale"

export default defineNuxtRouteMiddleware((to) => {
    const localeStore = useLocaleStore()
    const pathLocale = getPathLocale(to.path)

    if (pathLocale) {
        localeStore.setLocale(pathLocale)
        const localizedPath = localizePath(to.fullPath, pathLocale)

        if (localizedPath !== to.fullPath) {
            return navigateTo(localizedPath, { redirectCode: 301 })
        }

        return
    }

    const selectedLocale = normalizeLocale(localeStore.currentLocale) ?? DEFAULT_LOCALE

    if (selectedLocale !== DEFAULT_LOCALE) {
        return navigateTo(localizePath(to.fullPath, selectedLocale), { redirectCode: 302 })
    }

    localeStore.setLocale(DEFAULT_LOCALE)
})
