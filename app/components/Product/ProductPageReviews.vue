<script setup lang="ts">
import type { Review } from "@/types/interfaces"

defineProps<{
    customer: unknown
    reviews: Review[]
    averageRating: number | null
    reviewCount: number
}>()

const emit = defineEmits<{
    (_e: "open-review"): void
}>()
</script>

<template>
    <div class="mt-8 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-4xl sm:p-7 xl:p-8">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                    Customer feedback
                </span>
                <h2 class="mt-4 text-[1.9rem] font-bold leading-[1.02] tracking-[-0.05rem] text-slate-950 sm:text-[2.3rem]">
                    What shoppers are saying.
                </h2>
                <p class="mt-3 max-w-xl text-[0.98rem] leading-7 text-slate-600 sm:text-base sm:leading-8">
                    Read recent feedback from verified shoppers before making a decision.
                </p>
            </div>
            <button
                v-if="customer"
                type="button"
                class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                @click="emit('open-review')"
            >
                Write a review
            </button>
        </div>

        <ProductReviews :reviews="reviews" :average-rating="averageRating" :review-count="reviewCount" />
    </div>
</template>
