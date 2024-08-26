<script setup lang="ts">
import { defineProps } from "vue"
const { product } = defineProps<{
    product: {
        title: string
        thumbnail: string
        variants: {
            title: string
            size: string
            color: string
            inventoryQuantity: number
            price: string
        }[]
    }
}>()

const availableSizes = computed(() => {
    return [...new Set(product.variants.map((variant) => variant))]
})

const selectedSize = ref(availableSizes.value[0].title)

const computedPrice = computed(() => {
    const variant = product.variants.find((v) => v.title === selectedSize.value)
    return variant ? formatCurrency(variant.prices[0].amount, variant.prices[0].currency_code) : "N/A"
})
</script>

<template>
    <article class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm h-full">
        <div class="w-full">
            <a href="#">
                <NuxtImg
                    class="mx-auto h-full"
                    format="webp"
                    :src="product.thumbnail"
                    alt="Product Image"
                    width="250"
                    height="224"
                    :placeholder="[250, 224, 75, 5]"
                />
            </a>
        </div>
        <div class="pt-6">
            <a href="#" class="text-lg font-semibold leading-tight text-gray-900 hover:underline">
                {{ product.title }}
            </a>
            <div class="mt-4">
                <select
                    id="size"
                    v-model="selectedSize"
                    class="block py-2.5 px-0 w-full text-sm text-gray-500 bg-transparent border-0 border-b-2 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                >
                    <option v-for="size in availableSizes" :key="size">{{ size.title }}</option>
                </select>
            </div>

            <div class="mt-4 flex items-center justify-between gap-4">
                <p class="text-2xl font-extrabold leading-tight text-gray-900">
                    {{ computedPrice }}
                </p>

                <button
                    type="button"
                    class="inline-flex items-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300"
                >
                    Add to cart
                </button>
            </div>
        </div>
    </article>
</template>
