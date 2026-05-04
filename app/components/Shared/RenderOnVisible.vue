<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        rootMargin?: string
        fallbackDelay?: number
        containIntrinsicSize?: string
    }>(),
    {
        rootMargin: "900px 0px",
        fallbackDelay: 3500,
        containIntrinsicSize: "1px 900px"
    }
)

const wrapperRef = useTemplateRef<HTMLElement>("wrapper")
const shouldRender = shallowRef<boolean>(false)

let observer: IntersectionObserver | null = null
let fallbackTimer: number | null = null

function renderContent(): void {
    shouldRender.value = true
    observer?.disconnect()
    observer = null

    if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer)
        fallbackTimer = null
    }
}

onMounted(() => {
    if (!wrapperRef.value || !("IntersectionObserver" in window)) {
        fallbackTimer = window.setTimeout(renderContent, props.fallbackDelay)
        return
    }

    observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                renderContent()
            }
        },
        { rootMargin: props.rootMargin }
    )

    observer.observe(wrapperRef.value)
})

onBeforeUnmount(() => {
    observer?.disconnect()

    if (fallbackTimer !== null) {
        window.clearTimeout(fallbackTimer)
    }
})
</script>

<template>
    <div
        ref="wrapper"
        :style="{
            contentVisibility: 'auto',
            containIntrinsicSize
        }"
    >
        <slot v-if="shouldRender"></slot>
    </div>
</template>
