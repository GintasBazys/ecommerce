<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const token = encodeURIComponent((route.query.token as string) || "")
const email = encodeURIComponent((route.query.email as string) || "")
const password = ref<string>("")
const errorMessage = ref<string>("")
const successMessage = ref<string>("")
const formRef = ref<string>()

async function handleSubmit(): Promise<void> {
    if (!password.value) {
        errorMessage.value = "Password is required"
        return
    }

    try {
        const res = await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/customer/emailpass/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                email,
                password: password.value
            })
        })

        if (!res.ok) {
            throw new Error("Failed to reset password")
        }

        const { success } = await res.json()

        if (success) {
            successMessage.value = "Password reset successfully!"
            setTimeout(() => router.push("/signin"), 1500)
        } else {
            errorMessage.value = "Couldn't reset password"
        }
    } catch (err) {
        console.error(err)
        errorMessage.value = "Error resetting password. Please try again."
    }
}
</script>

<template>
    <section class="py-10">
        <VContainer>
            <VRow justify="center">
                <VCol cols="12" sm="8" md="6" lg="4">
                    <h2 class="text-h5 mb-4 text-center">Reset Your Password</h2>
                    <VForm ref="formRef" @submit.prevent="handleSubmit">
                        <VTextField
                            v-model="password"
                            type="password"
                            label="New Password"
                            placeholder="Enter your new password"
                            required
                            variant="outlined"
                            class="mb-4"
                        />
                        <VBtn color="primary" type="submit" block>Reset Password</VBtn>
                    </VForm>
                    <div v-if="errorMessage" class="text-error mt-4">{{ errorMessage }}</div>
                    <div v-if="successMessage" class="text-success mt-4">{{ successMessage }}</div>
                </VCol>
            </VRow>
        </VContainer>
    </section>
</template>
