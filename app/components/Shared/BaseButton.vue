<script setup lang="ts">
import { computed, ref, useAttrs } from "vue"

defineOptions({
    inheritAttrs: false
})

type ButtonVariant = "plain" | "primary" | "secondary" | "accent"
type ButtonSize = "none" | "sm" | "md" | "lg" | "icon"
type ButtonType = "button" | "submit" | "reset"

const props = withDefaults(
    defineProps<{
        variant?: ButtonVariant
        size?: ButtonSize
        type?: ButtonType
        disabled?: boolean
        loading?: boolean
        block?: boolean
    }>(),
    {
        variant: "plain",
        size: "none",
        type: "button",
        disabled: false,
        loading: false,
        block: false
    }
)

const buttonRef = ref<HTMLButtonElement | null>(null)
const attrs = useAttrs()

const variantClasses: Record<ButtonVariant, string> = {
    plain: "",
    primary: "ui-btn-primary",
    secondary: "ui-btn-secondary",
    accent: "ui-btn-accent"
}

const sizeClasses: Record<ButtonSize, string> = {
    none: "",
    sm: "min-h-10 px-4 text-sm",
    md: "min-h-11 px-5 text-sm",
    lg: "min-h-12 px-6 text-base",
    icon: "min-h-11 min-w-11 px-0"
}

const buttonClasses = computed(() => [
    variantClasses[props.variant],
    props.variant === "plain" ? sizeClasses[props.size] : "",
    props.block ? "w-full" : "",
    attrs.class
])
const buttonAttrs = computed(() => {
    const { class: _class, ...restAttrs } = attrs

    return restAttrs
})
const isDisabled = computed(() => props.disabled || props.loading)

function focus(options?: Parameters<HTMLButtonElement["focus"]>[0]): void {
    buttonRef.value?.focus(options)
}

defineExpose({
    focus
})
</script>

<template>
    <button ref="buttonRef" :type="props.type" :disabled="isDisabled" :aria-busy="props.loading || undefined" :class="buttonClasses" v-bind="buttonAttrs">
        <slot></slot>
    </button>
</template>
