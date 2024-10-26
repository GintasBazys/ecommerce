<script setup lang="ts">
import { useCustomerStore } from "~/stores/customer"

definePageMeta({
    layout: "account"
})

const router = useRouter()
const customerStore = useCustomerStore()

const handleLogout = async () => {
    const response = await $fetch("/api/logout")
    await router.push(response.redirectUrl)
    customerStore.$patch({ customer: null })
}
</script>

<template>
    <section class="spacer">
        <div class="container">
            <button class="btn btn-primary" @click="handleLogout">Log out</button>
        </div>
    </section>
</template>
