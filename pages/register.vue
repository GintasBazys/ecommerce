<script setup lang="ts">
import { useRouter } from "vue-router"
import { useCustomerStore } from "~/stores/customer"
import type { CustomerResponseInterface } from "~/utils/interfaces"

useHead({
    title: "Register | Ecommerce"
})

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()
const config = useRuntimeConfig()

const handleRegister = async (e: Event) => {
    e.preventDefault()

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const first_name = formData.get("firstName") as string
    const last_name = formData.get("lastName") as string

    try {
        const response = await $fetch<CustomerResponseInterface>("/api/register", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({ email, password, first_name, last_name })
        })
        customerStore.customer = response.customer

        await router.push("/")
    } catch (error) {
        console.error("Register failed:", error)
        alert("Register failed. Please check your credentials or try again later.")
    }
}
</script>

<template>
    <section class="spacer">
        <div class="row justify-content-center m-0">
            <div class="col-12">
                <div class="mx-auto" style="max-width: 24.625rem; width: 100%">
                    <h4 class="mb-4 mb-lg-5">Register</h4>
                    <div class="signin-form">
                        <form id="loginForm" @submit="handleRegister">
                            <div class="form-group mb-3">
                                <input id="firstName" type="text" class="form-control" placeholder="First name*" name="firstName" />
                            </div>
                            <div class="form-group mb-3">
                                <input id="registerSurname" type="text" class="form-control" placeholder="Last name*" name="lastName" />
                            </div>
                            <div class="form-group mb-3">
                                <input id="loginEmail" type="email" class="form-control" placeholder="E-mail" name="email" />
                            </div>

                            <div class="form-group">
                                <input type="password" class="form-control loginPassword" placeholder="Password" name="password" />
                            </div>
                            <button type="submit" class="btn btn-primary w-100 text-center mt-4">Register</button>
                        </form>
                    </div>
                    <p class="mb-0 mt-4 tag-14 text-lg-center text-left">
                        Already hav an account an account? Login <NuxtLink href="/signin">here</NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>
