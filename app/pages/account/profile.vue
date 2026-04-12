<script setup lang="ts">
import type { APIError, Customer } from "@/types/interfaces"
import type { VForm } from "~/types/interfaces"

definePageMeta({
    layout: "account",
    middleware: ["auth"]
})

useHead({ title: "Profile | Ecommerce" })

const customerStore = useCustomerStore()
const { customer } = storeToRefs(customerStore)

const customerData = reactive<Customer>({
    first_name: customer.value?.first_name ?? "",
    last_name: customer.value?.last_name ?? "",
    phone: customer.value?.phone ?? "",
    company_name: customer.value?.company_name ?? ""
})

const formRef = ref<VForm | null>(null)
const snackbar = ref(false)
const snackbarText = ref("")
const snackbarColor = ref("success")

const rules = {
    required: (value: unknown) => !!value || "This field is required"
}

async function onSubmit(): Promise<void> {
    const validation = await formRef.value?.validate()
    if (!validation?.valid) {
        return
    }

    try {
        await $fetch("/api/account/update-customer", {
            method: "POST",
            body: customerData,
            credentials: "include"
        })

        customerStore.$patch((state) => {
            if (!state.customer) {
                return
            }

            state.customer.first_name = customerData.first_name
            state.customer.last_name = customerData.last_name
            state.customer.phone = customerData.phone
            state.customer.company_name = customerData.company_name
        })

        snackbarText.value = "Profile updated!"
        snackbarColor.value = "success"
        snackbar.value = true
    } catch (error: unknown) {
        const apiError = error as APIError
        snackbarText.value = apiError.data?.message || "Update failed"
        snackbarColor.value = "error"
        snackbar.value = true
    }
}
</script>

<template>
    <div class="profile-content">
        <section class="profile-content__stats">
            <div class="profile-content__stat-card">
                <span class="profile-content__stat-label">Account email</span>
                <strong class="profile-content__stat-value">{{ customer?.email || "Saved to your account" }}</strong>
            </div>
            <div class="profile-content__stat-card">
                <span class="profile-content__stat-label">Customer name</span>
                <strong class="profile-content__stat-value">
                    {{ customerData.first_name || "First" }} {{ customerData.last_name || "Last" }}
                </strong>
            </div>
        </section>
        <section class="profile-content__panel">
            <h2 class="profile-content__title">Profile details</h2>
            <p class="profile-content__text">Update the core information attached to your account.</p>
            <VForm ref="formRef" class="profile-content__form" @submit.prevent="onSubmit">
                <div class="profile-content__grid">
                    <VTextField
                        v-model="customerData.first_name"
                        label="First name"
                        :rules="[rules.required]"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                    />
                    <VTextField
                        v-model="customerData.last_name"
                        label="Last name"
                        :rules="[rules.required]"
                        prepend-inner-icon="mdi-account-outline"
                        variant="outlined"
                    />
                </div>
                <div class="profile-content__grid">
                    <VTextField v-model="customerData.phone" label="Phone" prepend-inner-icon="mdi-phone-outline" variant="outlined" />
                    <VTextField
                        v-model="customerData.company_name"
                        label="Company name"
                        prepend-inner-icon="mdi-domain"
                        variant="outlined"
                    />
                </div>
                <VBtn type="submit" color="primary" rounded="pill" class="text-none px-7">Save changes</VBtn>
            </VForm>
        </section>
        <VSnackbar v-model="snackbar" timeout="3000" :color="snackbarColor" location="top">
            {{ snackbarText }}
        </VSnackbar>
    </div>
</template>

<style scoped lang="scss">
.profile-content {
    display: grid;
    gap: 1.25rem;
}

.profile-content__stats,
.profile-content__grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.profile-content__stat-card,
.profile-content__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(247, 250, 255, 0.92);
}

.profile-content__stat-card {
    display: grid;
    gap: 0.2rem;
    padding: 1rem 1.1rem;
}

.profile-content__stat-label,
.profile-content__text {
    color: #4b5874;
}

.profile-content__stat-label {
    font-size: 0.88rem;
}

.profile-content__stat-value,
.profile-content__title {
    color: #08173f;
}

.profile-content__panel {
    padding: 1.35rem;
}

.profile-content__title {
    margin: 0 0 0.5rem;
    font-size: 1.45rem;
}

.profile-content__text {
    margin: 0;
    line-height: 1.7;
}

.profile-content__form {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

@media screen and (max-width: 900px) {
    .profile-content__stats,
    .profile-content__grid {
        grid-template-columns: 1fr;
    }
}
</style>
