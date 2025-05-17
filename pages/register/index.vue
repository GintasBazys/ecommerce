<script setup lang="ts">
import type { CustomerResponseInterface } from "@/types/interfaces"
import type { VForm } from "vuetify/components"

useHead({
    title: "Register | Ecommerce"
})

definePageMeta({
    layout: "account"
})

const router = useRouter()
const config = useRuntimeConfig()

const registerFormRef = ref<VForm | null>(null)

const firstName = ref<string>("")
const lastName = ref<string>("")
const email = ref<string>("")
const password = ref<string>("")

const requiredRule = (field: string) => (v: string) => !!v || `${field} is required`
const nameRules = [requiredRule("First name"), requiredRule("Last name")]
const emailRules = [requiredRule("E-mail"), (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid"]
const passwordRules = [
    (v: string) => !!v || "Password is required",
    (v: string) => (v && v.length >= 6) || "Password must be at least 6 characters"
]

async function handleRegister(): Promise<void> {
    const result = await registerFormRef.value?.validate()
    if (result && !result.valid) return

    try {
        const response = await $fetch<CustomerResponseInterface>("/api/account/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
                first_name: firstName.value,
                last_name: lastName.value
            })
        })
        useCustomerStore().customer = response.customer
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
                            <VTextField
                                v-model="firstName"
                                name="firstName"
                                label="First name"
                                :rules="[nameRules[0]]"
                                required
                                class="mb-3"
                                variant="outlined"
                            />
                            <VTextField
                                v-model="lastName"
                                name="lastName"
                                label="Last name"
                                :rules="[nameRules[1]]"
                                required
                                class="mb-3"
                                variant="outlined"
                            />
                            <VTextField
                                v-model="email"
                                name="email"
                                label="E-mail"
                                type="email"
                                :rules="emailRules"
                                required
                                class="mb-3"
                                variant="outlined"
                            />
                            <VTextField
                                v-model="password"
                                name="password"
                                label="Password"
                                type="password"
                                :rules="passwordRules"
                                required
                                class="mb-3"
                                variant="outlined"
                            />
                            <VBtn type="submit" color="primary" block>Register</VBtn>
                        </VForm>
                        <p class="mt-4 text-center">
                            Already have an account?
                            <NuxtLink to="/signin">Login here</NuxtLink>
                        </p>
                    </div>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
