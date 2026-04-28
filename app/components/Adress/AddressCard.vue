<script setup lang="ts">
import type { CustomerDTO } from "@medusajs/types"

type CustomerAddress = CustomerDTO["addresses"][number]

const props = defineProps<{ address: CustomerAddress }>()
const emit = defineEmits<{
    (_: "edit", __: CustomerAddress): void
    (_: "delete", __: string): void
}>()

const recipientName = computed<string>(() => [props.address.first_name, props.address.last_name].filter(Boolean).join(" ") || "Recipient not set")

const addressLabel = computed<string>(() => props.address.address_name || "Saved address")

const locationLine = computed<string>(() => [props.address.postal_code, props.address.city].filter(Boolean).join(" "))
const regionLine = computed<string>(() => [props.address.province, props.address.country_code?.toUpperCase()].filter(Boolean).join(", "))

const addressLines = computed<string[]>(() =>
    [props.address.address_1, props.address.address_2, locationLine.value, regionLine.value].filter((line): line is string => Boolean(line))
)

const defaultBadges = computed<string[]>(() => {
    const badges: string[] = []

    if (props.address.is_default_shipping) {
        badges.push("Default shipping")
    }

    if (props.address.is_default_billing) {
        badges.push("Default billing")
    }

    return badges
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
    <article
        class="group relative flex h-full min-h-72 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[0_22px_70px_rgba(15,23,42,0.11)] motion-reduce:transition-none"
    >
        <div class="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(135deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9)_52%,rgba(214,169,94,0.82))]"></div>

        <div class="relative flex w-full flex-col p-4 sm:p-5">
            <div class="flex items-start justify-between gap-3 text-white">
                <div class="min-w-0">
                    <span class="text-label-xs tracking-label inline-flex max-w-full rounded-full border border-white/15 bg-white/10 px-3 py-1 font-bold uppercase text-amber-100 backdrop-blur">
                        <span class="truncate">{{ addressLabel }}</span>
                    </span>
                    <h3 class="mt-3 truncate text-xl font-semibold tracking-[-0.03em] text-white">
                        {{ recipientName }}
                    </h3>
                </div>

                <div class="flex shrink-0 gap-2">
                    <button
                        type="button"
                        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/95 text-slate-600 shadow-sm transition hover:bg-amber-50 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                        :aria-label="`Edit ${addressLabel}`"
                        @click="onEdit"
                    >
                        <svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="m13.5 6.5 4 4" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-200 focus-visible:outline-hidden motion-reduce:transition-none"
                        :aria-label="`Delete ${addressLabel}`"
                        @click="onDelete"
                    >
                        <svg viewBox="0 0 24 24" class="h-4.5 w-4.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                            <path d="M4 7h16" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M10 11v5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M14 11v5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M6 7l1 12h10l1-12" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9 7V4h6v3" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            <div class="mt-7 flex flex-1 flex-col rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
                <div v-if="defaultBadges.length" class="mb-4 flex flex-wrap gap-2">
                    <span
                        v-for="badge in defaultBadges"
                        :key="badge"
                        class="inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-900"
                    >
                        {{ badge }}
                    </span>
                </div>

                <div class="grid gap-3 text-sm leading-6 text-slate-700">
                    <div class="flex gap-3">
                        <span class="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                                <path d="M12 21s-5.5-5.7-5.5-10a5.5 5.5 0 1 1 11 0c0 4.3-5.5 10-5.5 10Z" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M12 13.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <div class="min-w-0">
                            <p class="font-semibold text-slate-950">Delivery address</p>
                            <p v-for="line in addressLines" :key="line" class="m-0 wrap-break-word text-slate-600">{{ line }}</p>
                        </div>
                    </div>

                    <div v-if="props.address.phone || props.address.company" class="grid gap-2 border-t border-slate-100 pt-3">
                        <p v-if="props.address.phone" class="flex items-center gap-2 font-medium text-slate-700">
                            <span class="text-slate-400" aria-hidden="true">Phone</span>
                            <span class="truncate text-slate-950">{{ props.address.phone }}</span>
                        </p>
                        <p v-if="props.address.company" class="flex items-center gap-2 font-medium text-slate-700">
                            <span class="text-slate-400" aria-hidden="true">Company</span>
                            <span class="truncate text-slate-950">{{ props.address.company }}</span>
                        </p>
                    </div>
                </div>

                <p v-if="!addressLines.length" class="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-sm leading-6 text-rose-700">
                    Address details are incomplete. Edit this entry before using it at checkout.
                </p>
            </div>
        </div>
    </article>
</template>
