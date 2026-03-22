<script setup lang="ts">
import type { Review } from "@/types/interfaces"

defineProps<{
    reviews: Review[]
}>()
</script>

<template>
    <div class="productReviews">
        <div v-if="reviews.length === 0" class="productReviews__empty">
            <p>No reviews yet. Be the first to write one!</p>
        </div>

        <VRow v-else dense class="productReviews__grid">
            <VCol v-for="review in reviews" :key="review.id" cols="12" md="6">
                <article class="productReviews__card">
                    <div class="productReviews__top">
                        <div class="productReviews__author">{{ review.first_name }} {{ review.last_name }}</div>
                        <div class="productReviews__date">
                            {{ new Date(review.created_at).toLocaleDateString() }}
                        </div>
                    </div>

                    <VRating
                        :model-value="review.rating"
                        readonly
                        density="compact"
                        color="amber"
                        size="small"
                        class="productReviews__rating"
                    />

                    <div class="productReviews__title">{{ review.title }}</div>
                    <div class="productReviews__content">{{ review.content }}</div>
                </article>
            </VCol>
        </VRow>
    </div>
</template>

<style scoped lang="scss">
.productReviews {
    margin-top: 1.25rem;
}

.productReviews__empty {
    padding: 1.1rem 0 0;
    color: #6a7590;
}

.productReviews__card {
    height: 100%;
    padding: 1.2rem;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.2rem;
    background: rgba(247, 250, 255, 0.92);
}

.productReviews__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-bottom: 0.45rem;
}

.productReviews__author,
.productReviews__title {
    color: #08173f;
}

.productReviews__author {
    font-weight: 700;
}

.productReviews__date,
.productReviews__content {
    color: #5a6480;
}

.productReviews__date {
    font-size: 0.82rem;
}

.productReviews__rating {
    margin-bottom: 0.45rem;
}

.productReviews__title {
    margin-bottom: 0.35rem;
    font-weight: 700;
}

.productReviews__content {
    line-height: 1.65;
}

@media screen and (max-width: 700px) {
    .productReviews__card {
        border-radius: 1rem;
    }

    .productReviews__top {
        flex-direction: column;
    }
}
</style>
