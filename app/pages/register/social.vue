<script setup lang="ts">
import { jwtDecode } from "jwt-decode"

import type { CustomJwtPayload } from "@/types/interfaces"
import type { CustomerDTO } from "@medusajs/types"

import { SOCIAL_AUTH_REDIRECT_KEY, SOCIAL_AUTH_PROVIDER_KEY } from "~/composables/useCustomerAuth"

type SocialProvider = "google" | "facebook"
type SocialStage = "authenticating" | "error" | "success"
type IdentityResponse = {
    authIdentity?: {
        user_metadata?: Record<string, unknown>
    }
}

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const customerStore = useCustomerStore()
const cartStore = useCartStore()

const medusaBaseUrl = String(config.public.MEDUSA_URL || "").replace(/\/+$/, "")
const loadingMessage = ref<string>("Initializing authentication...")
const errorMessage = ref<string>("")
const stage = ref<SocialStage>("authenticating")
const snackbar = ref<boolean>(false)
const snackbarText = ref<string>("")
const snackbarTone = ref<"success" | "error">("success")
const snackbarTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const isRetrying = ref<boolean>(false)

function getStoredProvider(): SocialProvider | null {
    if (import.meta.server) {
        return null
    }

    const value = sessionStorage.getItem(SOCIAL_AUTH_PROVIDER_KEY)?.toLowerCase()

    if (value === "google" || value === "facebook") {
        return value
    }

    return null
}

const provider = computed<SocialProvider | null>(() => {
    const queryValue = String(route.query.provider || "").toLowerCase()

    if (queryValue === "google" || queryValue === "facebook") {
        return queryValue
    }

    return getStoredProvider()
})

const providerLabel = computed<string>(() => {
    if (provider.value === "facebook") {
        return "Facebook"
    }

    return "Google"
})

const isLoading = computed<boolean>(() => stage.value === "authenticating")
const statusTitle = computed<string>(() => {
    if (isLoading.value) {
        return "Finishing the secure handoff."
    }

    if (stage.value === "error") {
        return "We could not complete sign-in."
    }

    return "Session ready."
})
const statusText = computed<string>(() => {
    if (isLoading.value) {
        return "Please keep this page open while we complete the social authentication flow."
    }

    if (stage.value === "error") {
        return errorMessage.value
    }

    return "You are signed in and will be redirected in a moment."
})

function getMedusaUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    return `${medusaBaseUrl}${normalizedPath}`
}

function showNotification(message: string, color: "success" | "error"): void {
    snackbarText.value = message
    snackbarTone.value = color
    snackbar.value = true

    if (snackbarTimer.value) {
        clearTimeout(snackbarTimer.value)
    }

    snackbarTimer.value = setTimeout(() => {
        snackbar.value = false
    }, 4500)
}

function toText(value: unknown): string | null {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function readPayloadMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") {
        return null
    }

    const data = payload as Record<string, unknown>
    return toText(data.message) || toText(data.statusMessage) || toText(data.error) || toText(data.error_description)
}

async function parseResponsePayload(response: Response): Promise<unknown> {
    try {
        return await response.json()
    } catch {
        return null
    }
}

function failAuth(message: string): void {
    stage.value = "error"
    loadingMessage.value = "Authentication failed"
    errorMessage.value = message
    showNotification(message, "error")
}

function getStoredRedirectPath(): string {
    if (import.meta.server) {
        return "/"
    }

    const value = sessionStorage.getItem(SOCIAL_AUTH_REDIRECT_KEY)
    if (typeof value === "string" && value.startsWith("/")) {
        return value
    }

    return "/"
}

function consumeStoredRedirectPath(): string {
    if (import.meta.server) {
        return "/"
    }

    const value = getStoredRedirectPath()
    sessionStorage.removeItem(SOCIAL_AUTH_REDIRECT_KEY)
    return value
}

