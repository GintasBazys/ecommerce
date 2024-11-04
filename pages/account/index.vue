<script setup lang="ts">
definePageMeta({
    layout: "account"
})
const router = useRouter()

const customerStore = useCustomerStore()

const handleLogout = async () => {
    window.localStorage.removeItem("jwtToken")
    customerStore.$patch({ customer: null })
    await router.push("/")
}
</script>

<template>
    <section class="spacer">
        <div class="container">
            <button class="btn btn-primary" @click="handleLogout">Log out</button>
        </div>
    </section>
</template>
