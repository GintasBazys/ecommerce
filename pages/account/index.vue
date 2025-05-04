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
    const response = await $fetch("/api/account/logout", { method: "POST" })
    if (response.success) {
        customerStore.$patch({ customer: null })
        await router.push("/")
    }
}
</script>

<template>
    <VContainer class="py-10 mt-10">
        <VRow justify="center">
            <VCol cols="12" md="6">
                <VCard class="pa-6" elevation="2" rounded="2xl">
                    <h2 class="text-h5 font-weight-bold mb-4">Account Dashboard</h2>

                    <VBtn color="info" class="mb-4" variant="outlined" to="/account/profile" block> View Profile </VBtn>
                    <VBtn color="accent" class="mb-4" variant="outlined" to="/account/address" block> View Addresses </VBtn>
                    <VBtn color="secondary" class="mb-4" variant="outlined" to="/account/orders" block> View Orders </VBtn>
                    <VBtn color="primary" @click="handleLogout" block> Log Out </VBtn>
                </VCard>
            </VCol>
        </VRow>
    </VContainer>
</template>
