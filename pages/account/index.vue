<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()

const handleLogout = async () => {
    try {
        const response = await fetch("/api/logout", {
            method: "DELETE",
            credentials: "include"
        })

        if (response) {
            customerStore.$patch({ customer: null })
            await router.push("/")
        }
    } catch (error) {
        console.error("Logout failed:", error)
    }
}
</script>

<template>
    <section class="spacer">
        <div class="container">
            <button class="btn btn-primary" @click="handleLogout">Log out</button>
        </div>
    </section>
</template>
