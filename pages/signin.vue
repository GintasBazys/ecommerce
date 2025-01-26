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
const cartStore = useCartStore()
const runtimeConfig = useRuntimeConfig()

const handleLogin = async (e: Event) => {
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    e.preventDefault()
    const { token } = await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/customer/emailpass`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    }).then((res) => res.json())

    await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/session`, {
        credentials: "include",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    }).then((res) => res.json())

    const { customer } = await fetch(`${runtimeConfig.public.MEDUSA_URL}/store/customers/me`, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": runtimeConfig.public.PUBLISHABLE_KEY
        }
    }).then((res) => res.json())

    if (!customer) {
        alert("Authentication failed")
        return
    }

    customerStore.customer = customer

    await assignCustomerToCart(cartStore)

    await router.push("/")
}

const handleSocialLogin = async (provider: string) => {
    try {
        const result = await fetch(`/api/social/${provider}`, {
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
                <div class="mx-auto form-wrapper">
                    <h4 class="mb-4">Log in</h4>
                    <button class="external-login-link w-100 border-0 bg-transparent mb-4" @click="handleSocialLogin('google')">
                        <div class="external-login-block-no-shop">
                            <NuxtImg src="/images/google_login_icon.svg" width="24" height="24" alt="Google login icon" loading="lazy" />
                            <p class="ps-3">Log in with Google</p>
                        </div>
                    </button>
                    <div class="signin-form">
                        <form id="loginForm" @submit="(e) => handleLogin(e)">
                            <div class="form-group mb-3">
                                <input id="loginEmail" type="email" class="form-control" placeholder="E-mail" name="email" />
                            </div>

                            <div class="form-group mb-3">
                                <input type="password" class="form-control loginPassword" placeholder="Password" name="password" />
                            </div>
                            <NuxtLink to="#" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">Forgot password?</NuxtLink>
                            <button type="submit" class="btn btn-primary w-100 text-center mt-4">Log in</button>
                        </form>
                    </div>
                    <PasswordResetModal />
                    <p class="mb-0 mt-4 tag-14 text-lg-center text-left">
                        Don't have an account? Register <NuxtLink to="/register">here</NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
