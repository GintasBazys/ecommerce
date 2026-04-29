<script setup lang="ts">
import { usePostHog } from "~/composables/usePostHog"

type ContactFormState = {
    subject: string
    email: string
    phone: string
    orderNumber: string
    message: string
}

type ContactFormErrors = {
    subject: string
    email: string
    message: string
}

const FORMSUBMIT_ENDPOINT = "https://formsubmit.co/ea50e93bb59d60512a0ab63ded1f9169"

const posthog = usePostHog()
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const siteUrl = computed(() => String(runtimeConfig.public.SITE_URL || "").replace(/\/$/, ""))
const nextUrl = computed(() => {
    if (siteUrl.value) {
        return `${siteUrl.value}/contact?submitted=true`
    }

    if (import.meta.client) {
        return `${window.location.origin}/contact?submitted=true`
    }

    return "https://medusa-commerce.de/contact?submitted=true"
})

const errorMessage = ref<string | null>(null)
const successMessage = computed(() => (route.query.submitted === "true" ? "Message sent successfully." : null))

const form = reactive<ContactFormState>({
    subject: "",
    email: "",
    phone: "",
    orderNumber: "",
    message: ""
})

const formErrors = ref<ContactFormErrors>({
    subject: "",
    email: "",
    message: ""
})

function validateForm(): boolean {
    let isValid = true
    formErrors.value = { subject: "", email: "", message: "" }

    if (!form.subject.trim()) {
        formErrors.value.subject = "Subject is required."
        isValid = false
    }

    if (!form.email.trim()) {
        formErrors.value.email = "Email is required."
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        formErrors.value.email = "Please enter a valid email."
        isValid = false
    }

    if (!form.message.trim()) {
        formErrors.value.message = "Message is required."
        isValid = false
    }

    return isValid
}

function handleSubmit(event: SubmitEvent): void {
    if (!validateForm()) {
        event.preventDefault()
        errorMessage.value = "Please correct the errors below."
        return
    }

    errorMessage.value = null
    posthog?.capture("contact_form_submitted", { subject: form.subject, has_order_number: !!form.orderNumber })
}
</script>

<template>
    <form class="grid gap-5" :action="FORMSUBMIT_ENDPOINT" method="POST" @submit="handleSubmit">
        <input type="hidden" name="_subject" value="New contact form submission" />
        <input type="hidden" name="_next" :value="nextUrl" />

        <div class="grid gap-5 md:grid-cols-2">
            <div class="md:col-span-2">
                <label for="contact-subject" class="mb-2 block text-sm font-semibold text-slate-900">Subject</label>
                <input
                    id="contact-subject"
                    v-model="form.subject"
                    name="subject"
                    type="text"
                    placeholder="Example: Order update"
                    class="focus:border-brand-500 focus:ring-brand-100 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:ring-2"
                    :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': !!formErrors.subject }"
                    required
                />
                <p v-if="formErrors.subject" class="mt-2 text-sm text-red-600">{{ formErrors.subject }}</p>
            </div>

            <div>
                <label for="contact-email" class="mb-2 block text-sm font-semibold text-slate-900">Email</label>
                <input
                    id="contact-email"
                    v-model="form.email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    class="focus:border-brand-500 focus:ring-brand-100 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:ring-2"
                    :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': !!formErrors.email }"
                    required
                />
                <p v-if="formErrors.email" class="mt-2 text-sm text-red-600">{{ formErrors.email }}</p>
            </div>

            <div>
                <label for="contact-phone" class="mb-2 block text-sm font-semibold text-slate-900">Phone number</label>
                <input
                    id="contact-phone"
                    v-model="form.phone"
                    name="phone"
                    type="tel"
                    placeholder="+370"
                    class="focus:border-brand-500 focus:ring-brand-100 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:ring-2"
                />
            </div>

            <div class="md:col-span-2">
                <label for="contact-order-number" class="mb-2 block text-sm font-semibold text-slate-900">Order number</label>
                <input
                    id="contact-order-number"
                    v-model="form.orderNumber"
                    name="orderNumber"
                    type="text"
                    placeholder="Optional"
                    class="focus:border-brand-500 focus:ring-brand-100 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:ring-2"
                />
            </div>

            <div class="md:col-span-2">
                <label for="contact-message" class="mb-2 block text-sm font-semibold text-slate-900">Message</label>
                <textarea
                    id="contact-message"
                    v-model="form.message"
                    name="message"
                    rows="6"
                    placeholder="How can we help? Include any useful order or product details."
                    class="focus:border-brand-500 focus:ring-brand-100 w-full rounded-card-sm border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-500 focus:ring-2"
                    :class="{ 'border-red-300 focus:border-red-400 focus:ring-red-100': !!formErrors.message }"
                    required
                ></textarea>
                <p v-if="formErrors.message" class="mt-2 text-sm text-red-600">{{ formErrors.message }}</p>
            </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm leading-6 text-slate-600">By sending this form, you share contact details only for support follow-up.</p>
            <button type="submit" class="ui-btn-primary px-7">Send message</button>
        </div>

        <div v-if="errorMessage" class="rounded-card-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="rounded-card-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ successMessage }}
        </div>
    </form>
</template>
