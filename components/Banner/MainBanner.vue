<script setup lang="ts">
import { ClientOnly } from "#components"

const slides = ref(Array.from({ length: 4 }))
</script>

<template>
    <section class="container-fluid px-0">
        <ClientOnly>
            <swiper-container
                class="bannerSwiper"
                :slides-per-view="1"
                :loop="true"
                :grab-cursor="true"
                :autoplay="{
                    delay: 8000,
                    disableOnInteraction: true
                }"
            >
                <swiper-slide v-for="(slide, idx) in slides" :key="idx">
                    <NuxtImg
                        class="img-fluid"
                        format="webp"
                        src="/slides/1.jpeg"
                        width="3840"
                        height="1316"
                        sizes="480px md:100vw"
                        densities="x1 x2"
                        :placeholder="[3840, 1316, 75, 5]"
                        :loading="slide === 1 ? 'eager' : 'lazy'"
                    />
                </swiper-slide> </swiper-container
        ></ClientOnly>
    </section>
</template>
