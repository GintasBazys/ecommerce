<script setup lang="ts">
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
        description: "Layer calm color, tactile comfort, and quick-shipping favorites into a home storefront that feels considered from the first click.",
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
        description: "Combine lifestyle imagery, clean typography, and a direct shopping path to make the first fold feel more like a campaign than a placeholder.",
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
        description: "Animated copy, layered overlays, and a confident call to action help the banner feel active the moment the page loads.",
        detail: "Motion-led headline reveal with a clear shop now action",
        caption: "Built for broad ecommerce storytelling, not a single product niche.",
        alt: "Editorial ecommerce banner image with premium product storytelling",
        image: "/slides/1.jpeg",
        imagePosition: "right center",
        ctaTo: "/special-offers"
    }
]
</script>

<template>
    <section class="container-fluid bannerSection">
        <ClientOnly>
            <swiper-container
                class="bannerSwiper"
                :slides-per-view="1"
                :loop="true"
                :grab-cursor="true"
                :pagination="{ clickable: true }"
                :autoplay="{
                    delay: 7000,
                    disableOnInteraction: false
                }"
            >
                <swiper-slide v-for="(slide, idx) in slides" :key="slide.title">
                    <article class="bannerSwiper__slide">
                        <img
                            class="bannerSwiper__image"
                            :src="slide.image"
                            :alt="slide.alt"
                            :style="{ objectPosition: slide.imagePosition }"
                            :loading="idx === 0 ? 'eager' : 'lazy'"
                        />
                        <div class="bannerSwiper__veil"></div>
                        <div class="container bannerSwiper__inner">
                            <div class="bannerSwiper__content">
                                <span class="bannerSwiper__eyebrow">{{ slide.eyebrow }}</span>
                                <h1 class="bannerSwiper__title">
                                    {{ slide.title }}
                                </h1>
                                <p class="bannerSwiper__description">
                                    {{ slide.description }}
                                </p>
                                <div class="bannerSwiper__actions">
                                    <NuxtLink :to="slide.ctaTo" class="bannerSwiper__cta">
                                        <VBtn color="primary" size="x-large" rounded="pill" class="px-8 text-none font-weight-bold">
                                            Shop now
                                        </VBtn>
                                    </NuxtLink>
                                    <span class="bannerSwiper__detail">{{ slide.detail }}</span>
                                </div>
                            </div>
                            <div class="bannerSwiper__card">
                                <span class="bannerSwiper__cardLabel">Featured direction</span>
                                <p class="bannerSwiper__cardText">{{ slide.caption }}</p>
                                <div class="bannerSwiper__cardAccent"></div>
                            </div>
                        </div>
                    </article>
                </swiper-slide>
            </swiper-container>
        </ClientOnly>
    </section>
</template>
