<script setup lang="ts">
import debounce from "lodash-es/debounce"

import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"

import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { PRODUCT_URL_HANDLE } from "~/utils/consts"

const FALLBACK_IMAGE = "/images/about/about-premium.jpg"

const { product, compact = false } = defineProps<{
    product: ProductDTO
    compact?: boolean
}>()

const cartStore = useCartStore()
const { openCartDrawer } = storeToRefs(cartStore)

const loading = ref<boolean>(false)

const selectedVariant = computed<ProductVariantDTO | null>(() => product.variants?.[0] ?? null)

const productHref = computed<string>(() => (product.handle ? `${PRODUCT_URL_HANDLE}/${product.handle}` : "#"))

const productImage = computed<string>(() => product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE)

const productDescription = computed<string>(() => {
    if (product.description?.trim()) {
        return product.description
    }

    return "A polished ecommerce pick selected for quality, everyday utility, and easy styling."
})

const { displayPrice, originalPrice, taxLabel } = useProductPrice(selectedVariant)

const isOnSale = computed<boolean>(
    () =>
        selectedVariant.value?.calculated_price?.calculated_price?.price_list_type === "sale" &&
        Boolean(selectedVariant.value?.calculated_price?.original_amount)
)

const averageRating = computed<number | null>(() => {
    const rating = Number(product?.metadata?.averageRating)
    return rating > 0 ? rating : null
})

const roundedRating = computed<number>(() => (averageRating.value ? Math.round(averageRating.value) : 0))

const variantLabel = computed<string>(() => selectedVariant.value?.title || "Selected option")

const stockLabel = computed<string>(() => (selectedVariant.value?.inventory_quantity ? "Ready to ship" : "Currently unavailable"))

async function addToCart(): Promise<void> {
    if (!selectedVariant.value) {
        return
    }

    loading.value = true

    await cartStore.updateLineItem(selectedVariant.value)

    openCartDrawer.value = true
    loading.value = false
}

const debouncedAddToCart = debounce(addToCart, 300)
</script>