async function sendCallback(activeProvider: SocialProvider): Promise<string> {
    const searchParams = new URLSearchParams(window.location.search)
    const callbackUrl = `${getMedusaUrl(`/auth/customer/${activeProvider}/callback`)}?${searchParams.toString()}`

    const response = await fetch(callbackUrl, {
        credentials: "include",
        method: "POST"
    })
    const payload = await parseResponsePayload(response)

    if (!response.ok) {
        throw new Error(readPayloadMessage(payload) || "Could not validate social authentication callback.")
    }

    const token = toText((payload as { token?: unknown })?.token)
    if (!token) {
        throw new Error("Authentication token was not returned by the callback endpoint.")
    }

    return token
}

function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.trim().split(/\s+/)
    return {
        firstName: parts.shift() || "",
        lastName: parts.join(" ")
    }
}

function mapIdentityToCustomerFields(metadata: Record<string, unknown>): {
    email: string
    firstName: string
    lastName: string
} {
    const email = toText(metadata.email) || ""
    const givenName = toText(metadata.given_name) || toText(metadata.first_name) || ""
    const familyName = toText(metadata.family_name) || toText(metadata.last_name) || ""

    if (givenName || familyName) {
        return { email, firstName: givenName, lastName: familyName }
    }

    const fullName = toText(metadata.name)
    if (!fullName) {
        return { email, firstName: "", lastName: "" }
    }

    const parsed = splitName(fullName)
    return {
        email,
        firstName: parsed.firstName,
        lastName: parsed.lastName
    }
}

async function createCustomer(token: string, metadata: Record<string, unknown>): Promise<void> {
    const customerFields = mapIdentityToCustomerFields(metadata)
    const response = await fetch(getMedusaUrl("/store/customers"), {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        },
        body: JSON.stringify({
            email: customerFields.email,
            first_name: customerFields.firstName,
            last_name: customerFields.lastName
        })
    })

    if (!response.ok) {
        const payload = await parseResponsePayload(response)
        throw new Error(readPayloadMessage(payload) || "Could not create customer profile.")
    }
}

