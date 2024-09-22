<script setup lang="ts">
import { useRouter } from "vue-router"
import { useCustomerStore } from "~/stores/customer"
import type { CustomerResponseInterface } from "~/utils/interfaces"
import PasswordResetModal from "~/components/Modals/PasswordResetModal.vue"

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
        const response = await $fetch<CustomerResponseInterface>("/api/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        })
        customerStore.customer = response.customer
        await router.push("/")
    } catch (error) {
        console.error("Login failed:", error)
        alert("Login failed. Please check your credentials or try again later.")
    }
}
</script>

<template>
    <section class="spacer">
        <div class="row justify-content-center m-0">
            <div class="col-12">
                <div class="mx-auto" style="max-width: 24.625rem; width: 100%">
                    <h4 class="mb-4 mb-lg-5">Log in</h4>
                    <NuxtLink class="external-login-link" href="/google">
                        <div class="external-login-block-no-shop">
                            <NuxtImg src="/images/google_login_icon.svg" width="24" height="24" alt="Google login icon" loading="lazy" />
                            <p class="ps-3">Log in with Google</p>
                        </div>
                    </NuxtLink>
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
                                <input id="loginEmail" type="email" class="form-control" placeholder="E-mail" name="email" >
                            </div>

                            <div class="form-group mb-3">
                                <input type="password" class="form-control loginPassword" placeholder="Password" name="password" >
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
