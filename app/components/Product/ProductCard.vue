<script setup lang="ts">
import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"

import BaseButton from "~/components/Shared/BaseButton.vue"
import NuxtImage from "~/components/Shared/NuxtImage.vue"
import { useAddToCart } from "~/composables/cart/useAddToCart"
import { useProductPrice } from "~/composables/product/useProductPrice"
import { useSnackbar } from "~/composables/shared/useSnackbar"
import { PRODUCT_URL_HANDLE } from "~/utils/consts"

const FALLBACK_IMAGE = "/images/about/about-premium.jpg"

const { product, compact = false } = defineProps<{
    product: ProductDTO
    compact?: boolean
}>()

const wishlistStore = useWishlistStore()
const customerStore = useCustomerStore()
const { showSnackbar } = useSnackbar()
const { adding, errorMessage, addToCart: addSelectedVariantToCart } = useAddToCart({
    product: () => product,
    source: "product_card"
})

function isVariantAvailable(variant: ProductVariantDTO | null): boolean {
    if (!variant?.id) {
        return false
    }

    return variant.inventory_quantity > 0
}

const selectedVariant = computed<ProductVariantDTO | null>(() => {
    const variants = product.variants ?? []
    return variants.find((variant) => isVariantAvailable(variant) && variant.calculated_price?.calculated_amount != null) ?? variants[0] ?? null
})

const productHref = computed<string>(() => (product.handle ? `${PRODUCT_URL_HANDLE}/${product.handle}` : "#"))

const productImage = computed<string>(() => product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE)

