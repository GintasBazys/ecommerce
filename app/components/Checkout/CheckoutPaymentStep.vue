<script setup lang="ts">
import type { ShippingOption } from "~/types/interfaces"

const props = defineProps<{
    currentStep: string
    addressCompleted: boolean
    isShippingLoading: boolean
    shippingOptions: ShippingOption[]
    selectedShippingOptionId: string | null
    clientSecretValue: string | null
    isPaymentInitializing: boolean
    isLoading: boolean
    getShippingOptionLabel: (_option: ShippingOption) => string
}>()

const emit = defineEmits<{
    "update:selectedShippingOptionId": [value: string]
    back: []
    submit: []
}>()
</script>

<template>
    <section class="grid gap-4">
        <div>
            <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                Step 3
            </span>
            <h2
                class="mt-4 text-[1.9rem] font-semibold leading-[1.03] tracking-[-0.04rem]"
                :class="props.currentStep === 'payment' ? 'text-brand-700' : 'text-slate-950'"
            >
                Shipping and payment
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Choose a delivery method and finish payment on the same screen.
            </p>
        </div>

        <div v-if="!props.addressCompleted" class="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600">
            Save your address details first to unlock shipping options and payment.
        </div>

        <div
            v-else-if="props.currentStep !== 'payment'"
            class="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600"
        >
            Shipping options and payment will appear after the address step is saved.
        </div>

        <div v-else class="grid gap-5 rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:p-6 xl:grid-cols-2">
            <div class="grid gap-4">
                <div>
                    <h3 class="text-base font-semibold text-slate-950">Shipping method</h3>
                    <p class="mt-1 text-sm leading-6 text-slate-600">Select the option that best fits this order.</p>
                </div>

                <template v-if="props.isShippingLoading">
                    <div class="h-[4.2rem] animate-pulse rounded-[1rem] border border-slate-200/80 bg-slate-100"></div>
                    <div class="h-[4.2rem] animate-pulse rounded-[1rem] border border-slate-200/80 bg-slate-100"></div>
                </template>

                <div v-else-if="props.shippingOptions.length" class="grid gap-3" role="radiogroup" aria-label="Shipping method">
                    <label
                        v-for="option in props.shippingOptions"
                        :key="option.id"
                        class="flex items-start gap-3 rounded-[1.2rem] border px-4 py-4 transition"
                        :class="props.selectedShippingOptionId === option.id ? 'border-brand-300 bg-brand-50/70' : 'border-slate-200/80 bg-white/90'"
                    >
                        <input
                            :checked="props.selectedShippingOptionId === option.id"
                            type="radio"
                            :value="option.id"
                            class="mt-1 h-4 w-4 accent-brand-700"
                            @change="emit('update:selectedShippingOptionId', option.id)"
                        />
                        <span class="text-sm font-semibold leading-6 text-slate-900">{{ props.getShippingOptionLabel(option) }}</span>
                    </label>
                </div>

                <p v-else class="text-sm leading-7 text-slate-600">No shipping options are available for this address yet.</p>
            </div>

            <div class="grid gap-4">
                <div>
                    <h3 class="text-base font-semibold text-slate-950">Payment details</h3>
                    <p class="mt-1 text-sm leading-6 text-slate-600">Your payment is confirmed securely before the order is completed.</p>
                </div>

                <div class="rounded-[1.2rem] border border-slate-200/80 bg-white/90 p-4">
                    <div id="link-authentication-element"></div>
                    <div id="payment-element" class="mt-4"></div>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button type="button" class="ui-btn-secondary px-6" @click="emit('back')">Back</button>
                    <button
                        type="button"
                        class="ui-btn-primary px-6"
                        :disabled="!props.clientSecretValue || props.isShippingLoading || props.isPaymentInitializing || props.isLoading"
                        @click="emit('submit')"
                    >
                        {{ props.isLoading || props.isPaymentInitializing ? "Processing..." : "Pay now" }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
