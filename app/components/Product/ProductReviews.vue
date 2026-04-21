<script setup lang="ts">
import type { Review } from "@/types/interfaces"

import { formatDate } from "@/utils/formatDate"

const props = defineProps<{
    reviews: Review[]
    averageRating?: number | null
    reviewCount?: number | null
}>()

type SafeReview = {
    id: string
    rating: number
    title: string
    author: string
    content: string
    createdAt: string
}

const safeReviews = computed<SafeReview[]>(() =>
    (Array.isArray(props.reviews) ? props.reviews : []).map((review, index) => {
        const rating = Number(review?.rating || 0)
        const firstName = typeof review?.first_name === "string" ? review.first_name.trim() : ""
        const lastName = typeof review?.last_name === "string" ? review.last_name.trim() : ""

        return {
            id: typeof review?.id === "string" && review.id ? review.id : `review-${index}`,
            rating: Math.min(Math.max(Number.isFinite(rating) ? rating : 0, 0), 5),
            title: typeof review?.title === "string" && review.title.trim() ? review.title.trim() : "Customer review",
            author: `${firstName} ${lastName}`.trim() || "Verified shopper",
            content: typeof review?.content === "string" && review.content.trim() ? review.content.trim() : "No review details provided.",
            createdAt: typeof review?.created_at === "string" ? review.created_at : ""
        }
    })
)
</script>

<template>
    <div class="mt-5">
        <div
            v-if="safeReviews.length === 0"
            class="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600"
        >
            <template v-if="props.averageRating && props.averageRating > 0">
                Rated {{ props.averageRating.toFixed(1) }} out of 5
                <template v-if="props.reviewCount && props.reviewCount > 0"> across {{ props.reviewCount }} shopper responses </template>
                . Written reviews are not available to show for this product yet.
            </template>
            <template v-else>
                No reviews yet. Be the first to write one.
            </template>
        </div>

        <div v-else class="grid gap-3 md:grid-cols-2">
            <article
                v-for="review in safeReviews"
                :key="review.id"
                class="h-full rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-5"
            >
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div class="text-base font-semibold text-slate-950">{{ review.author }}</div>
                        <div class="mt-1 flex items-center gap-1 text-base text-amber-500" :aria-label="`${review.rating} out of 5 stars`">
                            <span v-for="star in 5" :key="star" aria-hidden="true">{{ star <= review.rating ? "★" : "☆" }}</span>
                        </div>
                    </div>
                    <div class="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                        {{ formatDate(review.createdAt) }}
                    </div>
                </div>

                <h3 class="mt-4 text-base font-semibold text-slate-950">{{ review.title }}</h3>
                <p class="mt-2 text-sm leading-7 text-slate-600 sm:text-[0.95rem]">{{ review.content }}</p>
            </article>
        </div>
    </div>
</template>
