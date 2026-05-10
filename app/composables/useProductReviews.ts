import type { Review, ReviewApiResponse } from "@/types/interfaces"
import type { ProductDTO } from "@medusajs/types"
import type { ComputedRef } from "vue"

export function useProductReviews(options: {
    product: ComputedRef<ProductDTO | null>
    productMetadata: ComputedRef<Record<string, unknown>>
    posthog?: ReturnType<typeof usePostHog>
    onSubmitted?: () => void
}) {
    const reviewsData = ref<ReviewApiResponse | null>(null)
    const submitError = ref<string | null>(null)
    const reviews = computed<Review[]>(() => reviewsData.value?.reviews || [])

    const reviewAverage = computed<number>(() => {
        if (!reviews.value.length) {
            return 0
        }

        const total = reviews.value.reduce((sum, review) => sum + Number(review.rating || 0), 0)
        return Number((total / reviews.value.length).toFixed(1))
    })

    const metadataAverageRating = computed<number | null>(() => {
        const rating = Number(options.productMetadata.value.averageRating)

        return rating > 0 ? Number(rating.toFixed(1)) : null
    })

    const metadataReviewCount = computed<number | null>(() => {
        const value = Number(options.productMetadata.value.reviewCount || options.productMetadata.value.reviewsCount || options.productMetadata.value.review_count || 0)

        return value > 0 ? value : null
    })

    const displayedReviewAverage = computed<number | null>(() => (reviewAverage.value > 0 ? reviewAverage.value : metadataAverageRating.value))
    const displayedReviewCount = computed<number>(() => reviews.value.length || metadataReviewCount.value || 0)

    async function fetchReviews(productId: string): Promise<void> {
        try {
            reviewsData.value = await $fetch("/api/reviews/list-reviews", {
                query: { product_id: productId, limit: 10, offset: 0 }
            })
        } catch (error) {
            console.error("Review fetch error", error)
            reviewsData.value = { reviews: [] }
        }
    }

    async function submitReview(review: {
        title: string
        content: string
        rating: number
        firstName: string
        lastName: string
        productId: string
    }): Promise<boolean> {
        submitError.value = null

        try {
            await $fetch<ReviewApiResponse>("/api/reviews/add-review", {
                method: "POST",
                body: {
                    title: review.title,
                    content: review.content,
                    rating: review.rating,
                    first_name: review.firstName,
                    last_name: review.lastName,
                    product_id: review.productId
                }
            })

            await fetchReviews(review.productId)
            options.posthog?.capture("product_review_submitted", {
                product_id: review.productId,
                rating: review.rating
            })
            options.onSubmitted?.()
            return true
        } catch (error) {
            console.error("Review submit error", error)
            submitError.value = "Could not submit your review. Please try again."
            return false
        }
    }

    watch(
        () => options.product.value?.id,
        async (id) => {
            if (id) {
                await fetchReviews(id)
            }
        },
        { immediate: true }
    )

    return {
        reviews,
        reviewAverage,
        displayedReviewAverage,
        displayedReviewCount,
        submitReview,
        submitError
    }
}
