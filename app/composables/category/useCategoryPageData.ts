import type { ProductCategoryDTO } from "@medusajs/types"
import type { LocationQuery } from "vue-router"

import type { BreadcrumbItem } from "~/types/breadcrumbs"
import type { CategoryImage } from "~/types/category-listing"
import { ALL_PRODUCTS_URL_HANDLE, CATEGORY_HANDLE } from "~/utils/consts"

type LoadCategoryPageOptions = {
    isChangingCategoryPage: Ref<boolean>
    resetCategoryPageState: () => void
    applyQueryStateFromRoute: (_query: LocationQuery) => void
    fetchProducts: (_source: "initial") => Promise<void>
}

const ALL_PRODUCTS_SLUG = "all-products"
const ALL_PRODUCTS_DESCRIPTION =
    "Browse the full product catalog with category filters, sorting, and clear paginated navigation across every listing page."

export function useCategoryPageData() {
    const route = useRoute()
    const event = useRequestEvent()
    const category = ref<ProductCategoryDTO | null>(null)
    const notFoundPath = ref<string | null>(null)

    const isAllProductsPage = computed<boolean>(() => String(route.params.slug || "") === ALL_PRODUCTS_SLUG)
    const categoryThumbnail = computed<string | null>(() => {
        if (isAllProductsPage.value) {
            return null
        }

        const images = ((category.value as ProductCategoryDTO & { product_category_image?: CategoryImage[] })?.product_category_image ??
            []) as CategoryImage[]
        return images.find((image) => image.type === "thumbnail")?.url || images.find((image) => image.url)?.url || null
    })
    const heroFallbackImage = computed<string>(() => (isAllProductsPage.value ? "/images/hero-premium.jpg" : "/images/hero-main.jpg"))
    const heroImage = computed<string>(() => categoryThumbnail.value || heroFallbackImage.value)
    const categoryPath = computed<string>(() =>
        isAllProductsPage.value ? ALL_PRODUCTS_URL_HANDLE : `${CATEGORY_HANDLE}/${String(route.params.slug || "")}`
    )
    const pageHeading = computed<string>(() => (isAllProductsPage.value ? "All Products" : category.value?.name || "Category"))
    const basePageDescription = computed<string>(() => (isAllProductsPage.value ? ALL_PRODUCTS_DESCRIPTION : category.value?.description || ""))
    const sidebarTitle = computed<string>(() => (isAllProductsPage.value ? "Refine every product" : "Refine this category"))
    const emptyStateText = computed<string>(() => "Try clearing some filters or browsing another category.")
    const heroEyebrow = computed<string>(() => (isAllProductsPage.value ? "Store catalog" : "Category"))
    const breadcrumbItems = computed<BreadcrumbItem[]>(() => [{ label: "Home", to: "/" }, { label: pageHeading.value }])

    function markNotFound(): void {
        notFoundPath.value = route.fullPath

        if (event) {
            setResponseStatus(event, 404)
        }
    }

    async function loadCategoryPage({
        isChangingCategoryPage,
        resetCategoryPageState,
        applyQueryStateFromRoute,
        fetchProducts
    }: LoadCategoryPageOptions): Promise<void> {
        isChangingCategoryPage.value = true
        notFoundPath.value = null
        category.value = null
        resetCategoryPageState()
        applyQueryStateFromRoute(route.query)

        if (!isAllProductsPage.value) {
            try {
                category.value = await $fetch<ProductCategoryDTO | null>(`/api/categories/${String(route.params.slug || "")}`)
            } catch {
                category.value = null
            }

            if (!category.value) {
                markNotFound()
                isChangingCategoryPage.value = false
                return
            }
        }

        try {
            await fetchProducts("initial")
        } finally {
            isChangingCategoryPage.value = false
        }
    }

    return {
        category,
        notFoundPath,
        isAllProductsPage,
        heroImage,
        categoryPath,
        pageHeading,
        basePageDescription,
        sidebarTitle,
        emptyStateText,
        heroEyebrow,
        breadcrumbItems,
        loadCategoryPage
    }
}
