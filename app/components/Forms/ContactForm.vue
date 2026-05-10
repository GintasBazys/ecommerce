<script setup lang="ts">
import type { ContactFormErrors, ContactFormState } from "~/types/contact"
import type { TurnstileWidgetInstance } from "~/types/forms"

import TurnstileWidget from "~/components/Forms/TurnstileWidget.vue"
import BaseButton from "~/components/Shared/BaseButton.vue"
import { usePostHog } from "~/composables/usePostHog"

const posthog = usePostHog()
const runtimeConfig = useRuntimeConfig()
const turnstileSiteKey = computed<string>(() => String(runtimeConfig.public.TURNSTILE_SITE_KEY || ""))

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isSubmitting = ref<boolean>(false)
const turnstileToken = ref<string>("")
const turnstileResetKey = ref<number>(0)
const turnstileWidget = ref<TurnstileWidgetInstance | null>(null)

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

function resetTurnstile(): void {
    turnstileToken.value = ""
    turnstileResetKey.value += 1
}

function handleTurnstileError(message: string): void {
    turnstileToken.value = ""
    errorMessage.value = message
}

async function handleSubmit(): Promise<void> {
    if (!validateForm()) {
        errorMessage.value = "Please correct the errors below."
        return
    }

    if (!turnstileSiteKey.value) {
        errorMessage.value = "Security verification is not configured. Please contact support by email."
        return
    }

    errorMessage.value = null
    successMessage.value = null
    isSubmitting.value = true

    try {
        const token = turnstileToken.value || await turnstileWidget.value?.execute()

        if (!token) {
            throw new Error("Security verification is required.")
        }

        await $fetch("/api/contact", {
            method: "POST",
            body: {
                ...form,
                turnstileToken: token
            }
        })

        posthog?.capture("contact_form_submitted", { has_subject: !!form.subject, has_order_number: !!form.orderNumber })
        form.subject = ""
        form.email = ""
        form.phone = ""
        form.orderNumber = ""
        form.message = ""
        successMessage.value = "Message sent successfully."
        resetTurnstile()
    } catch (error) {
        console.error("Contact form submission failed", error)
        errorMessage.value = error instanceof Error ? error.message : "Could not send your message. Please try again."
        resetTurnstile()
    } finally {
        isSubmitting.value = false
    }
}
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
            <BaseButton type="submit" variant="primary" class="px-7" :disabled="isSubmitting">
                {{ isSubmitting ? "Sending..." : "Send message" }}
            </BaseButton>
        </div>

        <TurnstileWidget
            v-if="turnstileSiteKey"
            ref="turnstileWidget"
            v-model="turnstileToken"
            :site-key="turnstileSiteKey"
            action="contact"
            appearance="execute"
            execution="execute"
            :reset-key="turnstileResetKey"
            @error="handleTurnstileError"
            @expired="handleTurnstileError"
        />

        <div v-if="errorMessage" class="rounded-card-sm border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="rounded-card-sm border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700" aria-live="polite">
            {{ successMessage }}
        </div>
    </form>
</template>
