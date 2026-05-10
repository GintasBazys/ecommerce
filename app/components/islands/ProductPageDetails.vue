<script setup lang="ts">
defineProps<{
    productDescription: string
}>()
</script>

<template>
    <div class="rounded-panel border border-slate-200 bg-white p-5 shadow-sm sm:rounded-4xl sm:p-7 xl:p-8">
        <span
            class="bg-brand-100 text-label-sm tracking-label text-brand-700 inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
        >
            Product details
        </span>
        <h2 class="mt-4 max-w-xs text-3xl leading-tight font-bold tracking-tight text-slate-950 sm:text-4xl">
            More context before you commit.
        </h2>

        <div class="mt-6 grid gap-3 xl:grid-cols-3">
            <details class="group rounded-card border border-slate-200 bg-slate-50 p-4" open>
                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                    Description
                    <span class="text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <p class="mt-4 text-sm leading-7 text-slate-600">
                    {{ productDescription }}
                </p>
            </details>

            <details class="group rounded-card border border-slate-200 bg-slate-50 p-4">
                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                    Buying notes
                    <span class="text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                    <li>Choose your preferred option before adjusting quantity.</li>
                    <li>Pricing updates instantly based on the selected variant.</li>
                    <li>Shipping updates at checkout, and tax display follows the selected region.</li>
                </ul>
            </details>

            <details class="group rounded-card border border-slate-200 bg-slate-50 p-4">
                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-slate-950">
                    Why customers like it
                    <span class="text-slate-400 transition group-open:rotate-45 motion-reduce:transition-none">+</span>
                </summary>
                <p class="mt-4 text-sm leading-7 text-slate-600">
                    Designed to feel premium without becoming fussy, this product balances presentation, utility, and easy everyday use.
                </p>
            </details>
        </div>
    </div>
</template>