const productDescription = computed<string>(() => {
    if (product.description?.trim()) {
        return product.description
    }

    return "Product details are currently unavailable."
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

const isSelectedVariantAvailable = computed<boolean>(() => isVariantAvailable(selectedVariant.value))

const hasSelectedVariantPrice = computed<boolean>(() => selectedVariant.value?.calculated_price?.calculated_amount != null)

const canAddSelectedVariantToCart = computed<boolean>(() => isSelectedVariantAvailable.value && hasSelectedVariantPrice.value)

const isWishlistSaved = computed<boolean>(() => wishlistStore.isProductSaved(product.id))

const isWishlistLoading = computed<boolean>(() => wishlistStore.isProductMutating(product.id))

const wishlistLabel = computed<string>(() => (isWishlistSaved.value ? "Remove from wishlist" : "Add to wishlist"))

const stockLabel = computed<string>(() => (canAddSelectedVariantToCart.value ? "Ready to ship" : "Currently unavailable"))

const ratingLabel = computed<string>(() => (averageRating.value ? `Rated ${averageRating.value.toFixed(1)} out of 5` : ""))

const priceLabel = computed<string>(() => {
    if (!displayPrice.value) {
        return "Price unavailable"
    }

    if (isOnSale.value && originalPrice.value) {
        return `Sale price ${displayPrice.value}, original price ${originalPrice.value}`
    }

    return `Price ${displayPrice.value}`
})

async function addToCart(): Promise<void> {
    if (!selectedVariant.value || !canAddSelectedVariantToCart.value || adding.value) {
        return
    }

    await addSelectedVariantToCart(selectedVariant.value)
}

async function toggleWishlist(): Promise<void> {
    if (!product.id || isWishlistLoading.value) {
        return
    }

    if (!customerStore.isAuthenticated) {
        showSnackbar("Sign in to save products to your wishlist.", "info")
        return
    }

    try {
        const result = await wishlistStore.toggleProduct(product)

        if (result === "added") {
            showSnackbar("Added to wishlist", "success")
        } else if (result === "removed") {
            showSnackbar("Removed from wishlist", "success")
        } else if (result === "noop") {
            showSnackbar("Could not update this product. Please try again.", "error")
        }
    } catch (error) {
        console.error("Product card wishlist toggle failed", error)
        showSnackbar("Could not update your wishlist. Please try again.", "error")
    }
}
</script>

<template>
    <article
        class="group rounded-card shadow-card focus-within:shadow-elevated hover:shadow-elevated grid h-full overflow-hidden border border-white/80 bg-linear-to-b from-white to-slate-50 transition duration-300 focus-within:-translate-y-1 focus-within:border-amber-200 hover:-translate-y-1 hover:border-amber-200 motion-reduce:transition-none"
        :class="
            compact
                ? 'rounded-card-sm shadow-card focus-within:shadow-card hover:shadow-card focus-within:translate-y-0 hover:translate-y-0'
                : ''
        "
    >
        <div class="relative aspect-square overflow-hidden bg-linear-to-b from-slate-50 to-slate-200">
            <NuxtLink :to="productHref" class="block h-full text-inherit no-underline focus-visible:outline-hidden">
                <NuxtImage
                    :src="productImage"
                    :alt="product.title || 'Product image'"
                    format="webp"
                    :width="720"
                    :height="720"
                    :sizes="compact ? '50vw sm:33vw lg:25vw' : '280px md:33vw xl:22vw'"
                    loading="lazy"
                    decoding="async"
                    class="h-full w-full object-cover transition duration-500 group-focus-within:scale-105 group-hover:scale-105 motion-reduce:transition-none"
                />
                <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-slate-950/18 to-transparent"></div>
            </NuxtLink>

            <span
                v-if="isOnSale"
                class="text-label-xs tracking-label-tight shadow-card absolute top-3 left-3 inline-flex min-h-8 items-center rounded-full border border-rose-200 bg-white/92 px-3 py-1 font-semibold text-rose-600 uppercase"
                :class="compact ? 'top-2 left-2 px-2 text-xs' : ''"
            >
                Sale
            </span>

            <BaseButton
                type="button"
                class="shadow-card absolute top-3 right-3 inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-white/80 bg-white/92 text-slate-700 transition hover:border-rose-200 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden disabled:cursor-wait disabled:opacity-75"
                :class="[compact ? 'top-2 right-2 min-h-10 min-w-10' : '', isWishlistSaved ? 'border-rose-200 text-rose-600' : '']"
                :aria-label="wishlistLabel"
                :aria-pressed="isWishlistSaved"
                :disabled="isWishlistLoading"
                @click="toggleWishlist"
            >
                <span v-if="isWishlistLoading" class="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-rose-500"></span>
                <svg v-else viewBox="0 0 24 24" class="h-5 w-5" :fill="isWishlistSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                    <path
                        d="M12 20.2S4.5 15.7 4.5 9.4A4.4 4.4 0 0 1 12 6.2a4.4 4.4 0 0 1 7.5 3.2c0 6.3-7.5 10.8-7.5 10.8Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </svg>
            </BaseButton>
        </div>

        <div class="flex flex-1 flex-col gap-4 p-4 sm:p-4" :class="compact ? 'gap-3 p-3' : ''">
            <div class="flex items-start justify-between gap-3">
                <span
                    class="text-label-2xs tracking-label-tight inline-flex min-h-8 items-center rounded-full border px-3 py-1 font-semibold uppercase"
                    :class="[
                        compact ? 'min-h-7 px-2 py-1 text-xs tracking-widest' : '',
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
                    <h3 class="line-clamp-2 text-base leading-6 font-semibold text-slate-950" :class="compact ? 'text-sm leading-5' : ''">
                        {{ product.title }}
                    </h3>
                </NuxtLink>

                <p
                    class="mt-2 line-clamp-2 min-h-13 text-sm leading-7 text-slate-600 md:min-h-0"
                    :class="compact ? 'mt-1.5 text-sm leading-6' : ''"
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
                <span v-if="ratingLabel" class="sr-only">{{ ratingLabel }}</span>
            </div>

            <div class="grid gap-3 border-t border-slate-200/80 pt-3" :class="compact ? 'gap-2 pt-2.5' : ''">
                <div class="grid gap-1">
                    <div class="flex flex-wrap items-center gap-2" :aria-label="priceLabel">
                        <span class="text-lg leading-none font-semibold text-slate-950" :class="compact ? 'text-base' : ''">{{
                            displayPrice
                        }}</span>
                        <del v-if="isOnSale && originalPrice" class="text-sm text-rose-500" :class="compact ? 'text-label-sm' : ''" aria-hidden="true">
                            {{ originalPrice }}
                        </del>
                    </div>
                    <span class="text-label-sm tracking-wider text-slate-500 uppercase" :class="compact ? 'text-xs' : ''">{{
                        taxLabel
                    }}</span>
                    <span class="truncate text-sm text-slate-600" :class="compact ? 'text-label-xs' : ''">{{ variantLabel }}</span>
                </div>

                <BaseButton
                    type="button"
                    variant="accent" class="w-full px-4 disabled:bg-slate-200 disabled:text-slate-500"
                    :class="compact ? 'min-h-9 px-3 text-sm' : ''"
                    :disabled="adding || !canAddSelectedVariantToCart"
                    @click="addToCart"
                >
                    <span
                        v-if="adding"
                        class="mr-2 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-slate-950/35 border-t-slate-950"
                    ></span>
                    {{ canAddSelectedVariantToCart ? "Add to cart" : "Unavailable" }}
                </BaseButton>
                <p v-if="errorMessage" class="text-sm leading-6 text-rose-700" role="alert">{{ errorMessage }}</p>
            </div>
        </div>
    </article>
</template>
