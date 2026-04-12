<script setup lang="ts">
import type { CustomerResponseInterface } from "@/types/interfaces"
import type { VForm } from "~/types/interfaces"

useHead({
    title: "Register | Ecommerce"
})

definePageMeta({
    layout: "default"
})

const router = useRouter()
const config = useRuntimeConfig()

const registerFormRef = ref<VForm | null>(null)
const snackbar = ref<boolean>(false)
const snackbarText = ref<string>("")
const snackbarColor = ref<string>("success")

const firstName = ref<string>("")
const lastName = ref<string>("")
const email = ref<string>("")
const password = ref<string>("")

const requiredRule = (field: string) => (v: string) => !!v || `${field} is required`
const nameRules = [requiredRule("First name"), requiredRule("Last name")]
const emailRules = [requiredRule("E-mail"), (v: string) => /.+@.+\..+/.test(v) || "E-mail must be valid"]
const passwordRules = [
    (v: string) => !!v || "Password is required",
    (v: string) => (v && v.length >= 6) || "Password must be at least 6 characters"
]

async function handleRegister(): Promise<void> {
    const result = await registerFormRef.value?.validate()
    if (result && !result.valid) {
        return
    }

    try {
        const response = await $fetch<CustomerResponseInterface>("/api/account/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-publishable-api-key": config.public.PUBLISHABLE_KEY
            },
            body: JSON.stringify({
                email: email.value,
                password: password.value,
                first_name: firstName.value,
                last_name: lastName.value
            })
        })
        useCustomerStore().customer = response.customer
        await router.push("/")
    } catch (error) {
        console.error("Register failed:", error)
        snackbarText.value = "Register failed. Please check your details and try again."
        snackbarColor.value = "error"
        snackbar.value = true
    }
}
</script>

<template>
    <main class="register-page">
        <div class="register-page__hero">
            <VContainer class="register-page__container">
                <div class="register-page__grid">
                    <div class="register-page__copy">
                        <span class="register-page__eyebrow">Create an account</span>
                        <h1 class="register-page__title">Join the shop and keep every order detail in one calm place.</h1>
                        <p class="register-page__description">
                            Save your profile, move through checkout faster, and make future orders feel easier from the very first click.
                        </p>

                        <div class="register-page__stat-card">
                            <span class="register-page__stat-label">Why create one?</span>
                            <strong class="register-page__stat-value">
                                Saved customer details, easier reorders, and a smoother path from cart to delivery
                            </strong>
                        </div>
                    </div>

                    <div class="register-page__panel">
                        <span class="register-page__section-eyebrow">Account details</span>
                        <h2 class="register-page__section-title">Set up your profile in a minute.</h2>
                        <p class="register-page__section-text">
                            Add your basic information and choose a password to start shopping with a saved account.
                        </p>

                        <VForm ref="registerFormRef" class="register-page__form" @submit.prevent="handleRegister">
                            <div class="register-page__name-grid">
                                <VTextField
                                    v-model="firstName"
                                    name="firstName"
                                    label="First name"
                                    :rules="nameRules[0] ? [nameRules[0]] : []"
                                    required
                                    variant="outlined"
                                />
                                <VTextField
                                    v-model="lastName"
                                    name="lastName"
                                    label="Last name"
                                    :rules="nameRules[1] ? [nameRules[1]] : []"
                                    required
                                    variant="outlined"
                                />
                            </div>
                            <VTextField
                                v-model="email"
                                name="email"
                                label="E-mail"
                                type="email"
                                :rules="emailRules"
                                required
                                variant="outlined"
                            />
                            <VTextField
                                v-model="password"
                                name="password"
                                label="Password"
                                type="password"
                                :rules="passwordRules"
                                required
                                variant="outlined"
                            />
                            <VBtn type="submit" color="primary" rounded="pill" class="text-none" block>Register</VBtn>
                        </VForm>

                        <p class="register-page__footer-text">
                            Already have an account?
                            <NuxtLink to="/signin" class="register-page__link">Login here</NuxtLink>
                        </p>
                    </div>
                </div>
            </VContainer>
        </div>

        <VSnackbar v-model="snackbar" :color="snackbarColor" location="top" timeout="4000">
            {{ snackbarText }}
        </VSnackbar>
    </main>
</template>

<style scoped lang="scss">
.register-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.register-page__hero {
    padding: 0 0 4rem;
}

.register-page__container {
    position: relative;
    z-index: 1;
}

.register-page__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(19rem, 0.92fr);
    gap: 1.5rem;
    align-items: center;
}

.register-page__copy,
.register-page__panel {
    animation: register-rise 0.8s ease both;
}

.register-page__panel {
    animation-delay: 0.12s;
}

.register-page__eyebrow,
.register-page__section-eyebrow {
    display: inline-flex;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    background: rgba(1, 12, 128, 0.07);
    color: #010c80;
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.register-page__title,
.register-page__section-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.register-page__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: 2.75rem;
    line-height: 0.95;
}

.register-page__description,
.register-page__section-text,
.register-page__footer-text {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.register-page__stat-card,
.register-page__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.register-page__stat-card {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.register-page__stat-label {
    color: #6a7590;
    font-size: 0.88rem;
}

.register-page__stat-value {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.register-page__panel {
    padding: 1.4rem;
}

.register-page__section-eyebrow {
    margin-bottom: 1rem;
}

.register-page__section-title {
    margin: 0 0 0.75rem;
    font-size: 1.75rem;
    line-height: 1.08;
}

.register-page__form {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.35rem;
}

.register-page__name-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
}

.register-page__footer-text {
    margin-top: 1.25rem;
    text-align: center;
}

.register-page__link {
    color: #010c80;
    font-weight: 700;
}

@keyframes register-rise {
    from {
        opacity: 0;
        transform: translateY(26px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media screen and (max-width: 1100px) {
    .register-page__grid {
        grid-template-columns: 1fr;
    }

    .register-page__title {
        max-width: 100%;
    }
}

@media screen and (min-width: 701px) {
    .register-page__hero {
        padding-bottom: 5rem;
    }

    .register-page__grid {
        gap: 2rem;
    }

    .register-page__panel {
        padding: 1.75rem;
    }

    .register-page__title {
        font-size: 3.5rem;
    }

    .register-page__section-title {
        font-size: 2rem;
    }
}

@media screen and (max-width: 700px) {
    .register-page__hero {
        padding: 0 0 3.5rem;
    }

    .register-page__title {
        font-size: 2.4rem;
        line-height: 1;
    }

    .register-page__panel,
    .register-page__stat-card {
        border-radius: 1.2rem;
    }

    .register-page__name-grid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    .register-page__copy,
    .register-page__panel {
        animation: none;
    }
}
</style>
