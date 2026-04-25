<script setup lang="ts">
import { computed } from "vue"

type OptionValue = string | number

type SelectOption = {
    value?: OptionValue
    label?: string
    text?: string
    title?: string
    disabled?: boolean
}

defineOptions({
    inheritAttrs: false
})

const props = withDefaults(
    defineProps<{
        modelValue: OptionValue
        options: SelectOption[]
        optionLabelKey?: "label" | "text" | "title"
        optionValueKey?: "value"
    }>(),
    {
        optionLabelKey: "label",
        optionValueKey: "value"
    }
)

const emit = defineEmits<{
    "update:modelValue": [value: OptionValue]
}>()

const normalizedOptions = computed(() =>
    props.options.map((option, index) => ({
        key: `${String(option[props.optionValueKey] ?? index)}-${index}`,
        value: option[props.optionValueKey] ?? "",
        label: option[props.optionLabelKey] ?? option.label ?? option.text ?? option.title ?? "",
        disabled: option.disabled ?? false
    }))
)

const model = computed<OptionValue>({
    get: () => props.modelValue,
    set: (value) => emit("update:modelValue", value)
})

const arrowBackgroundStyle = {
    backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none'%3E%3Cpath d='M5 7.5 10 12.5 15 7.5' stroke='%23475569' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.9rem center",
    backgroundSize: "0.95rem 0.95rem"
} as const
</script>

<template>
    <select
        v-model="model"
        class="focus:border-brand-500 focus:ring-brand-100 h-11 w-full appearance-none rounded-2xl border border-slate-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] px-4 pr-10 text-sm font-medium text-slate-900 shadow-[0_10px_24px_rgba(8,27,90,0.05)] outline-hidden transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
        :style="arrowBackgroundStyle"
        v-bind="$attrs"
    >
        <option v-for="option in normalizedOptions" :key="option.key" :value="option.value" :disabled="option.disabled">
            {{ option.label }}
        </option>
    </select>
</template>
