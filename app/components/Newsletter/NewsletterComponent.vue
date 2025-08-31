<script setup lang="ts">
import type { FetchError } from "ofetch"

const errorMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

async function handleSubscribe(e: Event): Promise<void> {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email")

    try {
        loading.value = true
        const response = await $fetch("/api/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        if (response.success) {
            alert(response.message)
            form.reset()
        }
    } catch (error: unknown) {
        const err = error as FetchError
        errorMessage.value = err.statusMessage || err.message || "An unknown error occurred"
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <section class="py-12 border-t">
        <VContainer max-width="900">
            <div class="text-center mb-8">
                <h2 class="text-h4 font-weight-bold mb-2">Subscribe to our Newsletter</h2>
                <p class="text-body-1 text-medium-emphasis">
                    Get the latest updates, articles, and exclusive content straight to your inbox.
                </p>
            </div>

            <VForm @submit="handleSubscribe">
                <VRow class="d-flex align-center" no-gutters>
                    <VCol cols="12" sm="8">
                        <VTextField
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            required
                            variant="solo-filled"
                            hide-details="auto"
                            density="comfortable"
                            class="rounded-l"
                            :error-messages="errorMessage ? [errorMessage] : []"
                            @input="errorMessage = null"
                        />
                    </VCol>

                    <VCol cols="12" sm="4" class="mt-2 mt-sm-0">
                        <VBtn type="submit" color="primary" :loading="loading" size="large" class="rounded-r" block> Subscribe </VBtn>
                    </VCol>
                </VRow>
            </VForm>
        </VContainer>
    </section>
</template>
