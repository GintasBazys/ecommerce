<script setup lang="ts">
import { jwtDecode } from "jwt-decode"

import type { CustomJwtPayload } from "@/types/interfaces"
import type { CustomerDTO } from "@medusajs/types"

import { SOCIAL_AUTH_REDIRECT_KEY } from "~/composables/useCustomerAuth"

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
const snackbarColor = ref<string>("success")
const isRetrying = ref<boolean>(false)

const provider = computed<SocialProvider | null>(() => {
    const value = String(route.query.provider || "").toLowerCase()

    if (value === "google" || value === "facebook") {
        return value
    }

    return null
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
    snackbarColor.value = color
    snackbar.value = true
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

async function establishSession(token: string): Promise<void> {
    const response = await fetch(getMedusaUrl("/auth/session"), {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        const payload = await parseResponsePayload(response)
        throw new Error(readPayloadMessage(payload) || "Could not establish authenticated session.")
    }
}

async function fetchCustomer(token: string): Promise<CustomerDTO> {
    const response = await fetch(getMedusaUrl("/store/customers/me"), {
        credentials: "include",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "x-publishable-api-key": config.public.PUBLISHABLE_KEY
        }
    })
    const payload = await parseResponsePayload(response)

    if (!response.ok) {
        throw new Error(readPayloadMessage(payload) || "Could not fetch your customer profile.")
    }

    const customerData = (payload as { customer?: CustomerDTO }).customer
    if (!customerData) {
        throw new Error("Authentication finished, but customer details were not returned.")
    }

    return customerData
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
        await establishSession(token)

        loadingMessage.value = "Fetching account details..."
        const customer = await fetchCustomer(token)
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
</script>

<template>
    <section class="social-auth-page">
        <div class="social-auth-page__hero">
            <VContainer class="social-auth-page__container">
                <div class="social-auth-page__grid">
                    <div class="social-auth-page__copy">
                        <span class="social-auth-page__eyebrow">Social sign-in</span>
                        <h1 class="social-auth-page__title">We are finishing your {{ providerLabel }} authentication.</h1>
                        <p class="social-auth-page__description">
                            This step confirms the callback, starts your secure session, and returns you to the storefront.
                        </p>
                    </div>

                    <div class="social-auth-page__panel">
                        <span class="social-auth-page__section-eyebrow">Authentication status</span>
                        <h2 class="social-auth-page__section-title">{{ statusTitle }}</h2>
                        <p class="social-auth-page__section-text">{{ statusText }}</p>

                        <div v-if="isLoading" class="social-auth-page__loading-card" aria-live="polite">
                            <div class="social-auth-page__progress-bar" role="progressbar" aria-valuetext="Authenticating">
                                <div class="social-auth-page__progress"></div>
                            </div>
                            <p class="social-auth-page__loading-message">{{ loadingMessage }}</p>
                        </div>

                        <div v-else-if="stage === 'error'" class="social-auth-page__error-actions">
                            <VBtn
                                color="primary"
                                rounded="pill"
                                size="large"
                                class="text-none"
                                :loading="isRetrying"
                                @click="retrySocialLogin"
                            >
                                Retry {{ providerLabel }} sign-in
                            </VBtn>
                            <VBtn color="primary" variant="outlined" rounded="pill" size="large" class="text-none" to="/signin">
                                Back to sign in
                            </VBtn>
                        </div>
                    </div>
                </div>
            </VContainer>
        </div>

        <VSnackbar v-model="snackbar" :color="snackbarColor" location="top" timeout="4500">
            {{ snackbarText }}
        </VSnackbar>
    </section>
</template>

<style scoped lang="scss">
.social-auth-page {
    min-height: calc(100vh - 98px);
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.social-auth-page__hero {
    min-height: calc(100vh - 98px);
    padding: 4.8rem 0 4rem;
    display: flex;
    align-items: center;
}

.social-auth-page__container {
    position: relative;
    z-index: 1;
}

.social-auth-page__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(18rem, 0.92fr);
    gap: 1.5rem;
    align-items: center;
}

.social-auth-page__copy,
.social-auth-page__panel {
    animation: social-rise 0.8s ease both;
}

.social-auth-page__panel {
    animation-delay: 0.12s;
}

.social-auth-page__eyebrow,
.social-auth-page__section-eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.social-auth-page__title,
.social-auth-page__section-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.social-auth-page__title {
    max-width: 12ch;
    margin: 1rem 0;
    font-size: 2.85rem;
    line-height: 0.95;
}

.social-auth-page__description,
.social-auth-page__section-text,
.social-auth-page__loading-message {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.social-auth-page__panel,
.social-auth-page__loading-card {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.social-auth-page__panel {
    padding: 1.4rem;
}

.social-auth-page__section-eyebrow {
    margin-bottom: 1rem;
}

.social-auth-page__section-title {
    margin: 0 0 0.75rem;
    font-size: 1.8rem;
    line-height: 1.08;
}

.social-auth-page__loading-card {
    margin-top: 1.35rem;
    padding: 1.2rem;
}

.social-auth-page__progress-bar {
    width: 100%;
    height: 0.75rem;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(8, 23, 63, 0.08);
}

.social-auth-page__progress {
    width: 0;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #010c80 0%, #2f79ff 100%);
    animation: social-progress 2s infinite;
}

.social-auth-page__loading-message {
    margin-top: 1rem;
    font-size: 0.98rem;
}

.social-auth-page__error-actions {
    display: grid;
    gap: 0.75rem;
    margin-top: 1.2rem;
}

@keyframes social-progress {
    0% {
        width: 0;
    }

    50% {
        width: 100%;
    }

    100% {
        width: 0;
    }
}

@keyframes social-rise {
    from {
        opacity: 0;
        transform: translateY(24px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .social-auth-page__hero {
        min-height: auto;
        padding-top: 4.2rem;
    }

    .social-auth-page__grid {
        grid-template-columns: 1fr;
        gap: 1.25rem;
    }

    .social-auth-page__title {
        max-width: 100%;
        font-size: 2.45rem;
    }
}

@media screen and (max-width: 700px) {
    .social-auth-page {
        min-height: auto;
    }

    .social-auth-page__hero {
        padding: 3.75rem 0 3rem;
    }

    .social-auth-page__title {
        font-size: 2rem;
        line-height: 1;
    }

    .social-auth-page__panel,
    .social-auth-page__loading-card {
        border-radius: 1.2rem;
    }

    .social-auth-page__section-title {
        font-size: 1.45rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .social-auth-page__copy,
    .social-auth-page__panel,
    .social-auth-page__progress {
        animation: none;
    }
}
</style>
