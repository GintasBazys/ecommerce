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
        const url = `${config.public.MEDUSA_URL}/auth/customer/${provider.value}/callback?${new URLSearchParams(queryParams).toString()}`
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
        const response = await fetch(`${config.public.MEDUSA_URL}/store/customers`, {
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
        const response = await fetch(`${config.public.MEDUSA_URL}/auth/token/refresh`, {
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
            const identityResponse = await fetch(`${config.public.MEDUSA_URL}/store/identity`, {
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
            const sessionResponse = await fetch(`${config.public.MEDUSA_URL}/auth/session`, {
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
            const response = await fetch(`${config.public.MEDUSA_URL}/store/customers/me`, {
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
    <main class="socialAuthPage">
        <div class="socialAuthPage__hero">
            <VContainer class="socialAuthPage__container">
                <div class="socialAuthPage__grid">
                    <div class="socialAuthPage__copy">
                        <span class="socialAuthPage__eyebrow">Social sign-in</span>
                        <h1 class="socialAuthPage__title">We are connecting your account and preparing your session.</h1>
                        <p class="socialAuthPage__description">
                            This step confirms your {{ provider }} login, creates the customer profile if needed, and brings you back into
                            the shop.
                        </p>
                    </div>

                    <div class="socialAuthPage__panel">
                        <span class="socialAuthPage__sectionEyebrow">Authentication status</span>
                        <h2 class="socialAuthPage__sectionTitle">Finishing the secure handoff.</h2>
                        <p class="socialAuthPage__sectionText">
                            Please keep this page open for a moment while we complete the sign-in flow.
                        </p>

                        <div v-if="isLoading" class="socialAuthPage__loadingCard">
                            <div class="socialAuthPage__progressBar">
                                <div class="socialAuthPage__progress"></div>
                            </div>
                            <p class="socialAuthPage__loadingMessage">{{ loadingMessage }}</p>
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
.socialAuthPage {
    min-height: 100vh;
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.socialAuthPage__hero {
    min-height: 100vh;
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
    display: flex;
    align-items: center;
}

.socialAuthPage__container {
    position: relative;
    z-index: 1;
}

.socialAuthPage__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(19rem, 0.92fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: center;
}

.socialAuthPage__copy,
.socialAuthPage__panel {
    animation: social-rise 0.8s ease both;
}

.socialAuthPage__panel {
    animation-delay: 0.12s;
}

.socialAuthPage__eyebrow,
.socialAuthPage__sectionEyebrow {
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

.socialAuthPage__title,
.socialAuthPage__sectionTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.socialAuthPage__title {
    max-width: 12ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.socialAuthPage__description,
.socialAuthPage__sectionText,
.socialAuthPage__loadingMessage {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.socialAuthPage__panel,
.socialAuthPage__loadingCard {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.socialAuthPage__panel {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.socialAuthPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.socialAuthPage__sectionTitle {
    margin: 0 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.socialAuthPage__loadingCard {
    margin-top: 1.35rem;
    padding: 1.2rem;
}

.socialAuthPage__progressBar {
    width: 100%;
    height: 0.75rem;
    border-radius: 999px;
    overflow: hidden;
    background: rgba(8, 23, 63, 0.08);
}

.socialAuthPage__progress {
    width: 0;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #010c80 0%, #2f79ff 100%);
    animation: social-progress 2s infinite;
}

.socialAuthPage__loadingMessage {
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
    .socialAuthPage__grid {
        grid-template-columns: 1fr;
    }

    .socialAuthPage__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 700px) {
    .socialAuthPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .socialAuthPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .socialAuthPage__panel,
    .socialAuthPage__loadingCard {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .socialAuthPage__copy,
    .socialAuthPage__panel,
    .socialAuthPage__progress {
        animation: none;
    }
}
</style>