<template>
    <article
        class="group grid h-full overflow-hidden rounded-[1.4rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-[0_14px_34px_rgba(8,27,90,0.06)] transition duration-300 focus-within:-translate-y-1 focus-within:border-amber-200 focus-within:shadow-[0_22px_54px_rgba(8,27,90,0.12)] hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_22px_54px_rgba(8,27,90,0.12)] motion-reduce:transition-none"
        :class="
            compact
                ? 'rounded-card-sm shadow-[0_10px_24px_rgba(8,27,90,0.05)] focus-within:translate-y-0 focus-within:shadow-[0_14px_30px_rgba(8,27,90,0.08)] hover:translate-y-0 hover:shadow-[0_14px_30px_rgba(8,27,90,0.08)]'
                : ''
        "
    >
        <NuxtLink :to="productHref" class="block text-inherit no-underline focus-visible:outline-hidden">
            <div
                class="relative aspect-[0.96] overflow-hidden bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.18),transparent_38%),linear-gradient(180deg,#f8fafc_0%,#edf2f7_100%)]"
                :class="compact ? 'aspect-[0.82]' : ''"
            >
                <NuxtImage
                    :src="productImage"
                    :alt="product.title || 'Product image'"
                    format="webp"
                    width="720"
                    height="840"
                    :sizes="compact ? '(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 25vw' : '280px md:33vw xl:22vw'"
                    densities="x1 x2"
                    class="h-full w-full object-cover transition duration-500 group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:transition-none"
                />
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-950/18 to-transparent"></div>

                <span
                    v-if="isOnSale"
                    class="text-label-xs tracking-label-tight absolute top-3 right-3 inline-flex min-h-8 items-center rounded-full border border-rose-200 bg-white/92 px-3 py-1 font-semibold text-rose-600 uppercase shadow-[0_10px_24px_rgba(8,27,90,0.08)]"
                    :class="compact ? 'top-2 right-2 px-2.5 text-[0.64rem]' : ''"
                >
                    Sale
                </span>
            </div>
        </NuxtLink>

        <div class="grid flex-1 grid-rows-[auto_1fr_auto] gap-4 p-4 sm:p-[1.05rem]" :class="compact ? 'gap-3 p-3' : ''">
            <div class="flex items-start justify-between gap-3">
                <span
                    class="text-label-2xs tracking-label-tight inline-flex min-h-8 items-center rounded-full border px-3 py-1 font-semibold uppercase"
                    :class="[
                        compact ? 'min-h-7 px-2 py-1 text-[0.62rem] tracking-widest' : '',
                        selectedVariant?.inventory_quantity
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-300 bg-slate-100 text-slate-700'
                    ]"
                >
                    {{ stockLabel }}
                </span>
            </div>

            <div class="min-w-0">
                <NuxtLink :to="productHref" class="text-inherit no-underline focus-visible:outline-hidden">
                    <h3
                        class="product-card__title text-[1rem] leading-6 font-semibold text-slate-950"
                        :class="compact ? 'text-[0.92rem] leading-5' : ''"
                    >
                        {{ product.title }}
                    </h3>
                </NuxtLink>

                <p
                    class="product-card__description mt-2 text-[0.92rem] leading-7 text-slate-600"
                    :class="compact ? 'mt-1.5 text-[0.82rem] leading-6' : ''"
                >
                    {{ productDescription }}
                </p>

                <div
                    v-if="averageRating"
                    class="flex shrink-0 items-center gap-1 text-amber-500"
                    :class="compact ? 'mt-1' : ''"
                    aria-hidden="true"
                >
                    <svg
                        v-for="i in 5"
                        :key="i"
                        viewBox="0 0 20 20"
                        class="h-4 w-4"
                        :class="[compact ? 'h-3.5 w-3.5' : '', i <= roundedRating ? 'fill-current' : 'fill-none stroke-current opacity-45']"
                    >
                        <path
                            d="M10 2.5l2.32 4.7 5.18.76-3.75 3.65.88 5.16L10 14.34l-4.63 2.43.88-5.16L2.5 7.96l5.18-.76L10 2.5Z"
                            stroke-width="1.4"
                            stroke-linejoin="round"
                        />
                    </svg>
                </div>
            </div>

            <div class="grid gap-3 border-t border-slate-200/80 pt-3" :class="compact ? 'gap-2 pt-2.5' : ''">
                <div class="grid gap-1">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-[1.05rem] leading-none font-semibold text-slate-950" :class="compact ? 'text-[0.95rem]' : ''">{{
                            displayPrice
                        }}</span>
                        <del v-if="isOnSale && originalPrice" class="text-[0.9rem] text-rose-500" :class="compact ? 'text-label-sm' : ''">
                            {{ originalPrice }}
                        </del>
                    </div>
                    <span class="text-label-sm tracking-[0.08em] text-slate-500 uppercase" :class="compact ? 'text-[0.68rem]' : ''">{{
                        taxLabel
                    }}</span>
                    <span class="truncate text-[0.82rem] text-slate-600" :class="compact ? 'text-label-xs' : ''">{{ variantLabel }}</span>
                </div>

                <button
                    type="button"
                    class="ui-btn-accent w-full px-4 disabled:bg-slate-200 disabled:text-slate-500"
                    :class="compact ? 'min-h-9 px-3 text-[0.82rem]' : ''"
                    :disabled="loading || !selectedVariant?.inventory_quantity"
                    @click="debouncedAddToCart"
                >
                    <span
                        v-if="loading"
                        class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-950/35 border-t-slate-950"
                    ></span>
                    {{ selectedVariant?.inventory_quantity ? "Add to cart" : "Unavailable" }}
                </button>
            </div>
        </div>
    </article>
</template>

<style scoped>
.product-card__title,
.product-card__description {
    display: -webkit-box;
    overflow: hidden;
    -webkit-box-orient: vertical;
}

.product-card__title {
    -webkit-line-clamp: 2;
}

.product-card__description {
    min-height: 3.2rem;
    -webkit-line-clamp: 2;
}

@media screen and (max-width: 767px) {
    .product-card__description {
        min-height: auto;
    }
}
</style>
