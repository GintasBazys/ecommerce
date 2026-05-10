<script setup lang="ts">
import type { ContactFormErrors, ContactFormState } from "~/types/contact"

import BaseButton from "~/components/Shared/BaseButton.vue"
import { usePostHog } from "~/composables/analytics/usePostHog"
import { useSnackbar } from "~/composables/shared/useSnackbar"

const posthog = usePostHog()
const route = useRoute()
const router = useRouter()
const requestUrl = useRequestURL()
const { showSnackbar } = useSnackbar()
const formSubmitEndpoint = "https://formsubmit.co/ea50e93bb59d60512a0ab63ded1f9169"
const formSubmitSuccessRedirect = computed<string>(() => `${requestUrl.origin}/contact?contact=sent`)

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

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

function handleSubmit(event: Event): void {
    if (!validateForm()) {
        event.preventDefault()
        errorMessage.value = "Please correct the errors below."
        return
    }

    errorMessage.value = null
    posthog?.capture("contact_form_submitted", { has_subject: !!form.subject, has_order_number: !!form.orderNumber })
}

onMounted(() => {
    if (route.query.contact !== "sent") {
        return
    }

    successMessage.value = "Message sent successfully. We will get back to you soon."
    showSnackbar(successMessage.value, "success")

    const query = { ...route.query }
    delete query.contact
    void router.replace({ path: route.path, query })
})
</script>

<template>
    <form class="grid gap-5" :action="formSubmitEndpoint" method="POST" @submit="handleSubmit">
        <input type="hidden" name="_subject" value="New contact form submission" />
        <input type="hidden" name="_next" :value="formSubmitSuccessRedirect" />

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
                    :aria-invalid="!!formErrors.subject"
                    :aria-describedby="formErrors.subject ? 'contact-subject-error' : undefined"
                    required
                />
                <p v-if="formErrors.subject" id="contact-subject-error" class="mt-2 text-sm text-red-600">{{ formErrors.subject }}</p>
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
                    :aria-invalid="!!formErrors.email"
                    :aria-describedby="formErrors.email ? 'contact-email-error' : undefined"
                    required
                />
                <p v-if="formErrors.email" id="contact-email-error" class="mt-2 text-sm text-red-600">{{ formErrors.email }}</p>
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
                    :aria-invalid="!!formErrors.message"
                    :aria-describedby="formErrors.message ? 'contact-message-error' : undefined"
                    required
                ></textarea>
                <p v-if="formErrors.message" id="contact-message-error" class="mt-2 text-sm text-red-600">{{ formErrors.message }}</p>
            </div>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm leading-6 text-slate-600">By sending this form, you share contact details only for support follow-up.</p>
            <BaseButton type="submit" variant="primary" class="px-7">Send message</BaseButton>
        </div>

        <div v-if="errorMessage" class="rounded-card-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="rounded-card-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" aria-live="polite">
            {{ successMessage }}
        </div>
    </form>
</template>
