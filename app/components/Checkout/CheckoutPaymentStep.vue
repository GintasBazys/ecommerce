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
    isRedirectingToOrder: boolean
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
            <span
                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
            >
                Step 3
            </span>
            <h2
                class="mt-4 text-[1.9rem] leading-[1.03] font-semibold tracking-[-0.04rem]"
                :class="props.currentStep === 'payment' ? 'text-slate-950' : 'text-slate-900'"
            >
                Shipping and payment
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Choose a delivery method and finish payment on the same screen.
            </p>
        </div>

        <div
            v-if="!props.addressCompleted"
            class="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600"
        >
            Save your address details first to unlock shipping options and payment.
        </div>

        <div
            v-else-if="props.currentStep !== 'payment'"
            class="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600"
        >
            Shipping options and payment will appear after the address step is saved.
        </div>

        <div
            v-else
            class="grid gap-5 rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:p-6 xl:grid-cols-2 xl:items-start"
        >
            <div class="grid content-start gap-4">
                <div>
                    <h3 class="text-base font-semibold text-slate-950">Shipping method</h3>
                    <p class="mt-1 text-sm leading-6 text-slate-600">Select the option that best fits this order.</p>
                </div>

                <template v-if="props.isShippingLoading">
                    <div class="h-[4.2rem] animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100"></div>
                    <div class="h-[4.2rem] animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100"></div>
                </template>

                <div v-else-if="props.shippingOptions.length" class="grid gap-3" role="radiogroup" aria-label="Shipping method">
                    <label
                        v-for="option in props.shippingOptions"
                        :key="option.id"
                        class="flex items-center gap-3 self-start rounded-[1.2rem] border px-4 py-4 transition"
                        :class="
                            props.selectedShippingOptionId === option.id
                                ? 'border-amber-300 bg-amber-50/70'
                                : 'border-slate-200/80 bg-white/90 hover:border-amber-200'
                        "
                    >
                        <input
                            :checked="props.selectedShippingOptionId === option.id"
                            type="radio"
                            :value="option.id"
                            class="accent-accent-500 mt-1 h-4 w-4"
                            @change="emit('update:selectedShippingOptionId', option.id)"
                        />
                        <span class="min-w-0 flex-1 text-sm leading-6 font-semibold text-slate-900">{{
                            props.getShippingOptionLabel(option)
                        }}</span>
                        <span
                            v-if="props.selectedShippingOptionId === option.id"
                            class="text-label-2xs tracking-label inline-flex min-h-7 items-center rounded-full border border-amber-200 bg-amber-100 px-3 font-bold text-amber-900 uppercase"
                        >
                            Selected
                        </span>
                    </label>
                </div>

                <p v-else class="text-sm leading-7 text-slate-600">No shipping options are available for this address yet.</p>
            </div>

            <div class="grid content-start gap-4">
                <div>
                    <h3 class="text-base font-semibold text-slate-950">Payment details</h3>
                    <p class="mt-1 text-sm leading-6 text-slate-600">Your payment is confirmed securely before the order is completed.</p>
                </div>

                <div class="rounded-[1.2rem] border border-slate-200/80 bg-white/90 p-4 sm:p-5">
                    <div id="link-authentication-element"></div>
                    <div id="payment-element" class="mt-4"></div>
                </div>

                <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button
                        type="button"
                        class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-amber-300 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        :disabled="props.isRedirectingToOrder"
                        @click="emit('back')"
                    >
                        Back
                    </button>
                    <button
                        type="button"
                        class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="
                            !props.clientSecretValue ||
                                props.isShippingLoading ||
                                props.isPaymentInitializing ||
                                props.isLoading ||
                                props.isRedirectingToOrder
                        "
                        @click="emit('submit')"
                    >
                        {{
                            props.isRedirectingToOrder
                                ? "Finishing order..."
                                : props.isLoading || props.isPaymentInitializing
                                    ? "Processing..."
                                    : "Pay now"
                        }}
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>