async function refreshToken(token: string): Promise<string> {
    const response = await fetch(getMedusaUrl("/auth/token/refresh"), {
        credentials: "include",
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    const payload = await parseResponsePayload(response)

    if (!response.ok) {
        throw new Error(readPayloadMessage(payload) || "Could not refresh authentication token.")
    }

    const refreshedToken = toText((payload as { token?: unknown })?.token)
    if (!refreshedToken) {
        throw new Error("Token refresh succeeded but no token was returned.")
    }

    return refreshedToken
}

async function fetchIdentity(token: string, authIdentityId: string): Promise<Record<string, unknown>> {
    const response = await fetch(getMedusaUrl("/store/identity"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        },
        body: JSON.stringify({ auth_id: authIdentityId })
    })
    const payload = await parseResponsePayload(response)

    if (!response.ok) {
        throw new Error(readPayloadMessage(payload) || "Could not retrieve identity details.")
    }

    const identityPayload = payload as IdentityResponse
    return identityPayload.authIdentity?.user_metadata || {}
}

async function validateAndAuthenticate(): Promise<void> {
    if (!provider.value) {
        failAuth("The callback provider is missing or invalid. Please start sign-in again.")
        return
    }

    const oauthError = toText(route.query.error)
    if (oauthError) {
        const description = toText(route.query.error_description)
        failAuth(description || `Social sign-in returned an error: ${oauthError}.`)
        return
    }

    if (!toText(route.query.state)) {
        failAuth("The callback is missing required state information. Please try signing in again.")
        return
    }

    try {
        loadingMessage.value = "Contacting authentication server..."
        let token = await sendCallback(provider.value)

        loadingMessage.value = "Validating identity token..."
        const decodedToken = jwtDecode<CustomJwtPayload>(token)
        const shouldCreateCustomer = !decodedToken.actor_id
        const authIdentityId = toText(decodedToken.auth_identity_id)

        if (!authIdentityId) {
            throw new Error("The authentication token is missing identity details.")
        }

        if (shouldCreateCustomer) {
            loadingMessage.value = "Creating your customer profile..."
            const metadata = await fetchIdentity(token, authIdentityId)
            await createCustomer(token, metadata)
            token = await refreshToken(token)
        }

        loadingMessage.value = "Establishing secure session..."
        const sessionPayload = await $fetch<{ success: boolean; customer: CustomerDTO | null }>("/api/social/session", {
            method: "POST",
            credentials: "include",
            body: { token }
        })

        const customer = sessionPayload.customer
        if (!customer) {
            throw new Error("Authentication finished, but customer details were not returned.")
        }

        customerStore.customer = customer

        try {
            await assignCustomerToCart(cartStore)
        } catch (error: unknown) {
            console.error("Could not assign customer to cart", error)
        }

        stage.value = "success"
        loadingMessage.value = "Signed in successfully. Redirecting..."
        showNotification(`Welcome, ${customer.email}!`, "success")

        const destination = consumeStoredRedirectPath()
        await router.replace(destination)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Authentication failed due to an unknown error."
        failAuth(message)
    }
}

async function retrySocialLogin(): Promise<void> {
    if (!provider.value) {
        failAuth("Cannot retry because the provider is missing.")
        return
    }

    isRetrying.value = true

    try {
        const auth = useCustomerAuth()
        await auth.startSocialLogin(provider.value, getStoredRedirectPath())
    } finally {
        isRetrying.value = false
    }
}

useHead({
    title: "Social Sign-in | Ecommerce"
})

onMounted(() => {
    void validateAndAuthenticate()
})

onBeforeUnmount(() => {
    if (snackbarTimer.value) {
        clearTimeout(snackbarTimer.value)
    }
})
</script>

<template>
    <main class="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_42%,#fff7ed_100%)] text-slate-900">
        <section class="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-6xl items-center px-4 pb-14 pt-8 sm:px-6 lg:px-8">
            <div class="grid w-full items-start gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-8">
                <div class="space-y-6">
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-white/80 px-4 text-xs font-semibold uppercase tracking-[0.13em] text-slate-700"
                    >
                        Social sign-in
                    </span>
                    <h1 class="max-w-[13ch] text-4xl font-semibold leading-[0.95] tracking-[-0.03em] text-slate-950 sm:text-6xl">
                        We are finishing your {{ providerLabel }} authentication.
                    </h1>
                    <p class="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                        This step confirms the callback, starts your secure session, and returns you to the storefront.
                    </p>
                </div>

                <div class="rounded-panel border border-slate-200/95 bg-white/95 p-5 sm:p-7">
                    <span
                        class="inline-flex min-h-9 items-center rounded-full border border-slate-300/90 bg-slate-50 px-4 text-xs font-semibold uppercase tracking-label-tight text-slate-700"
                    >
                        Authentication status
                    </span>
                    <h2 class="mt-4 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-[2rem]">{{ statusTitle }}</h2>
                    <p class="mt-3 text-sm leading-7 text-slate-600">{{ statusText }}</p>

                    <div v-if="isLoading" class="mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5" aria-live="polite">
                        <div class="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuetext="Authenticating">
                            <div class="h-full w-3/5 rounded-full bg-slate-900/85 animate-pulse"></div>
                        </div>
                        <p class="mt-3 text-sm text-slate-600">{{ loadingMessage }}</p>
                    </div>

                    <div v-else-if="stage === 'error'" class="mt-6 grid gap-3">
                        <button
                            type="button"
                            class="inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-6 text-sm font-semibold text-white transition hover:bg-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-70"
                            :disabled="isRetrying"
                            @click="retrySocialLogin"
                        >
                            {{ isRetrying ? "Retrying..." : `Retry ${providerLabel} sign-in` }}
                        </button>
                        <NuxtLink
                            to="/signin"
                            class="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:text-slate-950 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-slate-300"
                        >
                            Back to sign in
                        </NuxtLink>
                    </div>
                </div>
            </div>
        </section>

        <div v-if="snackbar" class="pointer-events-none fixed inset-x-0 top-5 z-50 flex justify-center px-4">
            <p
                class="pointer-events-auto rounded-full border px-5 py-2 text-sm font-medium"
                :class="
                    snackbarTone === 'success'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-700'
                "
                role="status"
                aria-live="polite"
            >
                {{ snackbarText }}
            </p>
        </div>
    </main>
</template>
