<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

import BaseButton from "~/components/Shared/BaseButton.vue"
import { useDragScroll } from "~/composables/useDragScroll"

defineProps<{
    relatedProducts: ProductDTO[]
    pending?: boolean
    error?: boolean
}>()

const emit = defineEmits<{
    retry: []
}>()

const relatedRailRef = ref<HTMLElement | null>(null)
const { onPointerDown, onClickCapture, onDragStart } = useDragScroll(relatedRailRef)
</script>

<template>
    <section
        class="mt-8 overflow-hidden rounded-panel border border-slate-200 bg-white px-5 py-6 shadow-sm sm:rounded-4xl sm:px-7 sm:py-8 xl:px-8"
    >
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-184">
                <span
                    class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                >
                    Related products
                </span>
                <h2 class="mt-4 max-w-md text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl">
                    More from the same
                    <span class="text-accent-700 font-medium italic">shopping lane</span>
                </h2>
                <p class="mt-4 max-w-2xl text-base leading-8 text-slate-700">
                    Picked from the same category so the next suggestion still feels aligned with what you are viewing now.
                </p>
            </div>

            <NuxtLink
                to="/special-offers"
                class="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden lg:self-auto"
            >
                Explore more picks
            </NuxtLink>
        </div>

        <div v-if="pending" class="mt-9" aria-live="polite">
            <div class="flex gap-4 overflow-x-hidden pt-1 pr-6 pb-4 sm:gap-5 sm:pr-8">
                <div v-for="n in 5" :key="n" class="min-w-0 shrink-0 basis-10/12 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                    <div class="rounded-card h-full border border-slate-200 bg-linear-to-b from-slate-50 to-white p-3 shadow-card">
                        <div class="aspect-square animate-pulse rounded-2xl bg-slate-200"></div>
                        <div class="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200"></div>
                        <div class="mt-3 h-3 w-full animate-pulse rounded bg-slate-200"></div>
                        <div class="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-200"></div>
                        <div class="mt-5 h-11 w-full animate-pulse rounded-full bg-slate-200"></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="error" class="mt-9 rounded-card-sm border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700" role="alert">
            <p>Related products could not be loaded.</p>
            <BaseButton type="button" variant="accent" class="mt-3 px-5" @click="emit('retry')">Try again</BaseButton>
        </div>

        <div v-else-if="!relatedProducts.length" class="mt-9 rounded-card-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            No related products are available right now.
        </div>

        <div v-else class="mt-9">
            <div
                ref="relatedRailRef"
                class="flex cursor-grab gap-4 overflow-x-auto overscroll-x-contain pt-1 pr-6 pb-4 sm:gap-5 sm:pr-8 [&.is-pointer-down]:cursor-grabbing"
                aria-label="Related products"
                tabindex="0"
                @pointerdown="onPointerDown"
                @click.capture="onClickCapture"
                @dragstart="onDragStart"
            >
                <div
                    v-for="relatedProduct in relatedProducts"
                    :key="relatedProduct.id"
                    class="min-w-0 shrink-0 basis-10/12 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
                >
                    <ProductCard :product="relatedProduct" />
                </div>
            </div>
        </div>
    </section>
</template>
