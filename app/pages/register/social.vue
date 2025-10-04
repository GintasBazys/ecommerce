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
const provider = computed(() => (route.query.provider as string) || "google")

async function sendCallback(): Promise<string | null> {
    const searchParams = new URLSearchParams(window.location.search)
    const queryParams = Object.fromEntries(searchParams.entries())

    try {
        loadingMessage.value = "Contacting authentication server..."
        const url = `${config.public.MEDUSA_URL}/auth/customer/${provider.value}/callback?${new URLSearchParams(queryParams).toString()}`
        const response = await fetch(url, { credentials: "include", method: "POST" })

        if (!response.ok) console.error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        if (!data.token) console.error("No token received from server")
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
            alert("Authentication failed: An unknown error occurred.")
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
                if (!newToken) console.error("Failed to refresh token")
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
            alert(`Welcome, ${customer.value?.email}!`)
            await router.push("/")
        } catch (decodeError) {
            console.error("Error decoding token:", decodeError)
        }
    } catch (error) {
        console.error("Authentication error:", error)
        isLoading.value = false
        if (error instanceof Error) {
            alert(`Authentication failed: ${error.message}`)
        } else {
            alert("Authentication failed: An unknown error occurred.")
        }
        await router.push("/signin")
    }
}

onMounted(() => {
    validateCallback()
})
</script>

<template>
    <main>
        <div v-if="isLoading" class="loading-overlay">
            <div class="loading-container">
                <div class="progress-bar">
                    <div class="progress"></div>
                </div>
                <p class="loading-message">{{ loadingMessage }}</p>
            </div>
        </div>
    </main>
</template>

<style scoped lang="scss">
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-container {
    text-align: center;
    max-width: 400px;
}

.progress-bar {
    width: 100%;
    height: 10px;
    background-color: #ddd;
    margin-bottom: 20px;
    border-radius: 5px;
    overflow: hidden;
}

.progress {
    width: 0;
    height: 100%;
    background-color: #010c80;
    animation: progressAnimation 2s infinite;
}

@keyframes progressAnimation {
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

.loading-message {
    font-size: 1.2em;
}
</style>
