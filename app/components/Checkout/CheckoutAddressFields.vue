<script setup lang="ts">
import type { Address } from "~/types/interfaces"

import BaseSelect from "~/components/Shared/BaseSelect.vue"

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
    title: string
    eyebrow?: string
    description?: string
    prefix: string
    autocompletePrefix: string
    address: Address
    errors: AddressErrors
    countries: CountryOption[]
}>()

const emit = defineEmits<{
    "update:field": [payload: { field: EditableAddressField; value: string }]
}>()

const countryOptions = computed(() => [
    { title: "Select a country", value: "" },
    ...props.countries.map((country) => ({
        title: country.display_name || country.iso_2.toUpperCase(),
        value: country.iso_2
    }))
])
</script>

<template>
    <section class="grid gap-5 rounded-[1.35rem] border border-slate-200/80 bg-white/90 p-4 sm:p-5">
        <div>
            <span
                v-if="props.eyebrow"
                class="inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-amber-900"
            >
                {{ props.eyebrow }}
            </span>
            <h3 class="mt-3 text-base font-semibold text-slate-950">{{ props.title }}</h3>
            <p v-if="props.description" class="mt-1 text-sm leading-6 text-slate-600">{{ props.description }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">First name</span>
                <input
                    :id="`${props.prefix}-first-name`"
                    :value="props.address.first_name"
                    type="text"
                    :autocomplete="`${props.autocompletePrefix} given-name`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="props.errors.first_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @input="emit('update:field', { field: 'first_name', value: ($event.target as HTMLInputElement).value })"
                />
                <p v-if="props.errors.first_name" class="text-sm leading-6 text-rose-600">{{ props.errors.first_name }}</p>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Last name</span>
                <input
                    :id="`${props.prefix}-last-name`"
                    :value="props.address.last_name"
                    type="text"
                    :autocomplete="`${props.autocompletePrefix} family-name`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="props.errors.last_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @input="emit('update:field', { field: 'last_name', value: ($event.target as HTMLInputElement).value })"
                />
                <p v-if="props.errors.last_name" class="text-sm leading-6 text-rose-600">{{ props.errors.last_name }}</p>
            </label>
        </div>

        <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-900">Address line 1</span>
            <input
                :id="`${props.prefix}-address-1`"
                :value="props.address.address_1"
                type="text"
                :autocomplete="`${props.autocompletePrefix} address-line1`"
                class="ui-input min-h-12 rounded-2xl"
                :class="props.errors.address_1 ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                @input="emit('update:field', { field: 'address_1', value: ($event.target as HTMLInputElement).value })"
            />
            <p v-if="props.errors.address_1" class="text-sm leading-6 text-rose-600">{{ props.errors.address_1 }}</p>
        </label>

        <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-900">Address line 2</span>
            <input
                :id="`${props.prefix}-address-2`"
                :value="props.address.address_2"
                type="text"
                :autocomplete="`${props.autocompletePrefix} address-line2`"
                class="ui-input min-h-12 rounded-2xl"
                @input="emit('update:field', { field: 'address_2', value: ($event.target as HTMLInputElement).value })"
            />
        </label>

        <div class="grid gap-4 lg:grid-cols-3">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Postal code</span>
                <input
                    :id="`${props.prefix}-postal-code`"
                    :value="props.address.postal_code"
                    type="text"
                    :autocomplete="`${props.autocompletePrefix} postal-code`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="props.errors.postal_code ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @input="emit('update:field', { field: 'postal_code', value: ($event.target as HTMLInputElement).value })"
                />
                <p v-if="props.errors.postal_code" class="text-sm leading-6 text-rose-600">{{ props.errors.postal_code }}</p>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">City</span>
                <input
                    :id="`${props.prefix}-city`"
                    :value="props.address.city"
                    type="text"
                    :autocomplete="`${props.autocompletePrefix} address-level2`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="props.errors.city ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @input="emit('update:field', { field: 'city', value: ($event.target as HTMLInputElement).value })"
                />
                <p v-if="props.errors.city" class="text-sm leading-6 text-rose-600">{{ props.errors.city }}</p>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Province / State</span>
                <input
                    :id="`${props.prefix}-province`"
                    :value="props.address.province"
                    type="text"
                    :autocomplete="`${props.autocompletePrefix} address-level1`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="props.errors.province ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @input="emit('update:field', { field: 'province', value: ($event.target as HTMLInputElement).value })"
                />
                <p v-if="props.errors.province" class="text-sm leading-6 text-rose-600">{{ props.errors.province }}</p>
            </label>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Country</span>
                <BaseSelect
                    :id="`${props.prefix}-country`"
                    :model-value="props.address.country_code"
                    :options="countryOptions"
                    option-label-key="title"
                    :class="props.errors.country_code ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @update:model-value="emit('update:field', { field: 'country_code', value: String($event) })"
                />
                <p v-if="props.errors.country_code" class="text-sm leading-6 text-rose-600">{{ props.errors.country_code }}</p>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Phone</span>
                <input
                    :id="`${props.prefix}-phone`"
                    :value="props.address.phone"
                    type="tel"
                    :autocomplete="`${props.autocompletePrefix} tel`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="props.errors.phone ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    @input="emit('update:field', { field: 'phone', value: ($event.target as HTMLInputElement).value })"
                />
                <p v-if="props.errors.phone" class="text-sm leading-6 text-rose-600">{{ props.errors.phone }}</p>
            </label>
        </div>
    </section>
</template>
