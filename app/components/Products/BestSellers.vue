<script setup lang="ts">
import { useDragScroll } from "~/composables/useDragScroll"
import { ALL_PRODUCTS_URL_HANDLE } from "~/utils/consts"

const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const productStore = useProductStore()
const { bestSellers } = storeToRefs(productStore)

await callOnce(async () => {
    await productStore.fetchBestSellers(regionStoreId.value ?? "", selectedCountryCode.value ?? "")
})

const railRef = ref<HTMLElement | null>(null)

const { onPointerDown, onClickCapture, onDragStart } = useDragScroll(railRef)
</script>

<template>
    <section
        v-if="bestSellers?.length"
        class="overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(202,138,4,0.12),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_24%),linear-gradient(180deg,#f7f8fb_0%,#ffffff_100%)] py-16 sm:py-18 lg:py-24"
    >
        <div class="mx-auto w-full max-w-7xl px-4 sm:px-6">
            <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div class="max-w-184">
                    <span
                        class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
                    >
                        Bestsellers
                    </span>
                    <h2
                        class="mt-4 max-w-[13ch] text-[clamp(2rem,6vw,3.75rem)] leading-[0.97] font-bold tracking-[-0.05rem] text-slate-950"
                    >
                        Customer favorites with a more
                        <span class="font-medium text-[#8a6a2f] italic">premium cadence</span>
                    </h2>
                    <p class="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-700">
                        These are the products shoppers return to most often, surfaced in a quieter premium layout with clearer pricing and
                        stronger product focus.
                    </p>
                </div>

                <NuxtLink
                    :to="ALL_PRODUCTS_URL_HANDLE"
                    class="inline-flex min-h-11 items-center justify-center self-start rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 shadow-[0_10px_24px_rgba(8,27,90,0.05)] transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden lg:self-auto"
                >
                    Shop popular picks
                </NuxtLink>
            </div>

            <div class="relative mt-9">
                <div
                    class="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-linear-to-r from-[#fbfbfc] to-transparent lg:block"
                ></div>
                <div
                    class="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-linear-to-l from-[#ffffff] to-transparent lg:block"
                ></div>

                <div
                    ref="railRef"
                    class="catalog-rail flex gap-4 overflow-x-auto pt-1 pr-6 pb-4 pl-0 sm:gap-5 sm:pr-8"
                    aria-label="Bestselling products"
                    tabindex="0"
                    @pointerdown="onPointerDown"
                    @click.capture="onClickCapture"
                    @dragstart="onDragStart"
                >
                    <div
                        v-for="product in bestSellers"
                        :key="product.id"
                        class="rail-item shrink-0 basis-[82%] sm:basis-[47%] lg:basis-[31%] xl:basis-[24%] 2xl:basis-[20%]"
                    >
                        <ProductCard :product="product" />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.catalog-rail {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    scrollbar-gutter: stable both-edges;
    scrollbar-width: thin;
    scrollbar-color: rgba(120, 53, 15, 0.72) rgba(241, 245, 249, 0.92);
    cursor: grab;
    user-select: none;
    scroll-behavior: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: none;
}

.rail-item {
    min-width: 0;
    scroll-snap-align: none;
    scroll-snap-stop: normal;
}

@media (hover: none) and (pointer: coarse) {
    .catalog-rail {
        cursor: auto;
        overscroll-behavior-x: auto;
        user-select: auto;
    }
}

.catalog-rail :deep(img) {
    -webkit-user-drag: none;
    user-select: none;
}
</style>
