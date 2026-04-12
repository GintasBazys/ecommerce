<script setup lang="ts">
import { jwtDecode } from "jwt-decode"
import { useRouter, useRoute } from "vue-router"

import type { CustomJwtPayload } from "@/types/interfaces"

definePageMeta({
    layout: "account"
})

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const medusaBaseUrl = String(config.public.MEDUSA_URL || "").replace(/\/+$/, "")

function getMedusaUrl(path: string): string {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    return `${medusaBaseUrl}${normalizedPath}`
}

const email = ref<string>("")
const firstName = ref<string>("")
const lastName = ref<string>("")

const { customer } = storeToRefs(useCustomerStore())

const isLoading = ref<boolean>(true)
const loadingMessage = ref<string>("Initializing...")
const snackbar = ref<boolean>(false)
const snackbarText = ref<string>("")
const snackbarColor = ref<string>("success")
const provider = computed(() => (route.query.provider as string) || "google")

function showNotification(message: string, color: "success" | "error"): void {
    snackbarText.value = message
    snackbarColor.value = color
    snackbar.value = true
}

async function sendCallback(): Promise<string | null> {
    const searchParams = new URLSearchParams(window.location.search)
    const queryParams = Object.fromEntries(searchParams.entries())

    try {
        loadingMessage.value = "Contacting authentication server..."
        const url = `${getMedusaUrl(`/auth/customer/${provider.value}/callback`)}?${new URLSearchParams(queryParams).toString()}`
        const response = await fetch(url, { credentials: "include", method: "POST" })

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.token) {
            console.error("No token received from server")
        }
        return data.token
    } catch (error) {
        console.error("Error during callback:", error)
        return null
    }
}

async function createCustomer(token: string, email: string, first_name: string, last_name: string): Promise<Response | null> {
    try {
        loadingMessage.value = "Creating customer account..."
        const response = await fetch(getMedusaUrl("/store/customers"), {
            credentials: "include",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({ email, first_name, last_name })
        })

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Error creating customer:", error)
        throw error
    }
}

async function refreshToken(token: string): Promise<string | null> {
    try {
        loadingMessage.value = "Refreshing session token..."
        const response = await fetch(getMedusaUrl("/auth/token/refresh"), {
            credentials: "include",
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}`)
            showNotification("Authentication failed: An unknown error occurred.", "error")
            await router.push("/signin")
        }

        const data = await response.json()
        if (!data.token) {
            console.error("No refresh token received")
        }
        return data.token
    } catch (error) {
        console.error("Error refreshing token:", error)
        return null
    }
}

const validateCallback = async () => {
    try {
        loadingMessage.value = "Validating callback..."
        const state = route.query.state as string

        if (!state) {
            console.error("No state found in query parameters.")
        }

        const token = await sendCallback()

        if (!token) {
            console.error("Failed to obtain token")
        }
        let currentToken = token

        try {
            if (!currentToken) {
                return
            }

            const decodedToken = jwtDecode<CustomJwtPayload>(currentToken)
            const shouldCreateCustomer = !decodedToken.actor_id
            const authIdentityId = decodedToken.auth_identity_id

            if (!authIdentityId) {
                console.error("No auth_identity_id found in token")
            }

            loadingMessage.value = "Retrieving identity information..."
            const identityResponse = await fetch(getMedusaUrl("/store/identity"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                },
                body: JSON.stringify({ auth_id: authIdentityId })
            })

            const { authIdentity } = await identityResponse.json()

            if (shouldCreateCustomer) {
                const meta = authIdentity.user_metadata || {}

                email.value = meta.email || ""

                const given = meta.given_name || meta.first_name
                const family = meta.family_name || meta.last_name
                if (given || family) {
                    firstName.value = given || ""
                    lastName.value = family || ""
                } else if (meta.name) {
                    const parts = String(meta.name).trim().split(/\s+/)
                    firstName.value = parts.shift() || ""
                    lastName.value = parts.join(" ")
                } else {
                    firstName.value = ""
                    lastName.value = ""
                }

                await createCustomer(currentToken, email.value, firstName.value, lastName.value)
                const newToken = await refreshToken(currentToken)
                if (!newToken) {
                    console.error("Failed to refresh token")
                }
                currentToken = newToken
            }

            loadingMessage.value = "Establishing session..."
            const sessionResponse = await fetch(getMedusaUrl("/auth/session"), {
                credentials: "include",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`
                }
            })

            if (!sessionResponse.ok) {
                console.error(`Failed to set session: ${sessionResponse.status}`)
            }

            loadingMessage.value = "Fetching customer details..."
            const response = await fetch(getMedusaUrl("/store/customers/me"), {
                credentials: "include",
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${currentToken}`,
                    "x-publishable-api-key": config.public.PUBLISHABLE_KEY
                }
            })

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`)
            }

            const { customer: customerData } = await response.json()
            customer.value = customerData

            isLoading.value = false
            useCustomerStore().customer = customerData

            await assignCustomerToCart(useCartStore())
            showNotification(`Welcome, ${customer.value?.email}!`, "success")
            await router.push("/")
        } catch (decodeError) {
            console.error("Error decoding token:", decodeError)
        }
    } catch (error) {
        console.error("Authentication error:", error)
        isLoading.value = false
        if (error instanceof Error) {
            showNotification(`Authentication failed: ${error.message}`, "error")
        } else {
            showNotification("Authentication failed: An unknown error occurred.", "error")
        }
        await router.push("/signin")
    }
}

