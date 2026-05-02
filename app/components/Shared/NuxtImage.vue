<script setup lang="ts">
interface NuxtImageProps {
    src: string
    alt: string
    width?: string | number
    height?: string | number
    sizes?: string
    format?: string
    quality?: string | number
    densities?: string
    loading?: "lazy" | "eager"
    decoding?: "async" | "auto" | "sync"
    fetchpriority?: "high" | "low" | "auto"
    preload?: boolean | { fetchPriority: "high" | "low" | "auto" }
}

const props = defineProps<NuxtImageProps>()

const resolvedFormat = computed<string | undefined>(() => {
    if (props.format) {
        return props.format
    }

    if (props.src.endsWith(".svg")) {
        return undefined
    }

    return "webp"
})
</script>

<template>
    <NuxtImg
        :src="src"
        :alt="alt"
        :width="width"
        :height="height"
        :sizes="sizes"
        :loading="loading"
        :format="resolvedFormat"
        :quality="quality"
        :densities="densities"
        :decoding="decoding"
        :fetchpriority="fetchpriority"
        :preload="preload"
        v-bind="$attrs"
    />
</template>
