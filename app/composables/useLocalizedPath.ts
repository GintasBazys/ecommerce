import { canonicalizePath, localizePath } from "~/utils/locale"

export function useLocalizedPath() {
    const { currentLocale } = storeToRefs(useLocaleStore())

    function localizedPath(path: string): string {
        return localizePath(path, currentLocale.value)
    }

    return { currentLocale, canonicalizePath, localizedPath }
}
