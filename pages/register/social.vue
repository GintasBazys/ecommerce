<script setup lang="ts">
import { useRuntimeConfig } from "#imports"
import { jwtDecode } from "jwt-decode"
import { useRouter, useRoute } from "vue-router"

const config = useRuntimeConfig()
const router = useRouter()
const route = useRoute()
const customerStore = useCustomerStore()

const email = ref<string>("")
const firstName = ref<string>("")
const lastName = ref<string>("")

const { customer } = storeToRefs(customerStore)

const sendCallback = async () => {
    const searchParams = new URLSearchParams(window.location.search)
    const queryParams = Object.fromEntries(searchParams.entries())

    try {
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

const createCustomer = async (token: string, email: string, first_name: string, last_name: string) => {
    try {
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

const refreshToken = async (token: string) => {
    try {
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
            const decodedToken = jwtDecode<CustomJwtPayload>(currentToken)
            const shouldCreateCustomer = !decodedToken.actor_id

            const authIdentityId = decodedToken.auth_identity_id

            if (!authIdentityId) {
                throw new Error("No auth_identity_id found in token")
            }

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

            alert(`Welcome, ${customer.value?.email}!`)
            router.push("/")
        } catch (decodeError) {
            console.error("Error decoding token:", decodeError)
            throw new Error("Invalid token format received from server")
        }
    } catch (error) {
        console.error("Authentication error:", error)
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
    <div class="flex min-h-screen items-center justify-center">
        <form class="w-full max-w-lg">
            <div class="mb-4">
                <label for="email"> Email </label>
                <input id="email" v-model="email" type="email" readonly />
            </div>
            <div class="mb-4">
                <label for="first_name"> First Name </label>
                <input id="first_name" v-model="firstName" type="text" />
            </div>
            <div class="mb-4">
                <label for="last_name"> Last Name </label>
                <input id="last_name" v-model="lastName" type="text" />
            </div>
        </form>
    </div>
</template>
