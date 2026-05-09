<script setup lang="ts">
import type { NuxtImageProps } from "../../types/media"

const props = defineProps<NuxtImageProps>()

const normalizedSrc = computed<string>(() => (typeof props.src === "string" ? props.src.trim() || "/images/placeholder.png" : "/images/placeholder.png"))

const resolvedFormat = computed<string | undefined>(() => {
    if (props.format) {
        return props.format
    }

    if (normalizedSrc.value.endsWith(".svg")) {
        return undefined
    }

    return "webp"
})
</script>

<template>
    <NuxtImg
        :src="normalizedSrc"
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
