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
    <section class="reset-page">
        <div class="reset-page__hero">
            <VContainer class="reset-page__container">
                <div class="reset-page__grid">
                    <div class="reset-page__copy">
                        <span class="reset-page__eyebrow">Secure your account</span>
                        <h1 class="reset-page__title">Choose a new password and get back to shopping.</h1>
                        <p class="reset-page__description">
                            Create fresh account access here, then head back into your profile, saved details, and upcoming checkout.
                        </p>
                        <div class="reset-page__stat-card">
                            <span class="reset-page__stat-label">Next step</span>
                            <strong class="reset-page__stat-value">
                                Once your password is updated, you will be redirected to sign in again with the new details.
                            </strong>
                        </div>
                    </div>
                    <div class="reset-page__panel">
                        <span class="reset-page__section-eyebrow">Reset password</span>
                        <h2 class="reset-page__section-title">Set a new password.</h2>
                        <p class="reset-page__section-text">
                            Use a password you have not used before so the account feels secure from the next sign-in onward.
                        </p>
                        <VForm class="reset-page__form" @submit.prevent="handleSubmit">
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
.reset-page {
    background:
        radial-gradient(circle at top left, rgba(1, 12, 128, 0.08), transparent 24%),
        linear-gradient(180deg, #f6f9ff 0%, #ffffff 40%, #f7faff 100%);
}

.reset-page__hero {
    padding: 6.5rem 0 6rem;
}

.reset-page__container {
    position: relative;
    z-index: 1;
}

.reset-page__grid {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(19rem, 0.95fr);
    gap: 2rem;
    align-items: center;
}

.reset-page__copy,
.reset-page__panel {
    animation: reset-rise 0.8s ease both;
}

.reset-page__panel {
    animation-delay: 0.12s;
}

.reset-page__eyebrow,
.reset-page__section-eyebrow {
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

.reset-page__title,
.reset-page__section-title {
    color: #08173f;
    letter-spacing: -0.06rem;
    text-wrap: balance;
}

.reset-page__title {
    max-width: 11ch;
    margin: 1rem 0;
    font-size: 4.5rem;
    line-height: 0.95;
}

.reset-page__description,
.reset-page__section-text {
    margin: 0;
    color: #4b5874;
    line-height: 1.75;
}

.reset-page__stat-card,
.reset-page__panel {
    border: 1px solid rgba(8, 23, 63, 0.08);
    border-radius: 1.6rem;
    background: rgba(255, 255, 255, 0.84);
    box-shadow: 0 18px 48px rgba(8, 27, 90, 0.08);
    backdrop-filter: blur(14px);
}

.reset-page__stat-card {
    display: grid;
    gap: 0.2rem;
    max-width: 27rem;
    margin-top: 1.75rem;
    padding: 0.9rem 1.05rem;
}

.reset-page__stat-label {
    color: #6a7590;
    font-size: 0.88rem;
}

.reset-page__stat-value {
    color: #08173f;
    font-size: 1rem;
    line-height: 1.45;
}

.reset-page__panel {
    padding: 1.9rem;
}

.reset-page__section-eyebrow {
    margin-bottom: 1rem;
}

.reset-page__section-title {
    margin: 0 0 0.75rem;
    font-size: 2.2rem;
    line-height: 1.08;
}

.reset-page__form {
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
    .reset-page__hero {
        padding: 5.5rem 0 5rem;
    }

    .reset-page__grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .reset-page__title {
        max-width: 100%;
        font-size: 3.5rem;
    }

    .reset-page__section-title {
        font-size: 1.9rem;
    }

    .reset-page__panel {
        padding: 1.6rem;
    }
}

@media screen and (max-width: 700px) {
    .reset-page__hero {
        padding: 3.75rem 0 3.5rem;
    }

    .reset-page__title {
        font-size: 2.8rem;
        line-height: 1;
    }

    .reset-page__section-title {
        font-size: 1.6rem;
    }

    .reset-page__stat-card,
    .reset-page__panel {
        border-radius: 1.2rem;
    }

    .reset-page__panel {
        padding: 1.4rem;
    }
}

@media (prefers-reduced-motion: reduce) {
    .reset-page__copy,
    .reset-page__panel {
        animation: none;
    }
}
</style>
