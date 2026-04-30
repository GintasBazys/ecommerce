<script setup lang="ts">
import type { CustomerAddressDTO } from "@medusajs/types"

import BaseSelect from "~/components/Shared/BaseSelect.vue"

const model = defineModel<boolean>()
const regionStore = useRegionStore()
const { regionCountries } = storeToRefs(regionStore)

const props = defineProps<{
    address: Partial<CustomerAddressDTO>
    title: string
}>()

const emit = defineEmits<{
    (_: "save", __: CustomerAddressDTO): void
}>()

type RequiredAddressField = "first_name" | "last_name" | "address_1" | "city" | "province" | "postal_code" | "country_code" | "phone"
type AddressErrors = Record<RequiredAddressField, string>

const requiredFields: RequiredAddressField[] = [
    "first_name",
    "last_name",
    "address_1",
    "city",
    "province",
    "postal_code",
    "country_code",
    "phone"
]

const errors = reactive<AddressErrors>({
    first_name: "",
    last_name: "",
    address_1: "",
    city: "",
    province: "",
    postal_code: "",
    country_code: "",
    phone: ""
})

const local = reactive<CustomerAddressDTO>({
    id: props.address.id || "",
    first_name: props.address.first_name || "",
    last_name: props.address.last_name || "",
    phone: props.address.phone || "",
    company: props.address.company || "",
    address_1: props.address.address_1 || "",
    address_2: props.address.address_2 || "",
    city: props.address.city || "",
    province: props.address.province || "",
    postal_code: props.address.postal_code || "",
    country_code: props.address.country_code || "",
    address_name: props.address.address_name || "",
    metadata: props.address.metadata || {},
    is_default_shipping: props.address.is_default_shipping ?? false,
    is_default_billing: props.address.is_default_billing ?? false,
    customer_id: "",
    created_at: "",
    updated_at: ""
})

watch(
    () => props.address,
    (newValue) => {
        Object.assign(local, {
            id: newValue.id || "",
            first_name: newValue.first_name || "",
            last_name: newValue.last_name || "",
            phone: newValue.phone || "",
            company: newValue.company || "",
            address_1: newValue.address_1 || "",
            address_2: newValue.address_2 || "",
            city: newValue.city || "",
            province: newValue.province || "",
            postal_code: newValue.postal_code || "",
            country_code: newValue.country_code || "",
            address_name: newValue.address_name || "",
            metadata: newValue.metadata || {},
            is_default_shipping: newValue.is_default_shipping ?? false,
            is_default_billing: newValue.is_default_billing ?? false
        })
        clearErrors()
    }
)

const countryOptions = computed(() => [
    { title: "Select a country", value: "", disabled: true },
    ...regionCountries.value
        .filter((country) => Boolean(country.iso_2))
        .map((country) => ({
            title: country.display_name || String(country.iso_2).toUpperCase(),
            value: String(country.iso_2)
        }))
])

const countryCodeModel = computed<string>({
    get: () => String(local.country_code ?? ""),
    set: (value) => {
        local.country_code = value
    }
})

onMounted(async () => {
    if (!regionCountries.value.length) {
        await regionStore.fetchRegion()
    }
})

function close(): void {
    model.value = false
}

function clearErrors(): void {
    for (const field of requiredFields) {
        errors[field] = ""
    }
}

function getFieldValue(field: RequiredAddressField): string {
    return String(local[field] ?? "").trim()
}

function validate(): boolean {
    clearErrors()

    for (const field of requiredFields) {
        errors[field] = getFieldValue(field) ? "" : "This field is required"
    }

    if (getFieldValue("phone") && !/^[+]?\d[\d\s-]{6,}$/.test(getFieldValue("phone"))) {
        errors.phone = "Enter a valid phone number"
    }

    return !Object.values(errors).some(Boolean)
}

