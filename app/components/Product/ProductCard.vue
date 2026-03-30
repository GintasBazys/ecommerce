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
    <article class="productCard">
        <NuxtLink :to="productHref" class="productCard__mediaLink">
            <div class="productCard__media">
                <NuxtImg
                    :src="productImage"
                    :alt="product.title || 'Product image'"
                    format="webp"
                    width="720"
                    height="840"
                    sizes="280px md:33vw xl:22vw"
                    densities="x1 x2"
                    class="productCard__image"
                />
                <div class="productCard__glow"></div>
                <VChip v-if="isOnSale" class="productCard__badge" color="error" size="small" label> Sale </VChip>
            </div>
        </NuxtLink>

        <div class="productCard__body">
            <div class="productCard__top">
                <div class="productCard__meta">
                    <span class="productCard__stock">{{ stockLabel }}</span>
                    <div v-if="averageRating" class="productCard__rating" :aria-label="`Rated ${averageRating} out of 5`">
                        <VIcon v-for="i in 5" :key="i" size="16" class="productCard__star">
                            {{ i <= Math.round(averageRating) ? "mdi-star" : "mdi-star-outline" }}
                        </VIcon>
                    </div>
                </div>

                <NuxtLink :to="productHref" class="productCard__titleLink">
                    <h3 class="productCard__title">{{ product.title }}</h3>
                </NuxtLink>

                <p class="productCard__description">
                    {{ productDescription }}
                </p>
            </div>

            <div class="productCard__bottom">
                <div class="productCard__priceBlock">
                    <div class="productCard__priceRow">
                        <span class="productCard__price">{{ displayPrice }}</span>
                        <del v-if="isOnSale && originalPrice" class="productCard__originalPrice">{{ originalPrice }}</del>
                    </div>
                    <span class="productCard__taxMeta">{{ taxLabel }}</span>
                    <span class="productCard__variant">{{ variantLabel }}</span>
                </div>

                <VBtn
                    color="primary"
                    rounded="pill"
                    class="productCard__button text-none"
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
.productCard {
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

    &:hover {
        transform: translateY(-4px);
        border-color: rgba(1, 12, 128, 0.16);
    }

    &__mediaLink,
    &__titleLink {
        text-decoration: none;
        color: inherit;
    }

    &__media {
        position: relative;
        overflow: hidden;
        aspect-ratio: 1;
        background:
            radial-gradient(circle at top, rgba(0, 128, 255, 0.14), transparent 36%), linear-gradient(180deg, #eef5ff 0%, #dfeafc 100%);
    }

    &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.45s ease;
    }

    &:hover &__image {
        transform: scale(1.04);
    }

    &__glow {
        position: absolute;
        inset: auto auto 0 0;
        width: 100%;
        height: 45%;
        background: linear-gradient(180deg, transparent 0%, rgba(8, 23, 63, 0.18) 100%);
        pointer-events: none;
    }

    &__badge {
        position: absolute;
        top: 0.9rem;
        right: 0.9rem;
        font-weight: 700;
        letter-spacing: 0.03em;
    }

    &__body {
        display: grid;
        grid-template-rows: 1fr auto;
        gap: 0.85rem;
        padding: 1rem;
    }

    &__top {
        display: grid;
        gap: 0.75rem;
        min-width: 0;
    }

    &__meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
        min-width: 0;
        margin-bottom: 0.1rem;
    }

    &__stock {
        color: #010c80;
        font-size: 0.74rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
    }

    &__rating {
        display: inline-flex;
        align-items: center;
        color: #f7ae2b;
        flex-shrink: 0;
    }

    &__star {
        margin-right: 0.1rem;
    }

    &__title {
        display: -webkit-box;
        overflow: hidden;
        margin: 0;
        color: #08173f;
        font-size: 0.98rem;
        line-height: 1.3;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
    }

    &__description {
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

    &__bottom {
        display: grid;
        grid-template-columns: 1fr;
        align-items: stretch;
        gap: 0.75rem;
        min-width: 0;
        padding-top: 0.1rem;
    }

    &__priceBlock {
        display: grid;
        gap: 0.3rem;
        min-width: 0;
    }

    &__priceRow {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.55rem;
    }

    &__price {
        color: #08173f;
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.2;
    }

    &__originalPrice {
        color: #cc3344;
        font-size: 0.92rem;
    }

    &__variant {
        display: block;
        overflow: hidden;
        color: #6a758f;
        font-size: 0.83rem;
        line-height: 1.4;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__taxMeta {
        color: #5f6d8a;
        font-size: 0.8rem;
        line-height: 1.4;
    }

    &__button {
        min-width: 0;
        max-width: none;
        min-height: 2.5rem;
        padding-inline: 0.9rem;
        font-weight: 700;
        white-space: nowrap;
    }
}

@media screen and (max-width: 1200px) {
    .productCard {
        &__bottom {
            gap: 0.7rem;
        }

        &__meta {
            align-items: flex-start;
            flex-direction: column;
            gap: 0.35rem;
        }
    }
}

@media screen and (max-width: 767px) {
    .productCard {
        &__body {
            padding: 0.9rem;
        }

        &__title {
            font-size: 0.95rem;
        }

        &__description {
            min-height: auto;
        }

        &__priceRow {
            gap: 0.4rem;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .productCard,
    .productCard__image {
        transition: none;
    }
}
</style>
