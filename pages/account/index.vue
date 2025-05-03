<script setup lang="ts">
definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({
    title: "Account | Ecommerce"
})
const router = useRouter()

const customerStore = useCustomerStore()

const handleLogout = async () => {
    const response = await $fetch("/api/logout", { method: "POST" })
    if (response.success) {
        customerStore.$patch({ customer: null })
        await router.push("/")
    }
}
</script>

<template>
    <section class="spacer">
        <div class="container">
            <button class="btn btn-primary" @click="handleLogout">Log out</button>
            <NuxtLink to="/account/orders">Orders</NuxtLink>
        </div>
    </section>
</template>
