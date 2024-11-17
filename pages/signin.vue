<script setup lang="ts">
import { useRouter } from "vue-router"
import { useCustomerStore } from "~/stores/customer"
import PasswordResetModal from "~/components/Modals/PasswordResetModal.vue"

useHead({
    title: "Signin | Ecommerce"
})

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()

const handleLogin = async (e: Event) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
        const { success, customer, message } = await $fetch<CustomerLoginResponseInterface>("/api/login", {
            method: "POST",
            body: { email, password }
        })

        if (!success) {
            alert(message || "Login failed")
        }
        customerStore.customer = customer

        await router.push("/")
    } catch (error) {
        alert("Login failed. Try again later")
        console.error("Error during login:", error)
    }
}

const handleSocialLogin = async () => {
    try {
        const result = await fetch(`/api/social/google`, {
            credentials: "include",
            method: "POST"
        }).then((res) => res.json())

        if (result.location) {
            window.location.href = result.location
            return
        }

        if (!result.token) {
            alert("Authentication failed")
            return
        }
    } catch (error) {
        console.error("Social login failed:", error)
        alert("An error occurred during social login")
    }
}
</script>

<template>
    <section class="spacer">
        <div class="row justify-content-center m-0">
            <div class="col-12">
                <div class="mx-auto" style="max-width: 24.625rem; width: 100%">
                    <h4 class="mb-4 mb-lg-5">Log in</h4>
                    <button class="external-login-link w-100 border-0 bg-transparent" @click="handleSocialLogin">
                        <div class="external-login-block-no-shop">
                            <NuxtImg src="/images/google_login_icon.svg" width="24" height="24" alt="Google login icon" loading="lazy" />
                            <p class="ps-3">Log in with Google</p>
                        </div>
                    </button>
                    <NuxtLink class="external-login-link" href="/facebook">
                        <div class="external-login-block-no-shop my-4">
                            <NuxtImg
                                src="/images/facebook_login_icon.svg"
                                width="24"
                                height="24"
                                alt="Facebook login icon"
                                loading="lazy"
                            />
                            <p class="ps-3">Log in with Facebook</p>
                        </div>
                    </NuxtLink>
                    <div class="signin-form">
                        <form id="loginForm" @submit="handleLogin">
                            <div class="form-group mb-3">
                                <input id="loginEmail" type="email" class="form-control" placeholder="E-mail" name="email" />
                            </div>

                            <div class="form-group mb-3">
                                <input type="password" class="form-control loginPassword" placeholder="Password" name="password" />
                            </div>
                            <a href="#" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">Forgot password?</a>
                            <button type="submit" class="btn btn-primary w-100 text-center mt-4">Log in</button>
                        </form>
                    </div>
                    <PasswordResetModal />
                    <p class="mb-0 mt-4 tag-14 text-lg-center text-left">
                        Don't have an account? Register <NuxtLink href="/register">here</NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