onMounted(() => {
    validateCallback()
})
</script>

<template>
    <main class="social-auth-page">
        <div class="social-auth-page__hero">
            <VContainer class="social-auth-page__container">
                <div class="social-auth-page__grid">
                    <div class="social-auth-page__copy">
                        <span class="social-auth-page__eyebrow">Social sign-in</span>
                        <h1 class="social-auth-page__title">We are connecting your account and preparing your session.</h1>
                        <p class="social-auth-page__description">
                            This step confirms your {{ provider }} login, creates the customer profile if needed, and brings you back into
                            the shop.
                        </p>
                    </div>

                    <div class="social-auth-page__panel">
                        <span class="social-auth-page__section-eyebrow">Authentication status</span>
                        <h2 class="social-auth-page__section-title">Finishing the secure handoff.</h2>
                        <p class="social-auth-page__section-text">
                            Please keep this page open for a moment while we complete the sign-in flow.
                        </p>

                        <div v-if="isLoading" class="social-auth-page__loading-card">
                            <div class="social-auth-page__progress-bar">
                                <div class="social-auth-page__progress"></div>
                            </div>
                            <p class="social-auth-page__loading-message">{{ loadingMessage }}</p>
                        </div>
                    </div>
                </div>
            </VContainer>
        </div>

        <VSnackbar v-model="snackbar" :color="snackbarColor" location="top" timeout="4000">
            {{ snackbarText }}
        </VSnackbar>
    </main>
</template>

<style scoped lang="scss">
.social-auth-page {
    min-height: 100vh;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.social-auth-page__hero {
    min-height: 100vh;
    padding: 5.5rem 0 5rem;
    display: flex;
    align-items: center;
}

.social-auth-page__container {
    position: relative;
    z-index: 1;
}

.social-auth-page__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(19rem, 0.92fr);
    gap: 2rem;
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
    font-size: 4.5rem;
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
    padding: 1.9rem;
}

.social-auth-page__section-eyebrow {
    margin-bottom: 1rem;
}

.social-auth-page__section-title {
    margin: 0 0 0.75rem;
    font-size: 2.2rem;
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
    font-size: 1rem;
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
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .social-auth-page__grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .social-auth-page__title {
        max-width: 100%;
        font-size: 3.2rem;
    }

    .social-auth-page__panel {
        padding: 1.5rem;
    }

    .social-auth-page__section-title {
        font-size: 1.8rem;
    }
}

@media screen and (max-width: 700px) {
    .social-auth-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .social-auth-page__title {
        font-size: 2.4rem;
        line-height: 1;
    }

    .social-auth-page__panel,
    .social-auth-page__loading-card {
        border-radius: 1.2rem;
    }

    .social-auth-page__section-title {
        font-size: 1.6rem;
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
