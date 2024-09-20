<script setup lang="ts">
import { useRouter } from "vue-router"
import { useCustomerStore } from "~/stores/customer"

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
        const response = await $fetch("/api/login", {
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
                            <div class="form-group">
                                <input id="loginEmail" type="email" class="form-control" placeholder="E-mail" name="email" />
                            </div>

                            <div class="form-group">
                                <input type="password" class="form-control loginPassword" placeholder="Password" name="password" />
                            </div>
                            <a href="#" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">Forgot password?</a>
                            <button type="submit" class="btn btn-primary w-100 text-center mt-4">Log in</button>
                        </form>
                    </div>
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
                                <h2>Forgot password?</h2>
                                <div class="panel panel-default">
                                    <div class="panel-body">
                                        <div>
                                            <p class="p-0 m-0">If you have forgotten your password you can reset it here.</p>
                                            <div class="panel-body password-form">
                                                <form class="needs-validation">
                                                    <div class="form-group">
                                                        <input
                                                            class="form-control mt-3"
                                                            placeholder="E-mail Address"
                                                            type="email"
                                                            required
                                                            name="email"
                                                        />
                                                    </div>
                                                    <button class="btn go-back-btn mt-3" type="submit">Send password reset link</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p class="mb-0 mt-4 tag-14 text-lg-center text-left">
                        Don't have an account? Register <NuxtLink href="/register">here</NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
