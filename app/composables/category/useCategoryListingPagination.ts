import type { ComputedRef, Ref } from "vue"
import type { LocationQueryRaw, LocationQueryValue } from "vue-router"

export function parseCategoryPage(value: LocationQueryValue | LocationQueryValue[] | undefined): number {
    const source = Array.isArray(value) ? value[0] : value

    if (typeof source !== "string" || source.trim() === "") {
        return 1
    }

    const parsed = Number.parseInt(source, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1
}

export function useCategoryListingPagination(options: {
    totalCount: Ref<number>
    limit: number
    buildQueryState: (_page?: number) => LocationQueryRaw
}) {
    const route = useRoute()
    const currentPage = computed<number>(() => parseCategoryPage(route.query.page))
    const totalPages = computed<number>(() => Math.max(1, Math.ceil(options.totalCount.value / options.limit)))
    const offset = computed<number>(() => (currentPage.value - 1) * options.limit)
    const paginationLabel = computed<string>(() => `Page ${currentPage.value} of ${totalPages.value}`)
    const paginationItems = computed<(number | string)[]>(() => buildPaginationItems(currentPage, totalPages))

    function buildPageLink(page: number): { query: LocationQueryRaw } {
        return {
            query: options.buildQueryState(page)
        }
    }

    return {
        currentPage,
        totalPages,
        offset,
        paginationLabel,
        paginationItems,
        buildPageLink
    }
}

function buildPaginationItems(currentPage: ComputedRef<number>, totalPages: ComputedRef<number>): (number | string)[] {
    if (totalPages.value <= 7) {
        return Array.from({ length: totalPages.value }, (_, index) => index + 1)
    }

    const pages = new Set<number>([1, totalPages.value, currentPage.value])

    if (currentPage.value > 1) {
        pages.add(currentPage.value - 1)
    }

    if (currentPage.value < totalPages.value) {
        pages.add(currentPage.value + 1)
    }

    const sortedPages = [...pages].sort((left, right) => left - right)
    const items: (number | string)[] = []

    for (const page of sortedPages) {
        const previousPage = items.at(-1)

        if (typeof previousPage === "number" && page - previousPage > 1) {
            items.push(`ellipsis-${previousPage}-${page}`)
        }

        items.push(page)
    }

    return items
}
