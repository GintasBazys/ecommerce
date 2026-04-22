<script setup lang="ts">
import type { CustomerDTO } from "@medusajs/types"

type CustomerAddress = CustomerDTO["addresses"][number]

const props = defineProps<{ address: CustomerAddress }>()
const emit = defineEmits<{
    (_: "edit", __: CustomerAddress): void
    (_: "delete", __: string): void
}>()

const addressLines = computed<string[]>(() => {
    const cityLine = [props.address.city, props.address.province].filter(Boolean).join(", ")
    const postalLine = [props.address.postal_code, props.address.country_code?.toUpperCase()].filter(Boolean).join(" • ")

    return [props.address.address_1, props.address.address_2, cityLine, postalLine, props.address.phone, props.address.company].filter(
        (line): line is string => Boolean(line)
    )
})

function onEdit(): void {
    emit("edit", props.address)
}

function onDelete(): void {
    if (confirm("Are you sure you want to delete this address?")) {
        emit("delete", props.address.id)
    }
}
</script>

<template>
    <article class="flex h-full flex-col justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5">
        <div>
            <div class="flex items-start justify-between gap-3">
                <div>
                    <span class="text-[0.74rem] font-bold uppercase tracking-[0.12em] text-brand-700">
                        {{ props.address.address_name?.toUpperCase() || "UNNAMED ADDRESS" }}
                    </span>
                    <h3 class="mt-2 text-[1.05rem] font-semibold text-slate-950">
                        {{ props.address.first_name }} {{ props.address.last_name }}
                    </h3>
                </div>

                <div class="inline-flex gap-2">
                    <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-amber-200 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-200 motion-reduce:transition-none"
                        aria-label="Edit address"
                        @click="onEdit"
                    >
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="m13.5 6.5 4 4" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-200 motion-reduce:transition-none"
                        aria-label="Delete address"
                        @click="onDelete"
                    >
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 7h16" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10 11v5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M14 11v5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M6 7l1 12h10l1-12" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 7V4h6v3" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="mt-4 grid gap-1.5 text-sm leading-6 text-slate-600">
                <p v-for="line in addressLines" :key="line" class="m-0">{{ line }}</p>
            </div>
        </div>
    </article>
</template>
