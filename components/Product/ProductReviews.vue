<script setup lang="ts">
import type { Review } from "@/types/interfaces"
defineProps<{
    reviews: Review[]
}>()
</script>

<template>
    <div class="mt-10">
        <h2 class="text-h5 font-weight-medium mb-4 text-center">Customer Reviews</h2>

        <div v-if="reviews.length === 0" class="text-center text-grey">
            <p>No reviews yet. Be the first to write one!</p>
        </div>

        <VRow v-else dense>
            <VCol v-for="review in reviews" :key="review.id" cols="12" md="6">
                <VCard elevation="2" class="pa-4 rounded-xl">
                    <div class="d-flex justify-space-between align-center mb-2">
                        <div class="text-subtitle-1 font-weight-medium">{{ review.first_name }} {{ review.last_name }}</div>
                        <div class="text-caption text-grey">
                            {{ new Date(review.created_at).toLocaleDateString() }}
                        </div>
                    </div>

                    <div class="mb-2">
                        <VRating v-model="review.rating" readonly density="compact" color="amber" size="small" />
                    </div>

                    <div class="font-weight-bold text-body-1 mb-1">{{ review.title }}</div>
                    <div class="text-body-2 text-grey-darken-1">{{ review.content }}</div>
                </VCard>
            </VCol>
        </VRow>
    </div>
</template>
