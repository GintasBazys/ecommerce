<script setup lang="ts">
import type { NuxtImageProps } from "../../types/media"

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
