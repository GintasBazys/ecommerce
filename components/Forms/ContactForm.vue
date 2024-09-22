<script setup lang="ts">
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
        .then((response) => response.json())
        .then((data) => {
            if (data?.success === "true") {
                successMessage.value = data?.message
                form.reset()
            } else {
                errorMessage.value = "Unexpected error. Try again later"
            }
        })
        .catch((error) => {
            errorMessage.value = error.message
        })
        .finally(() => {
            loading.value = false
        })
}
</script>

<template>
    <div>
        <form method="POST" enctype="multipart/form-data" @submit="handleSubmit">
            <div class="row">
                <div class="col-12">
                    <div class="form-group mb-3">
                        <label class="form-label" for="contactSubjectInput">Subject</label>
                        <input
                            id="contactSubjectInput"
                            required
                            name="subject"
                            type="text"
                            class="form-control"
                            placeholder="Example: customer service"
                        >
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="form-group mb-3">
                        <label class="form-label" for="contactEmailInput">Email</label>
                        <input
                            id="contactEmailInput"
                            required
                            name="email"
                            type="email"
                            class="form-control"
                            placeholder="name@example.com"
                        >
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="form-group mb-3">
                        <label class="form-label" for="contactPhoneInput">Phone number</label>
                        <input id="contactPhoneInput" name="phone" type="tel" class="form-control" placeholder="+370" >
                    </div>
                </div>
                <div class="col-12">
                    <div class="form-group mb-3">
                        <label class="form-label" for="contactMessageInput">Message</label>
                        <textarea
                            id="contactMessageInput"
                            class="form-control"
                            name="message"
                            placeholder="How we can help? Your order number?"
                            required
                            style="height: 5.5rem"
                        />
                    </div>
                </div>
            </div>
            <button :disabled="loading" type="submit" class="btn btn-primary w-100 py-2 text-uppercase">
                <template v-if="loading">
                    <div class="spinner-border white" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </template>
                <template v-else> Send message </template>
            </button>
        </form>
        <div class="invalid-feedback d-block">{{ errorMessage }}</div>
        <div class="valid-feedback d-block">{{ successMessage }}</div>
    </div>
</template>
