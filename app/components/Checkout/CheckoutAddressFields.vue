<script setup lang="ts">
import type { AddressErrors, CountryOption, EditableAddressField } from "~/types/checkout"
import type { Address } from "~/types/interfaces"

import BaseSelect from "~/components/Shared/BaseSelect.vue"

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

const countryOptions = computed<{ title: string; value: string }[]>(() => [
    { title: "Select a country", value: "" },
    ...props.countries.map((country) => ({
        title: country.display_name || country.iso_2.toUpperCase(),
        value: country.iso_2
    }))
])

type AddressErrorField = keyof AddressErrors

function fieldErrorId(field: AddressErrorField): string {
    return `${props.prefix}-${field.replace(/_/g, "-")}-error`
}

function hasFieldError(field: AddressErrorField): boolean {
    return Boolean(props.errors[field])
}

function fieldErrorDescription(field: AddressErrorField): string | undefined {
    return hasFieldError(field) ? fieldErrorId(field) : undefined
}
</script>

<template>
    <section class="rounded-card grid gap-5 border border-slate-200/80 bg-white/90 p-4 sm:p-5">
        <div>
            <span
                v-if="eyebrow"
                class="text-label-xs tracking-label inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-bold text-amber-900 uppercase"
            >
                {{ eyebrow }}
            </span>
            <h3 class="mt-3 text-base font-semibold text-slate-950">{{ title }}</h3>
            <p v-if="description" class="mt-1 text-sm leading-6 text-slate-600">{{ description }}</p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">First name</span>
                <input
                    :id="`${prefix}-first-name`"
                    :value="address.first_name"
                    type="text"
                    :autocomplete="`${autocompletePrefix} given-name`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="errors.first_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('first_name')"
                    :aria-describedby="fieldErrorDescription('first_name')"
                    @input="emit('update:field', { field: 'first_name', value: ($event.target as HTMLInputElement).value })"
                />
                <span v-if="errors.first_name" :id="fieldErrorId('first_name')" class="block text-sm leading-6 text-rose-600">{{ errors.first_name }}</span>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Last name</span>
                <input
                    :id="`${prefix}-last-name`"
                    :value="address.last_name"
                    type="text"
                    :autocomplete="`${autocompletePrefix} family-name`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="errors.last_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('last_name')"
                    :aria-describedby="fieldErrorDescription('last_name')"
                    @input="emit('update:field', { field: 'last_name', value: ($event.target as HTMLInputElement).value })"
                />
                <span v-if="errors.last_name" :id="fieldErrorId('last_name')" class="block text-sm leading-6 text-rose-600">{{ errors.last_name }}</span>
            </label>
        </div>

        <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-900">Address line 1</span>
            <input
                :id="`${prefix}-address-1`"
                :value="address.address_1"
                type="text"
                :autocomplete="`${autocompletePrefix} address-line1`"
                class="ui-input min-h-12 rounded-2xl"
                :class="errors.address_1 ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                :aria-invalid="hasFieldError('address_1')"
                :aria-describedby="fieldErrorDescription('address_1')"
                @input="emit('update:field', { field: 'address_1', value: ($event.target as HTMLInputElement).value })"
            />
            <span v-if="errors.address_1" :id="fieldErrorId('address_1')" class="block text-sm leading-6 text-rose-600">{{ errors.address_1 }}</span>
        </label>

        <label class="grid gap-2">
            <span class="text-sm font-semibold text-slate-900">Address line 2</span>
            <input
                :id="`${prefix}-address-2`"
                :value="address.address_2"
                type="text"
                :autocomplete="`${autocompletePrefix} address-line2`"
                class="ui-input min-h-12 rounded-2xl"
                @input="emit('update:field', { field: 'address_2', value: ($event.target as HTMLInputElement).value })"
            />
        </label>

        <div class="grid gap-4 lg:grid-cols-3">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Postal code</span>
                <input
                    :id="`${prefix}-postal-code`"
                    :value="address.postal_code"
                    type="text"
                    :autocomplete="`${autocompletePrefix} postal-code`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="errors.postal_code ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('postal_code')"
                    :aria-describedby="fieldErrorDescription('postal_code')"
                    @input="emit('update:field', { field: 'postal_code', value: ($event.target as HTMLInputElement).value })"
                />
                <span v-if="errors.postal_code" :id="fieldErrorId('postal_code')" class="block text-sm leading-6 text-rose-600">{{ errors.postal_code }}</span>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">City</span>
                <input
                    :id="`${prefix}-city`"
                    :value="address.city"
                    type="text"
                    :autocomplete="`${autocompletePrefix} address-level2`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="errors.city ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('city')"
                    :aria-describedby="fieldErrorDescription('city')"
                    @input="emit('update:field', { field: 'city', value: ($event.target as HTMLInputElement).value })"
                />
                <span v-if="errors.city" :id="fieldErrorId('city')" class="block text-sm leading-6 text-rose-600">{{ errors.city }}</span>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Province / State</span>
                <input
                    :id="`${prefix}-province`"
                    :value="address.province"
                    type="text"
                    :autocomplete="`${autocompletePrefix} address-level1`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="errors.province ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('province')"
                    :aria-describedby="fieldErrorDescription('province')"
                    @input="emit('update:field', { field: 'province', value: ($event.target as HTMLInputElement).value })"
                />
                <span v-if="errors.province" :id="fieldErrorId('province')" class="block text-sm leading-6 text-rose-600">{{ errors.province }}</span>
            </label>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Country</span>
                <BaseSelect
                    :id="`${prefix}-country`"
                    :model-value="address.country_code"
                    :options="countryOptions"
                    option-label-key="title"
                    :class="errors.country_code ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('country_code')"
                    :aria-describedby="fieldErrorDescription('country_code')"
                    @update:model-value="emit('update:field', { field: 'country_code', value: String($event) })"
                />
                <span v-if="errors.country_code" :id="fieldErrorId('country_code')" class="block text-sm leading-6 text-rose-600">{{ errors.country_code }}</span>
            </label>

            <label class="grid gap-2">
                <span class="text-sm font-semibold text-slate-900">Phone</span>
                <input
                    :id="`${prefix}-phone`"
                    :value="address.phone"
                    type="tel"
                    :autocomplete="`${autocompletePrefix} tel`"
                    class="ui-input min-h-12 rounded-2xl"
                    :class="errors.phone ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                    :aria-invalid="hasFieldError('phone')"
                    :aria-describedby="fieldErrorDescription('phone')"
                    @input="emit('update:field', { field: 'phone', value: ($event.target as HTMLInputElement).value })"
                />
                <span v-if="errors.phone" :id="fieldErrorId('phone')" class="block text-sm leading-6 text-rose-600">{{ errors.phone }}</span>
            </label>
        </div>
    </section>
</template>
