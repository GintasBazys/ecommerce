<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

import { useDragScroll } from "~/composables/useDragScroll"

defineProps<{
    relatedProducts: ProductDTO[]
}>()

const relatedRailRef = ref<HTMLElement | null>(null)
const { onPointerDown, onClickCapture, onDragStart } = useDragScroll(relatedRailRef)
</script>

<template>
    <section
        v-if="relatedProducts.length"
        class="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:rounded-4xl sm:px-7 sm:py-8 xl:px-8"
    >
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-184">
                <span
                    class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                >
                    Related products
                </span>
                <h2 class="mt-4 max-w-[13ch] text-[clamp(2rem,6vw,3.25rem)] leading-[0.97] font-bold tracking-[-0.05rem] text-slate-950">
                    More from the same
                    <span class="font-medium text-[#8a6a2f] italic">shopping lane</span>
                </h2>
                <p class="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-700">
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

        <div class="mt-9">
            <div
                ref="relatedRailRef"
                class="flex cursor-grab gap-4 overflow-x-auto [overscroll-behavior-x:contain] pt-1 pr-6 pb-4 [scrollbar-color:rgba(120,53,15,0.72)_rgba(241,245,249,0.92)] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] sm:gap-5 sm:pr-8"
                aria-label="Related products"
                tabindex="0"
                @pointerdown="onPointerDown"
                @click.capture="onClickCapture"
                @dragstart="onDragStart"
            >
                <div
                    v-for="relatedProduct in relatedProducts"
                    :key="relatedProduct.id"
                    class="min-w-0 shrink-0 basis-[82%] sm:basis-[47%] lg:basis-[31%] xl:basis-[24%] 2xl:basis-[20%]"
                >
                    <ProductCard :product="relatedProduct" />
                </div>
            </div>
        </div>
    </section>
</template>
