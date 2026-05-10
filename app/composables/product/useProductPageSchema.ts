import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"
import type { ComputedRef } from "vue"
import { createBreadcrumbSchema, type SchemaNode, useStructuredData } from "~/composables/shared/useStructuredData"
import type { ProductCategorySummary, ProductGalleryImage } from "~/types/product"

import type { Review } from "@/types/interfaces"
import { normalizeSchemaDate } from "~/composables/shared/useStructuredData"
import { DEFAULT_CURENCY } from "~/utils/consts"

export function useProductPageSchema(options: {
    product: ComputedRef<ProductDTO | null>
    productTitle: ComputedRef<string>
    productDescription: ComputedRef<string>
    productPath: ComputedRef<string>
    productUrl: ComputedRef<string>
    productImages: ComputedRef<ProductGalleryImage[]>
    selectedVariant: ComputedRef<ProductVariantDTO | null>
    primaryCategory: ComputedRef<ProductCategorySummary | null>
    reviews: ComputedRef<Review[]>
    reviewAverage: ComputedRef<number>
    displayedReviewAverage: ComputedRef<number | null>
    displayedReviewCount: ComputedRef<number>
    inStock: ComputedRef<boolean>
    siteName: ComputedRef<string>
    organizationId: ComputedRef<string>
    absoluteUrl: (_path?: string) => string
}) {
    useHead(() => ({
        title: `${options.productTitle.value} | ${options.siteName.value}`,
        link: [{ rel: "canonical", href: options.productUrl.value }],
        meta: [
            { name: "description", content: options.productDescription.value },
            { property: "og:title", content: `${options.productTitle.value} | ${options.siteName.value}` },
            { property: "og:description", content: options.productDescription.value },
            { property: "og:type", content: "product" },
            { property: "og:url", content: options.productUrl.value },
            ...(options.productImages.value[0]?.src ? [{ property: "og:image", content: options.absoluteUrl(options.productImages.value[0].src) }] : [])
        ]
    }))

    const schemaReviews = computed<SchemaNode[]>(() =>
        options.reviews.value.map((review) => ({
            "@type": "Review",
            author: {
                "@type": "Person",
                name: `${review.first_name} ${review.last_name}`.trim()
            },
            datePublished: normalizeSchemaDate(review.created_at),
            reviewBody: review.content,
            name: review.title,
            reviewRating: {
                "@type": "Rating",
                ratingValue: review.rating,
                bestRating: 5,
                worstRating: 1
            }
        }))
    )

    const schemaImages = computed<string[]>(() => options.productImages.value.map((image) => options.absoluteUrl(image.src)))
    const schemaPrice = computed<number | null>(() => options.selectedVariant.value?.calculated_price?.calculated_amount ?? null)
    const schemaCurrency = computed<string>(() => options.selectedVariant.value?.calculated_price?.currency_code?.toUpperCase() || DEFAULT_CURENCY)

    const productSchema = computed<SchemaNode | null>(() => {
        if (!options.product.value) {
            return null
        }

        const schema: SchemaNode = {
            "@type": "Product",
            "@id": `${options.productUrl.value}#product`,
            name: options.productTitle.value,
            description: options.productDescription.value,
            url: options.productUrl.value,
            image: schemaImages.value.length ? schemaImages.value : undefined,
            sku: options.selectedVariant.value?.sku || options.selectedVariant.value?.id,
            category: options.primaryCategory.value?.name || undefined,
            brand: {
                "@type": "Brand",
                name: options.siteName.value
            },
            aggregateRating: options.reviews.value.length
                ? {
                      "@type": "AggregateRating",
                      ratingValue: options.reviewAverage.value,
                      reviewCount: options.reviews.value.length,
                      bestRating: 5,
                      worstRating: 1
                  }
                : options.displayedReviewAverage.value && options.displayedReviewCount.value
                  ? {
                        "@type": "AggregateRating",
                        ratingValue: options.displayedReviewAverage.value,
                        reviewCount: options.displayedReviewCount.value,
                        bestRating: 5,
                        worstRating: 1
                    }
                  : undefined,
            review: schemaReviews.value.length ? schemaReviews.value : undefined
        }

        if (schemaPrice.value != null) {
            schema.offers = {
                "@type": "Offer",
                url: options.productUrl.value,
                priceCurrency: schemaCurrency.value,
                price: schemaPrice.value,
                availability: options.inStock.value ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: {
                    "@id": options.organizationId.value
                }
            }
        }

        return schema
    })

    const breadcrumbSchema = computed<SchemaNode | null>(() => {
        if (!options.product.value) {
            return null
        }

        return createBreadcrumbSchema(
            [
                { name: "Home", path: "/" },
                { name: options.productTitle.value, path: options.productPath.value }
            ],
            options.absoluteUrl
        )
    })

    useStructuredData(() => [productSchema.value, breadcrumbSchema.value], "product-structured-data")
}
