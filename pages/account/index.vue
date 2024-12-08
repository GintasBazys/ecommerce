<script setup lang="ts">
definePageMeta({
    layout: "account"
})
const router = useRouter()

const customerStore = useCustomerStore()
const cartStore = useCartStore()

const handleLogout = async () => {
    const response = await $fetch("/api/logout", { method: "POST" })
    if (response.success) {
        await createNewCart(cartStore)
        customerStore.$patch({ customer: null })
        await router.push("/")
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
