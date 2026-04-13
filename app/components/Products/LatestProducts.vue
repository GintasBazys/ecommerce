<script setup lang="ts">
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel"

const productStore = useProductStore()
const { regionStoreId, selectedCountryCode } = storeToRefs(useRegionStore())
const { products } = storeToRefs(useProductStore())
const sliderViewport = ref<HTMLElement | null>(null)
const sliderApi = ref<EmblaCarouselType | null>(null)

await callOnce(async () => {
    await productStore.fetchData(regionStoreId.value ?? "", selectedCountryCode.value ?? "")
})

onMounted(() => {
    if (!sliderViewport.value) {
        return
    }

    sliderApi.value = EmblaCarousel(sliderViewport.value, {
        align: "start",
        containScroll: "trimSnaps",
        dragFree: true
    })
})

onBeforeUnmount(() => {
    sliderApi.value?.destroy()
    sliderApi.value = null
})
</script>

<template>
    <section class="catalog-section catalog-section--latest">
        <VContainer class="catalog-section__container">
            <div class="catalog-section__intro">
                <div class="catalog-section__copy">
                    <span class="catalog-section__eyebrow">Latest Offers</span>
                    <h2 class="catalog-section__title">Fresh arrivals with a sharper, more editorial storefront feel.</h2>
                    <p class="catalog-section__description">
                        Browse newly added deals and current promotions in a layout designed to feel lighter, cleaner, and easier to scan.
                    </p>
                </div>
            </div>

            <div class="catalog-section__slider">
                <div ref="sliderViewport" class="catalog-section__viewport">
                    <div class="catalog-section__track">
                        <div v-for="product in products" :key="product.id" class="catalog-section__slide">
                            <ProductCard :product="product" />
                        </div>
                    </div>
                </div>
            </div>
        </VContainer>
    </section>
</template>

<style scoped lang="scss">
.catalog-section {
    position: relative;
    overflow: hidden;
    padding: clamp(4.5rem, 7vw, 6.5rem) 0;
}

.catalog-section--latest {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 26%), linear-gradient(180deg, #ffffff 0%, #f7faff 100%);
}

.catalog-section__container {
    position: relative;
    z-index: 1;
}

.catalog-section__intro {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 2rem;
}

.catalog-section__copy,
.catalog-section__slide {
    animation: catalog-rise 0.75s ease both;
}

.catalog-section__slide {
    height: auto;
    padding-bottom: 0.35rem;
}

.catalog-section__slide:nth-child(2) {
    animation-delay: 0.08s;
}

.catalog-section__slide:nth-child(3) {
    animation-delay: 0.14s;
}

.catalog-section__slide:nth-child(4) {
    animation-delay: 0.2s;
}

.catalog-section__eyebrow {
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

.catalog-section__title {
    max-width: 20ch;
    margin-bottom: 0.9rem;
    margin-inline: auto;
    color: #08173f;
    font-size: clamp(2.1rem, 3.8vw, 3.75rem);
    line-height: 0.98;
    letter-spacing: -0.05rem;
    text-wrap: balance;
}

.catalog-section__description {
    max-width: 800px;
    margin-bottom: 0;
    margin-inline: auto;
    color: #53607b;
    font-size: 1.02rem;
    line-height: 1.75;
}

.catalog-section__copy {
    width: 100%;
    max-width: 800px;
    margin-inline: auto;
    text-align: center;
}

.catalog-section__slider {
    --catalog-slide-gap: 16px;
    --catalog-slide-size: 86%;
}

.catalog-section__viewport {
    overflow: hidden;
}

.catalog-section__track {
    display: flex;
    gap: var(--catalog-slide-gap);
}

.catalog-section__slide {
    flex: 0 0 var(--catalog-slide-size);
}

@media screen and (min-width: 640px) {
    .catalog-section__slider {
        --catalog-slide-gap: 18px;
        --catalog-slide-size: 47%;
    }
}

@media screen and (min-width: 960px) {
    .catalog-section__slider {
        --catalog-slide-gap: 20px;
        --catalog-slide-size: 31%;
    }
}

@media screen and (min-width: 1280px) {
    .catalog-section__slider {
        --catalog-slide-gap: 22px;
        --catalog-slide-size: 24%;
    }
}

@media screen and (min-width: 1536px) {
    .catalog-section__slider {
        --catalog-slide-gap: 24px;
        --catalog-slide-size: 20%;
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
    .catalog-section__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 767px) {
    .catalog-section {
        padding: 3.75rem 0;
    }

    .catalog-section__title {
        font-size: clamp(1.9rem, 7vw, 2.75rem);
    }
}

@media (prefers-reduced-motion: reduce) {
    .catalog-section__copy,
    .catalog-section__slide {
        animation: none;
    }
}
</style>
