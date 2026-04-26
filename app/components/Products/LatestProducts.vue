<script setup lang="ts">
import { useDragScroll } from "~/composables/useDragScroll"
import { ALL_PRODUCTS_URL_HANDLE } from "~/utils/consts"

const productStore = useProductStore()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const { products } = storeToRefs(useProductStore())
const HOMEPAGE_PRODUCT_LIMIT = 8

await callOnce(async () => {
    await productStore.fetchData(regionStoreId.value ?? "", selectedCountryCode.value ?? "", {
        limit: HOMEPAGE_PRODUCT_LIMIT,
        view: "card"
    })
})

const railRef = ref<HTMLElement | null>(null)

const { onPointerDown, onClickCapture, onDragStart } = useDragScroll(railRef)
</script>

<template>
    <section v-if="products?.length" class="overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 py-16 sm:py-18 lg:py-24">
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div class="max-w-184">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Latest Offers
                    </span>
                    <h2 class="mt-4 max-w-lg text-4xl leading-tight font-bold tracking-tighter text-slate-950 sm:text-5xl lg:text-6xl">
                        Fresh arrivals with a more
                        <span class="text-accent-700 font-medium italic">editorial rhythm</span>
                    </h2>
                    <p class="mt-4 max-w-2xl text-base leading-8 text-slate-700">
                        Browse newly added deals and current promotions in a calmer premium rail that feels easier to scan across mobile and
                        desktop.
                    </p>
                </div>

                <NuxtLink
                    :to="ALL_PRODUCTS_URL_HANDLE"
                    class="shadow-card inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden lg:self-auto"
                >
                    Explore catalog
                </NuxtLink>
            </div>

            <div class="relative mt-9">
                <div
                    class="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-linear-to-r from-slate-50 to-transparent lg:block"
                ></div>
                <div
                    class="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-linear-to-l from-slate-100 to-transparent lg:block"
                ></div>

                <div
                    ref="railRef"
                    class="flex gap-4 overflow-x-auto overflow-y-visible pt-1 pr-6 pb-4 pl-0 sm:gap-5 sm:pr-8"
                    aria-label="Latest products"
                    tabindex="0"
                    @pointerdown="onPointerDown"
                    @click.capture="onClickCapture"
                    @dragstart="onDragStart"
                >
                    <div
                        v-for="product in products"
                        :key="product.id"
                        class="min-w-0 shrink-0 basis-4/5 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5"
                    >
                        <ProductCard :product="product" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