function getTrimmedAddress(): CustomerAddressDTO {
    return {
        ...local,
        first_name: String(local.first_name ?? "").trim(),
        last_name: String(local.last_name ?? "").trim(),
        phone: String(local.phone ?? "").trim(),
        company: String(local.company ?? "").trim(),
        address_1: String(local.address_1 ?? "").trim(),
        address_2: String(local.address_2 ?? "").trim(),
        city: String(local.city ?? "").trim(),
        province: String(local.province ?? "").trim(),
        postal_code: String(local.postal_code ?? "").trim(),
        country_code: String(local.country_code ?? "").trim().toLowerCase(),
        address_name: String(local.address_name ?? "").trim()
    }
}

function save(): void {
    if (!validate()) {
        return
    }

    emit("save", getTrimmedAddress())
    model.value = false
}
</script>

<template>
    <Teleport to="body">
        <div
            v-if="model"
            class="fixed inset-0 z-90 flex items-end bg-slate-950/55 p-3 sm:items-center sm:justify-center sm:p-4"
            role="dialog"
            aria-modal="true"
            :aria-label="props.title"
            @click.self="close"
        >
            <div
                class="relative flex max-h-screen w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl sm:max-h-screen"
            >
                <button
                    type="button"
                    class="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                    aria-label="Close address form"
                    @click="close"
                >
                    <span aria-hidden="true" class="text-lg leading-none">×</span>
                </button>

                <div class="overflow-y-auto px-5 pt-5 pb-5 sm:px-7 sm:pt-7 sm:pb-7">
                    <div class="pr-12">
                        <span
                            class="bg-brand-100 text-brand-700 text-label-sm tracking-label inline-flex min-h-9 items-center rounded-full px-4 py-2 font-bold uppercase"
                        >
                            Address details
                        </span>
                        <h2 class="mt-4 text-3xl leading-tight font-bold tracking-tight text-slate-950">
                            {{ props.title }}
                        </h2>
                        <p class="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                            Add or update the address details you want available during future checkout and support flows.
                        </p>
                    </div>

                    <form class="mt-6 grid gap-4" @submit.prevent="save">
                        <div class="grid gap-4 sm:grid-cols-2">
                            <div class="grid gap-2">
                                <label for="address-first-name" class="text-sm font-medium text-slate-700">First name</label>
                                <input
                                    id="address-first-name"
                                    v-model="local.first_name"
                                    type="text"
                                    autocomplete="given-name"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                    :class="errors.first_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    :aria-invalid="Boolean(errors.first_name)"
                                    aria-describedby="address-first-name-error"
                                />
                                <span v-if="errors.first_name" id="address-first-name-error" class="text-sm leading-6 text-rose-600">
                                    {{ errors.first_name }}
                                </span>
                            </div>
                            <div class="grid gap-2">
                                <label for="address-last-name" class="text-sm font-medium text-slate-700">Last name</label>
                                <input
                                    id="address-last-name"
                                    v-model="local.last_name"
                                    type="text"
                                    autocomplete="family-name"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                    :class="errors.last_name ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    :aria-invalid="Boolean(errors.last_name)"
                                    aria-describedby="address-last-name-error"
                                />
                                <span v-if="errors.last_name" id="address-last-name-error" class="text-sm leading-6 text-rose-600">
                                    {{ errors.last_name }}
                                </span>
                            </div>
                            <div class="grid gap-2">
                                <label for="address-phone" class="text-sm font-medium text-slate-700">Phone</label>
                                <input
                                    id="address-phone"
                                    v-model="local.phone"
                                    type="tel"
                                    autocomplete="tel"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                    :class="errors.phone ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    :aria-invalid="Boolean(errors.phone)"
                                    aria-describedby="address-phone-error"
                                />
                                <span v-if="errors.phone" id="address-phone-error" class="text-sm leading-6 text-rose-600">{{ errors.phone }}</span>
                            </div>
                            <div class="grid gap-2">
                                <label for="address-company" class="text-sm font-medium text-slate-700">Company</label>
                                <input
                                    id="address-company"
                                    v-model="local.company"
                                    type="text"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                />
                            </div>
                        </div>

                        <div class="grid gap-2">
                            <label for="address-line-1" class="text-sm font-medium text-slate-700">Address line 1</label>
                            <input
                                id="address-line-1"
                                v-model="local.address_1"
                                type="text"
                                autocomplete="address-line1"
                                class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                :class="errors.address_1 ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                :aria-invalid="Boolean(errors.address_1)"
                                aria-describedby="address-line-1-error"
                            />
                            <span v-if="errors.address_1" id="address-line-1-error" class="text-sm leading-6 text-rose-600">
                                {{ errors.address_1 }}
                            </span>
                        </div>

                        <div class="grid gap-2">
                            <label for="address-line-2" class="text-sm font-medium text-slate-700">Address line 2</label>
                            <input
                                id="address-line-2"
                                v-model="local.address_2"
                                type="text"
                                autocomplete="address-line2"
                                class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                            />
                        </div>

                        <div class="grid gap-4 lg:grid-cols-3">
                            <div class="grid gap-2">
                                <label for="address-postal-code" class="text-sm font-medium text-slate-700">Postal code</label>
                                <input
                                    id="address-postal-code"
                                    v-model="local.postal_code"
                                    type="text"
                                    autocomplete="postal-code"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                    :class="errors.postal_code ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    :aria-invalid="Boolean(errors.postal_code)"
                                    aria-describedby="address-postal-code-error"
                                />
                                <span v-if="errors.postal_code" id="address-postal-code-error" class="text-sm leading-6 text-rose-600">
                                    {{ errors.postal_code }}
                                </span>
                            </div>
                            <div class="grid gap-2">
                                <label for="address-city" class="text-sm font-medium text-slate-700">City</label>
                                <input
                                    id="address-city"
                                    v-model="local.city"
                                    type="text"
                                    autocomplete="address-level2"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                    :class="errors.city ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    :aria-invalid="Boolean(errors.city)"
                                    aria-describedby="address-city-error"
                                />
                                <span v-if="errors.city" id="address-city-error" class="text-sm leading-6 text-rose-600">{{ errors.city }}</span>
                            </div>
                            <div class="grid gap-2">
                                <label for="address-province" class="text-sm font-medium text-slate-700">Province / State</label>
                                <input
                                    id="address-province"
                                    v-model="local.province"
                                    type="text"
                                    autocomplete="address-level1"
                                    class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                                    :class="errors.province ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                    :aria-invalid="Boolean(errors.province)"
                                    aria-describedby="address-province-error"
                                />
                                <span v-if="errors.province" id="address-province-error" class="text-sm leading-6 text-rose-600">
                                    {{ errors.province }}
                                </span>
                            </div>
                        </div>

                        <div class="grid gap-2">
                            <label for="address-country-code" class="text-sm font-medium text-slate-700">Country</label>
                            <BaseSelect
                                id="address-country-code"
                                v-model="countryCodeModel"
                                :options="countryOptions"
                                option-label-key="title"
                                class="min-h-12"
                                :class="errors.country_code ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''"
                                :aria-invalid="Boolean(errors.country_code)"
                                aria-describedby="address-country-code-error"
                            />
                            <span v-if="errors.country_code" id="address-country-code-error" class="text-sm leading-6 text-rose-600">
                                {{ errors.country_code }}
                            </span>
                            <p v-if="!regionCountries.length" class="text-sm leading-6 text-slate-500">
                                Loading available countries...
                            </p>
                        </div>

                        <div class="grid gap-2">
                            <label for="address-label" class="text-sm font-medium text-slate-700">Label (Home, Work, etc.)</label>
                            <input
                                id="address-label"
                                v-model="local.address_name"
                                type="text"
                                class="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 placeholder:text-slate-400 focus:border-amber-300 focus:ring-2 focus:ring-amber-200 focus:outline-hidden"
                            />
                        </div>

                        <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                class="inline-flex min-h-11 items-center justify-center rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-amber-200 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:outline-hidden motion-reduce:transition-none"
                                @click="close"
                            >
                                Cancel
                            </button>
                            <button type="submit" class="ui-btn-accent px-6 motion-reduce:transition-none">Save</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </Teleport>
</template>
