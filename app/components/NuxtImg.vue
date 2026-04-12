<script setup lang="ts">
defineOptions({
    inheritAttrs: false
})

const props = defineProps<{
    src?: string
    alt?: string
    width?: string | number
    height?: string | number
    loading?: "lazy" | "eager"
    decoding?: "async" | "sync" | "auto"
}>()
</script>

<template>
    <img
        :src="props.src"
        :alt="props.alt ?? ''"
        :width="props.width"
        :height="props.height"
        :loading="props.loading ?? 'lazy'"
        :decoding="props.decoding ?? 'async'"
        v-bind="$attrs"
    />
</template>
