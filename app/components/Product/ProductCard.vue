<script setup lang="ts">
import debounce from "lodash/debounce"

import type { ProductDTO, ProductVariantDTO } from "@medusajs/types"

import { PRODUCT_URL_HANDLE } from "~/utils/consts"

const FALLBACK_IMAGE = "/images/about_banner.webp"

const { product } = defineProps<{
    product: ProductDTO
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
    <article class="product-card">
        <NuxtLink :to="productHref" class="product-card__media-link">
            <div class="product-card__media">
                <NuxtImg
                    :src="productImage"
                    :alt="product.title || 'Product image'"
                    format="webp"
                    width="720"
                    height="840"
                    sizes="280px md:33vw xl:22vw"
                    densities="x1 x2"
                    class="product-card__image"
                />
                <div class="product-card__glow"></div>
                <VChip v-if="isOnSale" class="product-card__badge" color="error" size="small" label> Sale </VChip>
            </div>
        </NuxtLink>

        <div class="product-card__body">
            <div class="product-card__top">
                <div class="product-card__meta">
                    <span class="product-card__stock">{{ stockLabel }}</span>
                    <div v-if="averageRating" class="product-card__rating" :aria-label="`Rated ${averageRating} out of 5`">
                        <VIcon v-for="i in 5" :key="i" size="16" class="product-card__star">
                            {{ i <= Math.round(averageRating) ? "mdi-star" : "mdi-star-outline" }}
                        </VIcon>
                    </div>
                </div>

                <NuxtLink :to="productHref" class="product-card__title-link">
                    <h3 class="product-card__title">{{ product.title }}</h3>
                </NuxtLink>

                <p class="product-card__description">
                    {{ productDescription }}
                </p>
            </div>

            <div class="product-card__bottom">
                <div class="product-card__price-block">
                    <div class="product-card__price-row">
                        <span class="product-card__price">{{ displayPrice }}</span>
                        <del v-if="isOnSale && originalPrice" class="product-card__original-price">{{ originalPrice }}</del>
                    </div>
                    <span class="product-card__tax-meta">{{ taxLabel }}</span>
                    <span class="product-card__variant">{{ variantLabel }}</span>
                </div>

                <VBtn
                    color="primary"
                    rounded="pill"
                    class="product-card__button text-none"
                    :loading="loading"
                    :disabled="!selectedVariant?.inventory_quantity"
                    @click="debouncedAddToCart"
                >
                    <template #loader>
                        <VProgressCircular indeterminate color="white" size="18" />
                    </template>
                    Add to cart
                </VBtn>
            </div>
        </div>
    </article>
</template>

<style scoped lang="scss">
.product-card {
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100%;
    overflow: hidden;
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.1rem;
    background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
    transition:
        transform 0.28s ease,
        border-color 0.28s ease;
}

.product-card:hover {
    transform: translateY(-4px);
    border-color: rgba(1, 12, 128, 0.16);
}

.product-card__media-link,
.product-card__title-link {
    text-decoration: none;
    color: inherit;
}

.product-card__media {
    position: relative;
    overflow: hidden;
    aspect-ratio: 1;
    background: radial-gradient(circle at top, rgba(0, 128, 255, 0.14), transparent 36%), linear-gradient(180deg, #eef5ff 0%, #dfeafc 100%);
}

.product-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.45s ease;
}

.product-card:hover .product-card__image {
    transform: scale(1.04);
}

.product-card__glow {
    position: absolute;
    inset: auto auto 0 0;
    width: 100%;
    height: 45%;
    background: linear-gradient(180deg, transparent 0%, rgba(8, 23, 63, 0.18) 100%);
    pointer-events: none;
}

.product-card__badge {
    position: absolute;
    top: 0.9rem;
    right: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.03em;
}

.product-card__body {
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 0.85rem;
    padding: 1rem;
}

.product-card__top {
    display: grid;
    gap: 0.75rem;
    min-width: 0;
}

.product-card__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    margin-bottom: 0.1rem;
}

.product-card__stock {
    color: #010c80;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.product-card__rating {
    display: inline-flex;
    align-items: center;
    color: #f7ae2b;
    flex-shrink: 0;
}

.product-card__star {
    margin-right: 0.1rem;
}

.product-card__title {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #08173f;
    font-size: 0.98rem;
    line-height: 1.3;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.product-card__description {
    display: -webkit-box;
    overflow: hidden;
    min-height: 2.55rem;
    margin: 0;
    color: #5a6480;
    font-size: 0.86rem;
    line-height: 1.48;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.product-card__bottom {
    display: grid;
    grid-template-columns: 1fr;
    align-items: stretch;
    gap: 0.75rem;
    min-width: 0;
    padding-top: 0.1rem;
}

.product-card__price-block {
    display: grid;
    gap: 0.3rem;
    min-width: 0;
}

.product-card__price-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.55rem;
}

.product-card__price {
    color: #08173f;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.2;
}

.product-card__original-price {
    color: #cc3344;
    font-size: 0.92rem;
}

.product-card__variant {
    display: block;
    overflow: hidden;
    color: #6a758f;
    font-size: 0.83rem;
    line-height: 1.4;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.product-card__tax-meta {
    color: #5f6d8a;
    font-size: 0.8rem;
    line-height: 1.4;
}

.product-card__button {
    min-width: 0;
    max-width: none;
    min-height: 2.5rem;
    padding-inline: 0.9rem;
    font-weight: 700;
    white-space: nowrap;
}

@media screen and (max-width: 1200px) {
    .product-card__bottom {
        gap: 0.7rem;
    }

    .product-card__meta {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.35rem;
    }
}

@media screen and (max-width: 767px) {
    .product-card__body {
        padding: 0.9rem;
    }

    .product-card__title {
        font-size: 0.95rem;
    }

    .product-card__description {
        min-height: auto;
    }

    .product-card__price-row {
        gap: 0.4rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .product-card,
    .product-card__image {
        transition: none;
    }
}
</style>
