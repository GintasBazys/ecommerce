<script setup lang="ts">
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const loading = ref<boolean>(false)

function handleSubmit(e: Event): void {
    e.preventDefault()
    loading.value = true
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    if (!validateForm(formData)) {
        errorMessage.value = "Please correct the errors below."
        successMessage.value = null
        loading.value = false
        return
    }

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

function getFormatedDate(): string {
    return new Date().toLocaleString("lt-LT", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    })
}

const formErrors = ref<{ subject: string; email: string; message: string }>({
    subject: "",
    email: "",
    message: ""
})

function validateForm(formData: FormData): boolean {
    let isValid = true
    formErrors.value = { subject: "", email: "", message: "" }

    const subject = formData.get("subject")?.toString().trim() || ""
    const email = formData.get("email")?.toString().trim() || ""
    const message = formData.get("message")?.toString().trim() || ""

    if (!subject) {
        formErrors.value.subject = "Subject is required."
        isValid = false
    }

    if (!email) {
        formErrors.value.email = "Email is required."
        isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        formErrors.value.email = "Please enter a valid email."
        isValid = false
    }

    if (!message) {
        formErrors.value.message = "Message is required."
        isValid = false
    }

    return isValid
}
</script>

<template>
  <VForm @submit.prevent="handleSubmit">
    <VRow dense>
      <VCol cols="12">
        <VTextField
          label="Subject"
          name="subject"
          placeholder="Example: Customer service"
          variant="outlined"
          required
          :error="!!formErrors.subject"
          :error-messages="formErrors.subject"
        />
      </VCol>

      <VCol cols="12" md="6">
        <VTextField
          label="Email"
          name="email"
          type="email"
          placeholder="name@example.com"
          variant="outlined"
          required
          :error="!!formErrors.email"
          :error-messages="formErrors.email"
        />
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
          :error="!!formErrors.message"
          :error-messages="formErrors.message"
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
