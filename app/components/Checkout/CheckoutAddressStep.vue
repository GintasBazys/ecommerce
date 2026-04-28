<script setup lang="ts">
import type { CustomerAddressDTO } from "@medusajs/types"
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
    savedAddresses: CustomerAddressDTO[]
    isSavedAddressesLoading: boolean
    savedAddressesError: string | null
    selectedBillingSavedAddressId: string
    selectedShippingSavedAddressId: string
    isSubmitting: boolean
}>()

const emit = defineEmits<{
    "update:useSeparateShipping": [value: boolean]
    "update:selectedBillingSavedAddressId": [value: string]
    "update:selectedShippingSavedAddressId": [value: string]
    "update:billingField": [payload: { field: EditableAddressField; value: string }]
    "update:shippingField": [payload: { field: EditableAddressField; value: string }]
    back: []
    submit: []
}>()

function onSeparateShippingChange(event: Event): void {
    emit("update:useSeparateShipping", event.target instanceof HTMLInputElement ? event.target.checked : false)
}

function getSavedAddressTitle(address: CustomerAddressDTO): string {
    const name = [address.first_name, address.last_name].filter(Boolean).join(" ")
    return address.address_name || name || "Saved address"
}

function getSavedAddressLines(address: CustomerAddressDTO): string[] {
    const cityLine = [address.postal_code, address.city].filter(Boolean).join(" ")
    const regionLine = [address.province, address.country_code?.toUpperCase()].filter(Boolean).join(", ")

    return [address.address_1, address.address_2, cityLine, regionLine, address.phone].filter((line): line is string => Boolean(line))
}

function onSavedAddressChange(event: Event, target: "billing" | "shipping"): void {
    const value = event.target instanceof HTMLInputElement ? event.target.value : ""

    if (target === "billing") {
        emit("update:selectedBillingSavedAddressId", value)
        return
    }

    emit("update:selectedShippingSavedAddressId", value)
}
</script>

<template>
    <section class="grid gap-4">
        <div>
            <span
                class="text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full border border-amber-200/70 bg-amber-50 px-4 py-2 font-bold text-amber-900 uppercase"
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
                <div class="rounded-card border border-slate-200/80 bg-white/90 p-4 sm:p-5">
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

                <section
                    v-if="props.isSavedAddressesLoading || props.savedAddressesError || props.savedAddresses.length"
                    class="rounded-card border border-amber-200/70 bg-[linear-gradient(135deg,rgba(255,251,235,0.96),rgba(255,255,255,0.98))] p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-5"
                    aria-labelledby="checkout-saved-billing-title"
                >
                    <div class="flex items-start justify-between gap-3">
                        <div>
                            <p class="text-label-xs tracking-label font-bold text-amber-900 uppercase">Saved addresses</p>
                            <h3 id="checkout-saved-billing-title" class="mt-2 text-base font-semibold text-slate-950">
                                Choose a saved billing address
                            </h3>
                            <p class="mt-1 text-sm leading-6 text-slate-600">
                                Use one tap to prefill your details, or continue with a new address below.
                            </p>
                        </div>
                    </div>

                    <div v-if="props.isSavedAddressesLoading" class="mt-4 grid gap-3" aria-hidden="true">
                        <div v-for="item in 2" :key="item" class="rounded-[1.1rem] border border-amber-100 bg-white/80 p-4">
                            <div class="animate-pulse space-y-3">
                                <div class="h-4 w-32 rounded-full bg-amber-100"></div>
                                <div class="h-3 w-full rounded-full bg-slate-200"></div>
                                <div class="h-3 w-2/3 rounded-full bg-slate-200"></div>
                            </div>
                        </div>
                    </div>

                    <p
                        v-else-if="props.savedAddressesError"
                        class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700"
                        role="alert"
                    >
                        {{ props.savedAddressesError }}
                    </p>

                    <div v-else class="mt-4 grid gap-3 sm:grid-cols-2">
                        <label
                            v-for="address in props.savedAddresses"
                            :key="address.id"
                            class="group relative flex min-h-32 cursor-pointer gap-3 rounded-[1.1rem] border bg-white/90 p-4 transition focus-within:ring-2 focus-within:ring-amber-200 motion-reduce:transition-none"
                            :class="
                                props.selectedBillingSavedAddressId === address.id
                                    ? 'border-amber-300 shadow-[0_16px_36px_rgba(245,158,11,0.12)] ring-1 ring-amber-100'
                                    : 'border-slate-200 hover:border-amber-200'
                            "
                        >
                            <input
                                type="radio"
                                name="checkout-saved-billing-address"
                                class="accent-accent-500 mt-1 h-4 w-4 shrink-0"
                                :value="address.id"
                                :checked="props.selectedBillingSavedAddressId === address.id"
                                @change="onSavedAddressChange($event, 'billing')"
                            />
                            <span class="grid gap-2 text-sm leading-6">
                                <span class="font-semibold text-slate-950">{{ getSavedAddressTitle(address) }}</span>
                                <span class="grid gap-0.5 text-slate-600">
                                    <span v-for="line in getSavedAddressLines(address)" :key="line">{{ line }}</span>
                                </span>
                            </span>
                        </label>
                    </div>
                </section>

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

                <section
                    v-if="props.useSeparateShipping && props.savedAddresses.length"
                    class="rounded-card border border-slate-200/80 bg-white/90 p-4 sm:p-5"
                    aria-labelledby="checkout-saved-shipping-title"
                >
                    <p class="text-label-xs tracking-label font-bold text-slate-500 uppercase">Optional shortcut</p>
                    <h3 id="checkout-saved-shipping-title" class="mt-2 text-base font-semibold text-slate-950">
                        Use a saved shipping address
                    </h3>
                    <div class="mt-4 grid gap-3 sm:grid-cols-2">
                        <label
                            v-for="address in props.savedAddresses"
                            :key="address.id"
                            class="flex min-h-28 cursor-pointer gap-3 rounded-[1.1rem] border bg-slate-50 p-4 transition focus-within:ring-2 focus-within:ring-amber-200 motion-reduce:transition-none"
                            :class="props.selectedShippingSavedAddressId === address.id ? 'border-amber-300 bg-amber-50/70' : 'border-slate-200 hover:border-amber-200'"
                        >
                            <input
                                type="radio"
                                name="checkout-saved-shipping-address"
                                class="accent-accent-500 mt-1 h-4 w-4 shrink-0"
                                :value="address.id"
                                :checked="props.selectedShippingSavedAddressId === address.id"
                                @change="onSavedAddressChange($event, 'shipping')"
                            />
                            <span class="grid gap-2 text-sm leading-6">
                                <span class="font-semibold text-slate-950">{{ getSavedAddressTitle(address) }}</span>
                                <span class="grid gap-0.5 text-slate-600">
                                    <span v-for="line in getSavedAddressLines(address)" :key="line">{{ line }}</span>
                                </span>
                            </span>
                        </label>
                    </div>
                </section>

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
