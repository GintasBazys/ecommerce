<template>
    <section class="container-fluid px-0">
        <Swiper
            :modules="[SwiperAutoplay, SwiperPagination]"
            :slides-per-view="1"
            :grab-cursor="true"
            :pagination="{ clickable: true }"
            :autoplay="{
                delay: 8000,
                disableOnInteraction: true
            }"
            class="bannerSwiper"
        >
            <SwiperSlide v-for="slide in 4" :key="slide">
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
            </SwiperSlide>
        </Swiper>
    </section>
</template>
