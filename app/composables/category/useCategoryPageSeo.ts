import type { Ref } from "vue"

import { useSiteIdentity, type SchemaNode, createBreadcrumbSchema, useStructuredData } from "~/composables/shared/useStructuredData"
import type { CategoryProductsResponse } from "~/types/category-listing"
import { PRODUCT_URL_HANDLE } from "~/utils/consts"

type UseCategoryPageSeoOptions = {
    notFoundPath: Ref<string | null>
    pageHeading: Readonly<Ref<string>>
    basePageDescription: Readonly<Ref<string>>
    categoryPath: Readonly<Ref<string>>
    hasFacetedQuery: Readonly<Ref<boolean>>
    currentPage: Readonly<Ref<number>>
    totalPages: Readonly<Ref<number>>
    totalCount: Ref<number>
    products: Ref<CategoryProductsResponse["products"]>
    offset: Readonly<Ref<number>>
}

export function useCategoryPageSeo({
    notFoundPath,
    pageHeading,
    basePageDescription,
    categoryPath,
    hasFacetedQuery,
    currentPage,
    totalPages,
    totalCount,
    products,
    offset
}: UseCategoryPageSeoOptions) {
    const { absoluteUrl } = useSiteIdentity()

    const currentListingPath = computed<string>(() => {
        if (currentPage.value <= 1) {
            return categoryPath.value
        }

        return `${categoryPath.value}?page=${currentPage.value}`
    })
    const canonicalPath = computed<string>(() => (hasFacetedQuery.value ? categoryPath.value : currentListingPath.value))
    const metaTitle = computed<string>(() => {
        if (currentPage.value <= 1) {
            return `${pageHeading.value} | Medusa Commerce`
        }

        return `${pageHeading.value} - Page ${currentPage.value} | Medusa Commerce`
    })
    const metaDescription = computed<string>(() => {
        const baseDescription = basePageDescription.value || `Browse products in ${pageHeading.value}.`

        if (currentPage.value <= 1) {
            return baseDescription
        }

        return `${baseDescription} Page ${currentPage.value} of ${totalPages.value}.`
    })
    const collectionSchema = computed<SchemaNode | null>(() => {
        if (notFoundPath.value || !pageHeading.value) {
            return null
        }

        return {
            "@type": "CollectionPage",
            "@id": `${absoluteUrl(canonicalPath.value)}#collection`,
            name: pageHeading.value,
            description: metaDescription.value || undefined,
            url: absoluteUrl(canonicalPath.value),
            mainEntity: products.value.length
                ? {
                      "@type": "ItemList",
                      numberOfItems: totalCount.value,
                      itemListElement: products.value.map((product, index) => ({
                          "@type": "ListItem",
                          position: offset.value + index + 1,
                          url: absoluteUrl(product.handle ? `${PRODUCT_URL_HANDLE}/${product.handle}` : categoryPath.value),
                          name: product.title
                      }))
                  }
                : undefined
        }
    })

    const breadcrumbSchema = computed<SchemaNode | null>(() =>
        notFoundPath.value
            ? null
            : createBreadcrumbSchema(
                  [
                      { name: "Home", path: "/" },
                      { name: pageHeading.value, path: categoryPath.value }
                  ],
                  absoluteUrl
              )
    )

    useHead(() => {
        if (notFoundPath.value) {
            return {
                title: "404 | Medusa Commerce",
                meta: [
                    {
                        name: "description",
                        content: "The requested page could not be found. Continue browsing current products and active storefront pages."
                    },
                    { name: "robots", content: "noindex,follow" }
                ]
            }
        }

        const links: { rel: string; href: string }[] = [{ rel: "canonical", href: absoluteUrl(canonicalPath.value) }]

        if (!hasFacetedQuery.value && totalPages.value > 1) {
            if (currentPage.value > 1) {
                links.push({
                    rel: "prev",
                    href: absoluteUrl(currentPage.value - 1 === 1 ? categoryPath.value : `${categoryPath.value}?page=${currentPage.value - 1}`)
                })
            }

            if (currentPage.value < totalPages.value) {
                links.push({ rel: "next", href: absoluteUrl(`${categoryPath.value}?page=${currentPage.value + 1}`) })
            }
        }

        return {
            title: metaTitle.value,
            link: links,
            meta: [
                { name: "description", content: metaDescription.value },
                { name: "robots", content: hasFacetedQuery.value ? "noindex,follow" : "index,follow" }
            ]
        }
    })

    useStructuredData(() => [collectionSchema.value, breadcrumbSchema.value], "category-structured-data")
}
