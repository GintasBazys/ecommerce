<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"

const router = useRouter()
const customerStore = useCustomerStore()

const handleLogout = async () => {
    const response = await $fetch("/api/logout")
    customerStore.$patch({ customer: null })
    await router.push(response.redirectUrl)
}
</script>

<template>
    <section class="spacer">
        <div class="container">
            <button class="btn btn-primary" @click="handleLogout">Log out</button>
        </div>
    </section>
</template>
