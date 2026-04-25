<script setup lang="ts">
import type { Address } from "~/types/interfaces"

import CheckoutAddressFields from "~/components/Checkout/CheckoutAddressFields.vue"

type AddressErrors = {
    first_name: string
    last_name: string
    address_1: string
    city: string
    province: string
    postal_code: string
    country_code: string
    phone: string
}

type EditableAddressField =
    | "first_name"
    | "last_name"
    | "address_1"
    | "address_2"
    | "city"
    | "province"
    | "postal_code"
    | "country_code"
    | "phone"

type CountryOption = {
    iso_2: string
    display_name?: string
}

const props = defineProps<{
    currentStep: string
    identityCompleted: boolean
    addressCompleted: boolean
    useSeparateShipping: boolean
    billingAddress: Address
    shippingAddress: Address
    billingErrors: AddressErrors
    shippingErrors: AddressErrors
    countries: CountryOption[]
    isSubmitting: boolean
}>()

const emit = defineEmits<{
    "update:useSeparateShipping": [value: boolean]
    "update:billingField": [payload: { field: EditableAddressField; value: string }]
    "update:shippingField": [payload: { field: EditableAddressField; value: string }]
    back: []
    submit: []
}>()

function onSeparateShippingChange(event: Event): void {
    emit("update:useSeparateShipping", event.target instanceof HTMLInputElement ? event.target.checked : false)
}
</script>

<template>
    <section class="grid gap-4">
        <div>
            <span
                class="inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 text-label-sm font-bold tracking-label text-amber-900 uppercase"
            >
                Step 2
            </span>
            <h2
                class="mt-4 text-[1.9rem] leading-[1.03] font-semibold tracking-[-0.04rem]"
                :class="props.currentStep === 'address' ? 'text-slate-950' : 'text-slate-900'"
            >
                Billing and shipping
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Add the address details for this order without leaving checkout.
            </p>
        </div>

        <div
            v-if="!props.identityCompleted"
            class="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600"
        >
            Complete the account step first to unlock the address form.
        </div>

        <div
            v-else
            class="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:p-6"
        >
            <form class="grid gap-6" novalidate @submit.prevent="emit('submit')">
                <div class="rounded-[1.35rem] border border-slate-200/80 bg-white/90 p-4 sm:p-5">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Delivery details</p>
                            <h3 class="mt-2 text-lg font-semibold tracking-[-0.02em] text-slate-950">
                                Set the billing and shipping information
                            </h3>
                        </div>
                        <p class="text-sm leading-6 text-slate-600">
                            We use these details for delivery, updates, and payment confirmation.
                        </p>
                    </div>
                </div>

                <CheckoutAddressFields
                    title="Billing address"
                    eyebrow="Billing"
                    description="The primary address for this order and payment record."
                    prefix="checkout-billing"
                    autocomplete-prefix="billing"
                    :address="props.billingAddress"
                    :errors="props.billingErrors"
                    :countries="props.countries"
                    @update:field="emit('update:billingField', $event)"
                />

                <div class="rounded-[1.3rem] border border-slate-200/80 bg-slate-950 p-4 text-white sm:p-5">
                    <label class="flex cursor-pointer items-start gap-3">
                        <input
                            type="checkbox"
                            class="accent-accent-500 mt-1 h-4 w-4 shrink-0"
                            :checked="props.useSeparateShipping"
                            @change="onSeparateShippingChange"
                        />
                        <span class="grid gap-1">
                            <span class="text-sm font-semibold text-white">Use a separate shipping address</span>
                            <span class="text-sm leading-6 text-slate-300">
                                Turn this on if billing and delivery details should be different for this order.
                            </span>
                        </span>
                    </label>
                </div>

                <CheckoutAddressFields
                    v-if="props.useSeparateShipping"
                    title="Shipping address"
                    eyebrow="Shipping"
                    description="Where the order should arrive if it differs from billing."
                    prefix="checkout-shipping"
                    autocomplete-prefix="shipping"
                    :address="props.shippingAddress"
                    :errors="props.shippingErrors"
                    :countries="props.countries"
                    @update:field="emit('update:shippingField', $event)"
                />

                <div
                    v-if="!props.addressCompleted || props.currentStep === 'address'"
                    class="flex flex-col gap-3 sm:flex-row sm:justify-between"
                >
                    <button
                        type="button"
                        class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-900 transition hover:border-amber-300 hover:text-amber-900 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden"
                        @click="emit('back')"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-60"
                        :disabled="props.isSubmitting"
                    >
                        {{ props.isSubmitting ? "Saving..." : "Save and continue" }}
                    </button>
                </div>
            </form>
        </div>
    </section>
</template>
