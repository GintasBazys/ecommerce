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
    <main class="registerPage">
        <div class="registerPage__hero">
            <VContainer class="registerPage__container">
                <div class="registerPage__grid">
                    <div class="registerPage__copy">
                        <span class="registerPage__eyebrow">Create an account</span>
                        <h1 class="registerPage__title">Join the shop and keep every order detail in one calm place.</h1>
                        <p class="registerPage__description">
                            Save your profile, move through checkout faster, and make future orders feel easier from the very first click.
                        </p>

                        <div class="registerPage__statCard">
                            <span class="registerPage__statLabel">Why create one?</span>
                            <strong class="registerPage__statValue"
                            >Saved customer details, easier reorders, and a smoother path from cart to delivery</strong
                            >
                        </div>
                    </div>

                    <div class="registerPage__panel">
                        <span class="registerPage__sectionEyebrow">Account details</span>
                        <h2 class="registerPage__sectionTitle">Set up your profile in a minute.</h2>
                        <p class="registerPage__sectionText">
                            Add your basic information and choose a password to start shopping with a saved account.
                        </p>

                        <VForm ref="registerFormRef" class="registerPage__form" @submit.prevent="handleRegister">
                            <div class="registerPage__nameGrid">
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

                        <p class="registerPage__footerText">
                            Already have an account?
                            <NuxtLink to="/signin" class="registerPage__link">Login here</NuxtLink>
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
.registerPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.registerPage__hero {
    padding: 0 0 clamp(4rem, 7vw, 6rem);
}

.registerPage__container {
    position: relative;
    z-index: 1;
}

.registerPage__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) minmax(19rem, 0.92fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: center;
}

.registerPage__copy,
.registerPage__panel {
    animation: register-rise 0.8s ease both;
}

.registerPage__panel {
    animation-delay: 0.12s;
}

.registerPage__eyebrow,
.registerPage__sectionEyebrow {
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

.registerPage__title,
.registerPage__sectionTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.registerPage__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.registerPage__description,
.registerPage__sectionText,
.registerPage__footerText {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.registerPage__statCard,
.registerPage__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.registerPage__statCard {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.registerPage__statLabel {
    color: #6a7590;
    font-size: 0.88rem;
}

.registerPage__statValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.registerPage__panel {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.registerPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.registerPage__sectionTitle {
    margin: 0 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.registerPage__form {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.35rem;
}

.registerPage__nameGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.9rem;
}

.registerPage__footerText {
    margin-top: 1.25rem;
    text-align: center;
}

.registerPage__link {
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
    .registerPage__grid {
        grid-template-columns: 1fr;
    }

    .registerPage__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 700px) {
    .registerPage__hero {
        padding: 0 0 3.5rem;
    }

    .registerPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .registerPage__panel,
    .registerPage__statCard {
        border-radius: 1.2rem;
    }

    .registerPage__nameGrid {
        grid-template-columns: 1fr;
    }
}

@media (prefers-reduced-motion: reduce) {
    .registerPage__copy,
    .registerPage__panel {
        animation: none;
    }
}
</style>
