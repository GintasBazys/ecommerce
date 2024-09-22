<script setup lang="ts">
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const handleReset = async (e: Event) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("resetEmail") as string

    try {
        errorMessage.value = null
        successMessage.value = null
        const { message } = await $fetch("/api/password-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })

        successMessage.value = message
    } catch (error: { data: { message: string } }) {
        if (error.data && error.data.message) {
            errorMessage.value = error.data.message
        } else {
            errorMessage.value = "An unexpected error occurred. Please try again."
        }
    }
    form.reset()
}
</script>
<template>
    <div
        id="forgotPasswordModal"
        class="modal fade"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-labelledby="staticBackdropLabel"
        style="display: none"
        aria-hidden="true"
    >
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content p-4">
                <div class="modal-header">
                    <NuxtImg
                        loading="lazy"
                        role="button"
                        src="/images/close_icon.svg"
                        width="20"
                        height="20"
                        alt="Close icon"
                        data-bs-dismiss="modal"
                        aria-hidden="true"
                    />
                </div>
                <h2 class="h4">Forgot password?</h2>
                <div class="panel panel-default">
                    <div class="panel-body">
                        <div>
                            <p class="p-0 m-0">If you have forgotten your password you can reset it here.</p>
                            <div class="panel-body password-form">
                                <form class="needs-validation" @submit="handleReset">
                                    <div class="form-group">
                                        <input
                                            class="form-control mt-3"
                                            placeholder="E-mail Address"
                                            type="email"
                                            required
                                            name="resetEmail"
                                        />
                                    </div>
                                    <button class="btn btn-primary w-100 mt-3" type="submit">Send password reset link</button>
                                </form>
                                <div class="invalid-feedback d-block">{{ errorMessage }}</div>
                                <div class="valid-feedback d-block">{{ successMessage }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
