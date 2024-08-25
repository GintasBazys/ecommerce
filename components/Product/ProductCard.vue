<script setup lang="ts">
import { defineProps } from "vue"
defineProps<{
    product: {
        title: string
        thumbnail: string
    }
}>()
</script>

<template>
    <article>
        {{ product.title }}
        <NuxtImg format="webp" :src="product.thumbnail" alt="sd" title="" width="100" height="100" :placeholder="[100, 100, 75, 5]" />
    </article>
</template>
