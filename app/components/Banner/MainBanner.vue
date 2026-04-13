<script setup lang="ts">
import EmblaCarousel, { type EmblaCarouselType } from "embla-carousel"
import Autoplay from "embla-carousel-autoplay"

type BannerSlide = {
    eyebrow: string
    title: string
    description: string
    detail: string
    caption: string
    alt: string
    image: string
    imagePosition: string
    ctaTo: string
}

const slides: BannerSlide[] = [
    {
        eyebrow: "New Season Edit",
        title: "A softer way to shop your everyday essentials",
        description:
            "Layer calm color, tactile comfort, and quick-shipping favorites into a home storefront that feels considered from the first click.",
        detail: "Curated drops with a premium editorial feel",
        caption: "Selected for living rooms, bedrooms, and slow Sunday upgrades.",
        alt: "Warm-toned lifestyle banner for an ecommerce home collection",
        image: "/slides/1.jpeg",
        imagePosition: "center center",
        ctaTo: "/special-offers"
    },
    {
        eyebrow: "Online Favorites",
        title: "Build a storefront hero that sells the mood, not just the item",
        description:
            "Combine lifestyle imagery, clean typography, and a direct shopping path to make the first fold feel more like a campaign than a placeholder.",
        detail: "High-impact visuals tuned for conversion-first landing pages",
        caption: "Designed to echo the brand blues already present across the site.",
        alt: "Online shopping lifestyle image for an ecommerce landing banner",
        image: "/images/online_purchase.jpg",
        imagePosition: "center top",
        ctaTo: "/special-offers"
    },
    {
        eyebrow: "Shop The Refresh",
        title: "Turn first visits into intent with a hero that moves immediately",
        description:
            "Animated copy, layered overlays, and a confident call to action help the banner feel active the moment the page loads.",
        detail: "Motion-led headline reveal with a clear shop now action",
        caption: "Built for broad ecommerce storytelling, not a single product niche.",
        alt: "Editorial ecommerce banner image with premium product storytelling",
        image: "/slides/1.jpeg",
        imagePosition: "right center",
        ctaTo: "/special-offers"
    }
]

const bannerViewport = ref<HTMLElement | null>(null)
const bannerApi = ref<EmblaCarouselType | null>(null)
const selectedSlide = ref<number>(0)
const snapPoints = ref<number[]>([])

function syncSelectedSlide(): void {
    if (!bannerApi.value) {
        return
    }

    selectedSlide.value = bannerApi.value.selectedScrollSnap()
}

function goToSlide(index: number): void {
    bannerApi.value?.scrollTo(index)
}

onMounted(() => {
    if (!bannerViewport.value) {
        return
    }

    const embla = EmblaCarousel(
        bannerViewport.value,
        {
            align: "start",
            loop: true
        },
        [
            Autoplay({
                delay: 7000,
                stopOnInteraction: false
            })
        ]
    )

    bannerApi.value = embla
    snapPoints.value = embla.scrollSnapList()
    syncSelectedSlide()

    embla.on("select", syncSelectedSlide)
    embla.on("reInit", () => {
        snapPoints.value = embla.scrollSnapList()
        syncSelectedSlide()
    })
})

onBeforeUnmount(() => {
    bannerApi.value?.destroy()
    bannerApi.value = null
})
</script>

<template>
    <section class="container-fluid banner-section">
        <div class="banner-swiper">
            <div ref="bannerViewport" class="banner-swiper__viewport">
                <div class="banner-swiper__track">
                    <div
                        v-for="(slide, idx) in slides"
                        :key="slide.title"
                        class="banner-swiper__embla-slide"
                        :class="{ 'banner-swiper__embla-slide--active': idx === selectedSlide }"
                    >
                        <article class="banner-swiper__slide">
                            <img
                                class="banner-swiper__image"
                                :src="slide.image"
                                :alt="slide.alt"
                                :style="{ objectPosition: slide.imagePosition }"
                                :loading="idx === 0 ? 'eager' : 'lazy'"
                            />
                            <div class="banner-swiper__veil"></div>
                            <div class="container banner-swiper__inner">
                                <div class="banner-swiper__content">
                                    <span class="banner-swiper__eyebrow">{{ slide.eyebrow }}</span>
                                    <h1 class="banner-swiper__title">
                                        {{ slide.title }}
                                    </h1>
                                    <p class="banner-swiper__description">
                                        {{ slide.description }}
                                    </p>
                                    <div class="banner-swiper__actions">
                                        <NuxtLink :to="slide.ctaTo" class="banner-swiper__cta">
                                            <VBtn color="primary" size="x-large" rounded="pill" class="px-8 text-none font-weight-bold">
                                                Shop now
                                            </VBtn>
                                        </NuxtLink>
                                        <span class="banner-swiper__detail">{{ slide.detail }}</span>
                                    </div>
                                </div>
                                <div class="banner-swiper__card">
                                    <span class="banner-swiper__card-label">Featured direction</span>
                                    <p class="banner-swiper__card-text">{{ slide.caption }}</p>
                                    <div class="banner-swiper__card-accent"></div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </div>

            <div class="banner-swiper__pagination" aria-label="Homepage hero pagination">
                <button
                    v-for="(_, idx) in snapPoints"
                    :key="`banner-dot-${idx}`"
                    type="button"
                    class="banner-swiper__pagination-dot"
                    :class="{ 'banner-swiper__pagination-dot--active': idx === selectedSlide }"
                    :aria-label="`Go to slide ${idx + 1}`"
                    :aria-current="idx === selectedSlide ? 'true' : undefined"
                    @click="goToSlide(idx)"
                ></button>
            </div>
        </div>
    </section>
</template>
