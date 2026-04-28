<script setup lang="ts">
import { formatDateTime } from "@/utils/formatDate"
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

type ContactResponse = {
    success: boolean
    message: string
}

const posthog = usePostHog()
const runtimeConfig = useRuntimeConfig()
const turnstileSiteKey = computed(() => String(runtimeConfig.public.TURNSTILE_SITE_KEY || ""))
const widgetContainer = ref<HTMLElement | null>(null)
const widgetId = ref<string | null>(null)
const turnstileToken = ref<string>("")

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loading = ref<boolean>(false)
const formSubject = useState<string>("contact-form-subject", () => "New submission")

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

useHead(() => {
    if (!turnstileSiteKey.value) {
        return {}
    }

    return {
        link: [{ rel: "preconnect", href: "https://challenges.cloudflare.com" }],
        script: [
            {
                src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileContactLoad",
                defer: true
            }
        ]
    }
})

function resetTurnstile(): void {
    turnstileToken.value = ""

    if (import.meta.client && widgetId.value && window.turnstile) {
        window.turnstile.reset(widgetId.value)
    }
}

function renderTurnstile(): void {
    if (!import.meta.client || !turnstileSiteKey.value || !widgetContainer.value || !window.turnstile) {
        return
    }

    if (widgetId.value) {
        window.turnstile.remove(widgetId.value)
        widgetId.value = null
    }

    widgetId.value = window.turnstile.render(widgetContainer.value, {
        sitekey: turnstileSiteKey.value,
        action: "contact",
        theme: "light",
        size: widgetContainer.value.clientWidth < 300 ? "compact" : "flexible",
        callback: (token) => {
            turnstileToken.value = token
            errorMessage.value = null
        },
        "error-callback": () => {
            turnstileToken.value = ""
            errorMessage.value = "Verification failed. Please try again."
        },
        "expired-callback": () => {
            turnstileToken.value = ""
            errorMessage.value = "Verification expired. Please try again."
        }
    })
}

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

function resetForm(): void {
    form.subject = ""
    form.email = ""
    form.phone = ""
    form.orderNumber = ""
    form.message = ""
    formErrors.value = { subject: "", email: "", message: "" }
}

function getErrorMessage(error: unknown): string {
    if (error && typeof error === "object") {
        const data = "data" in error ? error.data : undefined

        if (data && typeof data === "object" && "statusMessage" in data && typeof data.statusMessage === "string") {
            if (data.statusMessage === "Verification failed") {
                return "Verification failed. Please try again."
            }

            return data.statusMessage
        }
    }

    return "Unexpected error. Try again later."
}

async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
        errorMessage.value = "Please correct the errors below."
        successMessage.value = null
        return
    }

    if (!turnstileSiteKey.value) {
        errorMessage.value = "Verification is currently unavailable. Please try again later."
        successMessage.value = null
        return
    }

    if (!turnstileToken.value) {
        errorMessage.value = "Complete the verification before sending your message."
        successMessage.value = null
        return
    }

    loading.value = true

    try {
        const response = await $fetch<ContactResponse>("/api/contact", {
            method: "POST",
            body: {
                ...form,
                submissionSubject: formSubject.value,
                turnstileToken: turnstileToken.value
            }
        })

        successMessage.value = response.message
        errorMessage.value = null
        posthog?.capture("contact_form_submitted", { subject: form.subject, has_order_number: !!form.orderNumber })
        resetForm()
        resetTurnstile()
    } catch (error: unknown) {
        errorMessage.value = getErrorMessage(error)
        successMessage.value = null
        resetTurnstile()
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    formSubject.value = `${formatDateTime(new Date())} - New submission`

    if (!import.meta.client) {
        return
    }

    window.onTurnstileContactLoad = () => {
        renderTurnstile()
    }

    if (window.turnstile) {
        renderTurnstile()
    }
})

onUnmounted(() => {
    if (!import.meta.client) {
        return
    }

    if (widgetId.value && window.turnstile) {
        window.turnstile.remove(widgetId.value)
    }

    if (window.onTurnstileContactLoad) {
        delete window.onTurnstileContactLoad
    }
})
</script>

<template>
    <form class="grid gap-5" @submit.prevent="handleSubmit">
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

        <div class="rounded-card-sm border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
            <div ref="widgetContainer" class="flex min-h-17 max-w-full justify-center overflow-hidden"></div>
            <p class="mt-3 text-sm leading-6 text-slate-600">Spam protection is required before sending this form.</p>
        </div>

        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm leading-6 text-slate-600">By sending this form, you share contact details only for support follow-up.</p>
            <button type="submit" class="ui-btn-primary px-7" :disabled="loading">
                {{ loading ? "Sending..." : "Send message" }}
            </button>
        </div>

        <div v-if="errorMessage" class="rounded-card-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="rounded-card-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {{ successMessage }}
        </div>
    </form>
</template>
