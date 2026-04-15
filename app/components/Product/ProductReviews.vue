<script setup lang="ts">
import type { Review } from "@/types/interfaces"

import { formatDate } from "@/utils/formatDate"

defineProps<{
    reviews: Review[]
}>()
</script>

<template>
    <div class="product-reviews">
        <div v-if="reviews.length === 0" class="product-reviews__empty">
            <p>No reviews yet. Be the first to write one!</p>
        </div>

        <VRow v-else dense class="product-reviews__grid">
            <VCol v-for="review in reviews" :key="review.id" cols="12" md="6">
                <article class="product-reviews__card">
                    <div class="product-reviews__top">
                        <div class="product-reviews__author">{{ review.first_name }} {{ review.last_name }}</div>
                        <div class="product-reviews__date">
                            {{ formatDate(review.created_at) }}
                        </div>
                    </div>

                    <VRating
                        :model-value="review.rating"
                        readonly
                        density="compact"
                        color="amber"
                        size="small"
                        class="product-reviews__rating"
                    />

                    <div class="product-reviews__title">{{ review.title }}</div>
                    <div class="product-reviews__content">{{ review.content }}</div>
                </article>
            </VCol>
        </VRow>
    </div>
</template>

<style scoped lang="scss">
.product-reviews {
    margin-top: 1.25rem;
}

.product-reviews__empty {
    padding: 1.1rem 0 0;
    color: #6a7590;
}

.product-reviews__card {
    height: 100%;
    padding: 1.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: rgba(247, 250, 255, 0.92);
}

.product-reviews__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.45rem;
}

.product-reviews__author,
.product-reviews__title {
    color: #08173f;
}

.product-reviews__author {
    font-weight: 700;
}

.product-reviews__date,
.product-reviews__content {
    color: #5a6480;
}

.product-reviews__date {
    font-size: 0.82rem;
}

.product-reviews__rating {
    margin-bottom: 0.45rem;
}

.product-reviews__title {
    margin-bottom: 0.35rem;
    font-weight: 700;
}

.product-reviews__content {
    line-height: 1.65;
}

@media screen and (max-width: 700px) {
    .product-reviews__card {
        border-radius: 1rem;
    }

    .product-reviews__top {
        flex-direction: column;
    }
}
</style>
