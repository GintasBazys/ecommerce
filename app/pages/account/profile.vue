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
    <div class="profileContent">
        <section class="profileContent__stats">
            <div class="profileContent__statCard">
                <span class="profileContent__statLabel">Account email</span>
                <strong class="profileContent__statValue">{{ customer?.email || "Saved to your account" }}</strong>
            </div>
            <div class="profileContent__statCard">
                <span class="profileContent__statLabel">Customer name</span>
                <strong class="profileContent__statValue">
                    {{ customerData.first_name || "First" }} {{ customerData.last_name || "Last" }}
                </strong>
            </div>
        </section>
        <section class="profileContent__panel">
            <h2 class="profileContent__title">Profile details</h2>
            <p class="profileContent__text">Update the core information attached to your account.</p>
            <VForm ref="formRef" class="profileContent__form" @submit.prevent="onSubmit">
                <div class="profileContent__grid">
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
                <div class="profileContent__grid">
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
.profileContent {
    display: grid;
    gap: 1.25rem;
}

.profileContent__stats,
.profileContent__grid {
    display: grid;
    gap: 1rem;
}

.profileContent__stats,
.profileContent__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
}

.profileContent__statCard,
.profileContent__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.4rem;
    background: rgba(247, 250, 255, 0.92);
}

.profileContent__statCard {
    display: grid;
    gap: 0.2rem;
    padding: 1rem 1.1rem;
}

.profileContent__statLabel,
.profileContent__text {
    color: #4b5874;
}

.profileContent__statLabel {
    font-size: 0.88rem;
}

.profileContent__statValue,
.profileContent__title {
    color: #08173f;
}

.profileContent__panel {
    padding: 1.35rem;
}

.profileContent__title {
    margin: 0 0 0.5rem;
    font-size: 1.45rem;
}

.profileContent__text {
    margin: 0;
    line-height: 1.7;
}

.profileContent__form {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
}

@media screen and (max-width: 900px) {
    .profileContent__stats,
    .profileContent__grid {
        grid-template-columns: 1fr;
    }
}
</style>
