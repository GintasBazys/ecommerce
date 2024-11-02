<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()

const handleLogout = async () => {
    try {
        const response = await $fetch("/api/logout")
        if (response) {
            await router.push("/")
        }
        customerStore.$patch({ customer: null })
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
