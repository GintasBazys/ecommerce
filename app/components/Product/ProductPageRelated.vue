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
    <section v-if="relatedProducts.length" class="mt-8 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:rounded-4xl sm:px-7 sm:py-8 xl:px-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-184">
                <span class="inline-flex min-h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-amber-900">
                    Related products
                </span>
                <h2 class="mt-4 max-w-[13ch] text-[clamp(2rem,6vw,3.25rem)] font-bold leading-[0.97] tracking-[-0.05rem] text-slate-950">
                    More from the same
                    <span class="font-medium italic text-[#8a6a2f]">shopping lane</span>
                </h2>
                <p class="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-700">
                    Picked from the same category so the next suggestion still feels aligned with what you are viewing now.
                </p>
            </div>

            <NuxtLink
                to="/special-offers"
                class="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 lg:self-auto"
            >
                Explore more picks
            </NuxtLink>
        </div>

        <div class="mt-9">
            <div
                ref="relatedRailRef"
                class="flex gap-4 overflow-x-auto pb-4 pr-6 pt-1 [overscroll-behavior-x:contain] [scrollbar-color:rgba(120,53,15,0.72)_rgba(241,245,249,0.92)] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] cursor-grab sm:gap-5 sm:pr-8"
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
