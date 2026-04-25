<script setup lang="ts">
import NuxtImage from "~/components/Shared/NuxtImage.vue"

type GalleryImage = {
    id: string
    src: string
}

const props = defineProps<{
    productTitle: string
    productImages: GalleryImage[]
    activeImage: GalleryImage | null
    activeImageIndex: number
    isOnSale: boolean
}>()

const emit = defineEmits<{
    (_e: "select-image", _index: number): void
}>()

const mobileGalleryTrack = ref<HTMLElement | null>(null)

function selectImage(index: number): void {
    emit("select-image", index)

    const selectedSlide = mobileGalleryTrack.value?.children.item(index)

    if (!(selectedSlide instanceof HTMLElement)) {
        return
    }

    selectedSlide.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center"
    })
}

function syncActiveImageFromScroll(): void {
    const track = mobileGalleryTrack.value

    if (!track) {
        return
    }

    const slideWidth = track.clientWidth

    if (!slideWidth) {
        return
    }

    const nextIndex = Math.round(track.scrollLeft / slideWidth)
    emit("select-image", Math.min(Math.max(nextIndex, 0), Math.max(props.productImages.length - 1, 0)))
}
</script>

<template>
    <div class="relative rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm sm:rounded-4xl sm:p-4 lg:sticky lg:top-6">
        <div v-if="isOnSale" class="absolute left-5 top-5 z-10 inline-flex rounded-full bg-rose-500 px-4 py-2 text-label-sm font-bold uppercase tracking-label text-white">
            Sale
        </div>

        <div
            ref="mobileGalleryTrack"
            class="-mx-3 flex snap-x snap-mandatory overflow-x-auto px-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden lg:hidden"
            @scroll.passive="syncActiveImageFromScroll"
        >
            <div v-for="(image, index) in productImages" :key="image.id" class="min-w-full snap-center px-0.5">
                <div class="relative overflow-hidden rounded-[1.35rem] bg-slate-100">
                    <NuxtImage
                        :src="image.src"
                        :alt="`${productTitle} image ${index + 1}`"
                        width="1200"
                        height="1411"
                        sizes="100vw"
                        loading="eager"
                        class="block aspect-[0.88] w-full object-cover object-center"
                    />
                </div>
            </div>
        </div>

        <div class="hidden lg:block lg:space-y-4">
            <div class="relative overflow-hidden rounded-[1.75rem] bg-slate-100">
                <NuxtImage
                    :src="activeImage?.src || '/images/placeholder.png'"
                    :alt="activeImage?.src ? `${productTitle} image` : productTitle"
                    width="1200"
                    height="1411"
                    sizes="(max-width: 1279px) 100vw, 48vw"
                    loading="eager"
                    class="block aspect-[0.92] w-full object-cover object-center"
                />
            </div>

            <div v-if="productImages.length > 1" class="grid grid-cols-4 gap-3">
                <button
                    v-for="(image, index) in productImages"
                    :key="image.id"
                    type="button"
                    class="overflow-hidden rounded-2xl border bg-slate-50 p-1.5 text-left transition motion-reduce:transition-none"
                    :class="index === activeImageIndex ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200 hover:border-amber-200'"
                    :aria-pressed="index === activeImageIndex"
                    :aria-label="`Show image ${index + 1}`"
                    @click="selectImage(index)"
                >
                    <NuxtImage
                        :src="image.src"
                        :alt="`${productTitle} thumbnail ${index + 1}`"
                        width="300"
                        height="300"
                        loading="lazy"
                        format="png"
                        class="block aspect-square w-full rounded-[0.8rem] object-cover object-center"
                    />
                </button>
            </div>
        </div>

        <div v-if="productImages.length > 1" class="mt-4 flex items-center justify-center gap-2 lg:hidden">
            <button
                v-for="(image, index) in productImages"
                :key="`${image.id}-dot-${index}`"
                type="button"
                class="h-2.5 rounded-full transition motion-reduce:transition-none"
                :class="index === activeImageIndex ? 'w-7 bg-slate-950' : 'w-2.5 bg-slate-300'"
                :aria-label="`Go to image ${index + 1}`"
                :aria-pressed="index === activeImageIndex"
                @click="selectImage(index)"
            ></button>
        </div>
    </div>
</template>
