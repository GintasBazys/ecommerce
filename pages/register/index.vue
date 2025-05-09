<script setup lang="ts">
import type { CustomerResponseInterface } from "~/types/interfaces"

useHead({
    title: "Register | Ecommerce"
})

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()
const config = useRuntimeConfig()

const handleRegister = async (e: Event) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email")
    const password = formData.get("password")
    const first_name = formData.get("firstName")
    const last_name = formData.get("lastName")

    try {
        const response = await $fetch<CustomerResponseInterface>("/api/account/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({ email, password, first_name, last_name })
        })
        customerStore.customer = response.customer

        await router.push("/")
    } catch (error) {
        console.error("Register failed:", error)
        alert("Register failed. Please check your credentials or try again later.")
    }
}
</script>

<template>
    <section class="py-10">
        <VContainer>
            <VRow justify="center">
                <VCol cols="12" md="6">
                    <div class="form-wrapper mx-auto">
                        <h4 class="mb-4">Register</h4>
                        <VForm ref="registerFormRef" @submit.prevent="handleRegister">
                            <VTextField name="firstName" label="First name" required class="mb-3" variant="outlined" />
                            <VTextField name="lastName" label="Last name" required class="mb-3" variant="outlined" />
                            <VTextField name="email" label="E-mail" type="email" required class="mb-3" variant="outlined" />
                            <VTextField name="password" label="Password" type="password" required class="mb-3" variant="outlined" />
                            <VBtn type="submit" color="primary" block> Register </VBtn>
                        </VForm>
                        <p class="mt-4 text-center">Already have an account? <NuxtLink to="/signin">Login here</NuxtLink></p>
                    </div>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
