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

async function sendCallback(): Promise<string | null> {
    const searchParams = new URLSearchParams(window.location.search)
    const queryParams = Object.fromEntries(searchParams.entries())

    try {
        loadingMessage.value = "Contacting authentication server..."
        const response = await fetch(
            `${config.public.MEDUSA_URL}/auth/customer/google/callback?${new URLSearchParams(queryParams).toString()}`,
            {
                credentials: "include",
                method: "POST"
            }
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (!data.token) {
            throw new Error("No token received from server")
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
            throw new Error(`HTTP error! status: ${response.status}`)
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
            router.push("/signin")
        }

        const data = await response.json()
        if (!data.token) {
            throw new Error("No refresh token received")
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
            throw new Error("No state found in query parameters.")
        }

        const token = await sendCallback()

        if (!token) {
            throw new Error("Failed to obtain token")
        }
        let currentToken = token

        try {
            const decodedToken = jwtDecode<CustomJwtPayload>(currentToken) // Replace 'any' with your CustomJwtPayload interface if available
            const shouldCreateCustomer = !decodedToken.actor_id
            const authIdentityId = decodedToken.auth_identity_id

            if (!authIdentityId) {
                throw new Error("No auth_identity_id found in token")
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
                email.value = authIdentity.user_metadata?.email
                firstName.value = authIdentity.user_metadata?.given_name || ""
                lastName.value = authIdentity.user_metadata?.family_name || ""

                await createCustomer(currentToken, email.value, firstName.value, lastName.value)
                const newToken = await refreshToken(currentToken)
                if (!newToken) {
                    throw new Error("Failed to refresh token")
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
                throw new Error(`Failed to set session: ${sessionResponse.status}`)
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
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const { customer: customerData } = await response.json()
            customer.value = customerData

            isLoading.value = false
            useCustomerStore().customer = customerData

            await assignCustomerToCart(useCartStore())
            alert(`Welcome, ${customer.value?.email}!`)
            router.push("/")
        } catch (decodeError) {
            console.error("Error decoding token:", decodeError)
            throw new Error("Invalid token format received from server")
        }
    } catch (error) {
        console.error("Authentication error:", error)
        isLoading.value = false
        if (error instanceof Error) {
            alert(`Authentication failed: ${error.message}`)
        } else {
            alert("Authentication failed: An unknown error occurred.")
        }
        router.push("/signin")
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
        width: 0%;
    }
    50% {
        width: 100%;
    }
    100% {
        width: 0%;
    }
}

.loading-message {
    font-size: 1.2em;
}
</style>
