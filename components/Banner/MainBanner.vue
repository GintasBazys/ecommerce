M
<script setup lang="ts">
const containerRef = ref(null)
const slides = ref(Array.from({ length: 4 }))
useSwiper(containerRef, {
    slidesPerView: 1,
    loop: true,
    autoplay: {
        delay: 8000,
        disableOnInteraction: true
    },
    grabCursor: true,
    pagination: {
        clickable: true
    }
})
</script>

<template>
    <section class="container-fluid px-0">
        <swiper-container ref="containerRef" class="bannerSwiper">
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
            </swiper-slide>
        </swiper-container>
    </section>
</template>
