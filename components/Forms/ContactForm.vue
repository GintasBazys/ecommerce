<script setup lang="ts">
import { ref } from "vue"

const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loading = ref(false)

const handleSubmit = (e: Event): void => {
    e.preventDefault()
    loading.value = true
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    fetch("https://formsubmit.co/ajax/ea50e93bb59d60512a0ab63ded1f9169", {
        method: "POST",
        body: formData
    })
        .then((res) => res.json())
        .then((data) => {
            if (data?.success === "true") {
                successMessage.value = data.message
                errorMessage.value = null
                form.reset()
            } else {
                errorMessage.value = "Unexpected error. Try again later."
                successMessage.value = null
            }
        })
        .catch((err) => {
            errorMessage.value = err.message
            successMessage.value = null
        })
        .finally(() => {
            loading.value = false
        })
}

const getFormatedDate = () => {
    return new Date().toLocaleString("lt-LT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })
}
</script>

<template>
    <VForm @submit.prevent="handleSubmit">
        <VRow dense>
            <VCol cols="12">
                <VTextField label="Subject" name="subject" placeholder="Example: Customer service" variant="outlined" required />
            </VCol>

            <VCol cols="12" md="6">
                <VTextField label="Email" name="email" type="email" placeholder="name@example.com" variant="outlined" required />
            </VCol>

            <VCol cols="12" md="6">
                <VTextField label="Phone number" name="phone" type="tel" placeholder="+370" variant="outlined" />
            </VCol>

            <VCol cols="12">
                <VTextarea
                    label="Message"
                    name="message"
                    placeholder="How can we help? Include your order number if applicable."
                    variant="outlined"
                    rows="5"
                    auto-grow
                    required
                />
            </VCol>

            <input type="hidden" name="_subject" :value="getFormatedDate() + ' - New submission'" />

            <VCol cols="12" class="mt-2">
                <VBtn :loading="loading" :disabled="loading" type="submit" color="primary" block size="large"> Send Message </VBtn>
            </VCol>

            <VCol cols="12" class="mt-2">
                <VAlert v-if="errorMessage" type="error" border="start" variant="tonal" dense>
                    {{ errorMessage }}
                </VAlert>
                <VAlert v-if="successMessage" type="success" border="start" variant="tonal" dense>
                    {{ successMessage }}
                </VAlert>
            </VCol>
        </VRow>
    </VForm>
</template>
