<script setup lang="ts">
const productStore = useProductStore()
const { regionStoreId } = storeToRefs(useRegionStore())
const { products } = storeToRefs(useProductStore())

await callOnce(async () => {
    await productStore.fetchData(regionStoreId.value ?? "")
})
</script>

<template>
    <section class="catalogSection catalogSection--latest">
        <VContainer class="catalogSection__container">
            <div class="catalogSection__intro">
                <div class="catalogSection__copy">
                    <span class="catalogSection__eyebrow">Latest Offers</span>
                    <h2 class="catalogSection__title">Fresh arrivals with a sharper, more editorial storefront feel.</h2>
                    <p class="catalogSection__description">
                        Browse newly added deals and current promotions in a layout designed to feel lighter, cleaner, and easier to scan.
                    </p>
                </div>
            </div>

            <ClientOnly>
                <swiper-container
                    class="catalogSection__slider"
                    :breakpoints="{
                        280: { slidesPerView: 1.15, spaceBetween: 16 },
                        640: { slidesPerView: 2.1, spaceBetween: 18 },
                        960: { slidesPerView: 3.1, spaceBetween: 20 },
                        1280: { slidesPerView: 4.1, spaceBetween: 22 },
                        1536: { slidesPerView: 5, spaceBetween: 24 }
                    }"
                    :grab-cursor="true"
                >
                    <swiper-slide v-for="product in products" :key="product.id" class="catalogSection__slide">
                        <ProductCard :product="product" />
                    </swiper-slide>
                </swiper-container>
            </ClientOnly>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.catalogSection {
    position: relative;
    overflow: hidden;
    padding: clamp(4.5rem, 7vw, 6.5rem) 0;

    &--latest {
        background:
            radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 26%),
            linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
    }

    &__container {
        position: relative;
        z-index: 1;
    }

    &__intro {
        display: flex;
        justify-content: center;
        width: 100%;
        margin-bottom: 2rem;
    }

    &__copy,
    &__slide {
        animation: catalog-rise 0.75s ease both;
    }

    &__slide {
        height: auto;
        padding-bottom: 0.35rem;

        &:nth-child(2) {
            animation-delay: 0.08s;
        }

        &:nth-child(3) {
            animation-delay: 0.14s;
        }

        &:nth-child(4) {
            animation-delay: 0.2s;
        }
    }

    &__eyebrow {
        display: inline-flex;
        align-items: center;
        min-height: 2.3rem;
        padding: 0.45rem 0.9rem;
        margin-bottom: 1rem;
        border-radius: 999px;
        background: rgba(1, 12, 128, 0.07);
        color: #010c80;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
    }

    &__title {
        max-width: 20ch;
        margin-bottom: 0.9rem;
        margin-inline: auto;
        color: #08173f;
        font-size: clamp(2.1rem, 3.8vw, 3.75rem);
        line-height: 0.98;
        letter-spacing: -0.05rem;
        text-wrap: balance;
    }

    &__description {
        max-width: 800px;
        margin-bottom: 0;
        margin-inline: auto;
        color: #53607b;
        font-size: 1.02rem;
        line-height: 1.75;
    }

    &__copy {
        width: 100%;
        max-width: 800px;
        margin-inline: auto;
        text-align: center;
    }

    &__slider {
        display: block;
        overflow: visible;
    }
}

@keyframes catalog-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 960px) {
    .catalogSection {
        &__title {
            max-width: 100%;
        }
    }
}

@media screen and (max-width: 767px) {
    .catalogSection {
        padding: 3.75rem 0;

        &__title {
            font-size: clamp(1.9rem, 7vw, 2.75rem);
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .catalogSection {
        &__copy,
        &__slide {
            animation: none;
        }
    }
}
</style>
