<script setup lang="ts">
import type { ProductDTO } from "@medusajs/types"

import ProductCard from "~/components/Product/ProductCard.vue"
import BaseButton from "~/components/Shared/BaseButton.vue"
import { useDragScroll } from "~/composables/shared/useDragScroll"

const props = withDefaults(defineProps<{
    products: ProductDTO[]
    eyebrow: string
    title: string
    highlightedTitle: string
    description: string
    railLabel: string
    pending?: boolean
    error?: boolean
    errorMessage: string
    emptyMessage?: string
    ctaTo?: string
    ctaLabel?: string
}>(), {
    pending: false,
    error: false,
    emptyMessage: "",
    ctaTo: "",
    ctaLabel: ""
})

const emit = defineEmits<{
    retry: []
}>()

const railRef = useTemplateRef<HTMLElement>("railRef")
const { onPointerDown, onClickCapture, onDragStart } = useDragScroll(railRef)
</script>

<template>
    <section class="mt-8 overflow-hidden rounded-panel border border-slate-200 bg-white px-5 py-6 shadow-sm sm:rounded-4xl sm:px-7 sm:py-8 xl:px-8">
        <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div class="max-w-184">
                <span class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase">
                    {{ props.eyebrow }}
                </span>
                <h2 class="mt-4 max-w-md text-3xl leading-none font-bold tracking-tighter text-slate-950 sm:text-5xl">
                    {{ props.title }}
                    <span class="text-accent-700 font-medium italic">{{ props.highlightedTitle }}</span>
                </h2>
                <p class="mt-4 max-w-2xl text-base leading-8 text-slate-700">
                    {{ props.description }}
                </p>
            </div>

            <NuxtLink
                v-if="props.ctaTo && props.ctaLabel"
                :to="props.ctaTo"
                class="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden lg:self-auto"
            >
                {{ props.ctaLabel }}
            </NuxtLink>
        </div>

        <div v-if="props.pending" class="mt-9" aria-live="polite">
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

        <div v-else-if="props.error" class="mt-9 rounded-card-sm border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700" role="alert">
            <p>{{ props.errorMessage }}</p>
            <BaseButton type="button" variant="accent" class="mt-3 px-5" @click="emit('retry')">Try again</BaseButton>
        </div>

        <div v-else-if="props.emptyMessage && !props.products.length" class="mt-9 rounded-card-sm border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {{ props.emptyMessage }}
        </div>

        <div v-else-if="props.products.length" class="mt-9">
            <div
                ref="railRef"
                class="flex cursor-grab gap-4 overflow-x-auto overscroll-x-contain pt-1 pr-6 pb-4 sm:gap-5 sm:pr-8 [&.is-pointer-down]:cursor-grabbing"
                :aria-label="props.railLabel"
                tabindex="0"
                @pointerdown="onPointerDown"
                @click.capture="onClickCapture"
                @dragstart="onDragStart"
            >
                <div v-for="product in props.products" :key="product.id" class="min-w-0 shrink-0 basis-10/12 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5">
                    <ProductCard :product="product" />
                </div>
            </div>
        </div>
    </section>
</template>
