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

type CountryOption = {
    iso_2: string
    display_name: string
}

const props = defineProps<{
    currentStep: string
    identityCompleted: boolean
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
    "update:billingField": [payload: { field: keyof Address; value: string }]
    "update:shippingField": [payload: { field: keyof Address; value: string }]
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
            <span class="inline-flex min-h-9 items-center rounded-full bg-brand-100 px-4 py-2 text-[0.78rem] font-bold uppercase tracking-[0.14em] text-brand-700">
                Step 2
            </span>
            <h2
                class="mt-4 text-[1.9rem] font-semibold leading-[1.03] tracking-[-0.04rem]"
                :class="props.currentStep === 'address' ? 'text-brand-700' : 'text-slate-950'"
            >
                Billing and shipping
            </h2>
            <p class="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Add the address details for this order without leaving checkout.
            </p>
        </div>

        <div v-if="!props.identityCompleted" class="rounded-[1.6rem] border border-slate-200/80 bg-slate-50/80 p-5 text-sm leading-7 text-slate-600">
            Complete the account step first to unlock the address form.
        </div>

        <div v-else class="rounded-[1.6rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 sm:p-6">
            <form class="grid gap-6" novalidate @submit.prevent="emit('submit')">
                <CheckoutAddressFields
                    title="Billing address"
                    prefix="checkout-billing"
                    autocomplete-prefix="billing"
                    :address="props.billingAddress"
                    :errors="props.billingErrors"
                    :countries="props.countries"
                    @update:field="emit('update:billingField', $event)"
                />

                <label class="inline-flex items-center gap-3 rounded-[1.2rem] border border-slate-200/80 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-900">
                    <input
                        type="checkbox"
                        class="h-4 w-4 accent-brand-700"
                        :checked="props.useSeparateShipping"
                        @change="onSeparateShippingChange"
                    />
                    <span>Use a separate shipping address</span>
                </label>

                <CheckoutAddressFields
                    v-if="props.useSeparateShipping"
                    title="Shipping address"
                    prefix="checkout-shipping"
                    autocomplete-prefix="shipping"
                    :address="props.shippingAddress"
                    :errors="props.shippingErrors"
                    :countries="props.countries"
                    @update:field="emit('update:shippingField', $event)"
                />

                <div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
                    <button type="button" class="ui-btn-secondary px-6" @click="emit('back')">Back</button>
                    <button type="submit" class="ui-btn-primary px-6" :disabled="props.isSubmitting">
                        {{ props.isSubmitting ? "Saving..." : "Save and continue" }}
                    </button>
                </div>
            </form>
        </div>
    </section>
</template>
