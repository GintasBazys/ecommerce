<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const runtimeConfig = useRuntimeConfig()

const token = encodeURIComponent((route.query.token as string) || "")
const email = encodeURIComponent((route.query.email as string) || "")
const password = ref<string>("")
const errorMessage = ref<string>("")
const successMessage = ref<string>("")

async function handleSubmit(): Promise<void> {
    if (!password.value) {
        errorMessage.value = "Password is required"
        return
    }

    try {
        const res = await fetch(`${runtimeConfig.public.MEDUSA_URL}/auth/customer/emailpass/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                email,
                password: password.value
            })
        })

        if (!res.ok) {
            throw new Error("Failed to reset password")
        }

        const { success } = await res.json()

        if (success) {
            successMessage.value = "Password reset successfully!"
            setTimeout(() => router.push("/signin"), 1500)
        } else {
            errorMessage.value = "Couldn't reset password"
        }
    } catch (err) {
        console.error(err)
        errorMessage.value = "Error resetting password. Please try again."
    }
}
</script>

<template>
    <section class="resetPage">
        <div class="resetPage__hero">
            <VContainer class="resetPage__container">
                <div class="resetPage__grid">
                    <div class="resetPage__copy">
                        <span class="resetPage__eyebrow">Secure your account</span>
                        <h1 class="resetPage__title">Choose a new password and get back to shopping.</h1>
                        <p class="resetPage__description">
                            Create fresh account access here, then head back into your profile, saved details, and upcoming checkout.
                        </p>
                        <div class="resetPage__statCard">
                            <span class="resetPage__statLabel">Next step</span>
                            <strong class="resetPage__statValue"
                            >Once your password is updated, you will be redirected to sign in again with the new details.</strong
                            >
                        </div>
                    </div>
                    <div class="resetPage__panel">
                        <span class="resetPage__sectionEyebrow">Reset password</span>
                        <h2 class="resetPage__sectionTitle">Set a new password.</h2>
                        <p class="resetPage__sectionText">
                            Use a password you have not used before so the account feels secure from the next sign-in onward.
                        </p>
                        <VForm class="resetPage__form" @submit.prevent="handleSubmit">
                            <VTextField
                                v-model="password"
                                type="password"
                                label="New password"
                                placeholder="Enter your new password"
                                required
                                variant="outlined"
                            />
                            <VBtn color="primary" rounded="pill" class="text-none" type="submit" block>Reset password</VBtn>
                        </VForm>
                        <VAlert v-if="errorMessage" type="error" variant="tonal" class="mt-4">
                            {{ errorMessage }}
                        </VAlert>
                        <VAlert v-if="successMessage" type="success" variant="tonal" class="mt-4">
                            {{ successMessage }}
                        </VAlert>
                    </div>
                </div>
            </VContainer>
        </div>
    </section>
</template>

<style scoped lang="scss">
.resetPage {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.resetPage__hero {
    padding: clamp(4.75rem, 7vw, 6.5rem) 0 clamp(4rem, 7vw, 6rem);
}

.resetPage__container {
    position: relative;
    z-index: 1;
}

.resetPage__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(19rem, 0.95fr);
    gap: clamp(1.5rem, 3vw, 2rem);
    align-items: center;
}

.resetPage__copy,
.resetPage__panel {
    animation: reset-rise 0.8s ease both;
}

.resetPage__panel {
    animation-delay: 0.12s;
}

.resetPage__eyebrow,
.resetPage__sectionEyebrow {
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

.resetPage__title,
.resetPage__sectionTitle {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.resetPage__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: clamp(2.4rem, 4.4vw, 4.5rem);
    line-height: 0.95;
}

.resetPage__description,
.resetPage__sectionText {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.resetPage__statCard,
.resetPage__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.resetPage__statCard {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.resetPage__statLabel {
    color: #6a7590;
    font-size: 0.88rem;
}

.resetPage__statValue {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.resetPage__panel {
    padding: clamp(1.4rem, 2vw, 1.9rem);
}

.resetPage__sectionEyebrow {
    margin-bottom: 1rem;
}

.resetPage__sectionTitle {
    margin: 0 0 0.75rem;
    font-size: clamp(1.6rem, 2.4vw, 2.2rem);
    line-height: 1.08;
}

.resetPage__form {
    display: grid;
    gap: 0.9rem;
    margin-top: 1.35rem;
}

@keyframes reset-rise {
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
    .resetPage__grid {
        grid-template-columns: 1fr;
    }

    .resetPage__title {
        max-width: 100%;
    }
}

@media screen and (max-width: 700px) {
    .resetPage__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .resetPage__title {
        font-size: clamp(2rem, 9vw, 2.8rem);
        line-height: 1;
    }

    .resetPage__statCard,
    .resetPage__panel {
        border-radius: 1.2rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .resetPage__copy,
    .resetPage__panel {
        animation: none;
    }
}
</style>
