<script setup lang="ts">
interface NuxtImageProps {
    src: string
    alt: string
    width?: string | number
    height?: string | number
    sizes?: string
    format?: string
    loading?: "lazy" | "eager"
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
        v-bind="$attrs"
    />
</template>
